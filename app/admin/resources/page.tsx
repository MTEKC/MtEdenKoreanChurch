'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  FileUp,
  Loader2,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import AuthGuard from '@/components/AuthGuard';
import { auth, db } from '@/lib/firebase';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const categories = ['주보', '교육·양육', '행사 자료', '신청서·서식'];

interface UploadedDocument {
  publicId: string;
  secureUrl: string;
  bytes?: number;
  format?: string;
  originalFilename?: string;
}

interface ResourceItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  date?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  filePublicId?: string;
  createdAt?: Timestamp;
}

interface StatusMessage {
  type: 'success' | 'warning' | 'error';
  message: string;
}

interface EditForm {
  title: string;
  category: string;
  description: string;
  date: string;
}

async function uploadDocument(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/cloudinary/documents/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || 'PDF 업로드에 실패했습니다.');
  }

  return response.json() as Promise<UploadedDocument>;
}

async function removeUploadedDocument(publicId: string, token: string) {
  const response = await fetch('/api/cloudinary/documents/delete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || '저장소의 PDF 삭제에 실패했습니다.');
  }
}

function formatFileSize(bytes?: number) {
  if (!bytes) {
    return 'PDF';
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function statusClassName(type: StatusMessage['type']) {
  if (type === 'success') {
    return 'border-green-600 bg-green-50 text-green-800';
  }

  if (type === 'warning') {
    return 'border-amber-500 bg-amber-50 text-amber-900';
  }

  return 'border-red-600 bg-red-50 text-red-800';
}

export default function AdminResourcesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState(false);
  const [managementStatus, setManagementStatus] = useState<StatusMessage | null>(null);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    category: categories[0],
    description: '',
    date: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const resourcesQuery = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));

    return onSnapshot(
      resourcesQuery,
      (snapshot) => {
        setResources(snapshot.docs.map((resource) => ({
          id: resource.id,
          ...resource.data(),
        })) as ResourceItem[]);
        setResourcesLoading(false);
        setResourcesError(false);
      },
      () => {
        setResourcesError(true);
        setResourcesLoading(false);
      }
    );
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setStatus(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setFile(null);
      event.target.value = '';
      setStatus({ type: 'error', message: 'PDF 파일만 선택할 수 있습니다.' });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      event.target.value = '';
      setStatus({ type: 'error', message: '파일 크기는 10MB 이하여야 합니다.' });
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (!file) {
      setStatus({ type: 'error', message: '업로드할 PDF 파일을 선택해 주세요.' });
      return;
    }

    setLoading(true);
    let token = '';
    let uploadedDocument: UploadedDocument | null = null;

    try {
      token = await auth.currentUser?.getIdToken() || '';
      if (!token) {
        throw new Error('다시 로그인한 후 업로드해 주세요.');
      }

      uploadedDocument = await uploadDocument(file, token);

      await addDoc(collection(db, 'resources'), {
        title: title.trim(),
        category,
        description: description.trim(),
        date,
        fileUrl: uploadedDocument.secureUrl,
        fileName: uploadedDocument.originalFilename || file.name,
        fileSize: uploadedDocument.bytes || file.size,
        filePublicId: uploadedDocument.publicId,
        fileProvider: 'cloudinary',
        createdAt: serverTimestamp(),
      });

      setStatus({ type: 'success', message: '자료실에 PDF를 등록했습니다.' });
      setTitle('');
      setCategory(categories[0]);
      setDescription('');
      setDate('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      if (uploadedDocument && token) {
        await removeUploadedDocument(uploadedDocument.publicId, token).catch(() => undefined);
      }
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '자료 등록에 실패했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (resource: ResourceItem) => {
    setManagementStatus(null);
    setEditError('');
    setEditingResource(resource);
    setEditForm({
      title: resource.title,
      category: resource.category,
      description: resource.description || '',
      date: resource.date || '',
    });
  };

  const closeEditDialog = () => {
    if (!savingEdit) {
      setEditingResource(null);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingResource || !editForm.title.trim()) {
      return;
    }

    setSavingEdit(true);
    setManagementStatus(null);
    setEditError('');

    try {
      await updateDoc(doc(db, 'resources', editingResource.id), {
        title: editForm.title.trim(),
        category: editForm.category,
        description: editForm.description.trim(),
        date: editForm.date,
        updatedAt: serverTimestamp(),
      });
      setEditingResource(null);
      setManagementStatus({ type: 'success', message: '자료 정보를 수정했습니다.' });
    } catch (error) {
      setEditError(error instanceof Error ? error.message : '자료 수정에 실패했습니다.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (resource: ResourceItem) => {
    const confirmed = window.confirm(`"${resource.title}" 자료를 삭제하시겠습니까?\n삭제한 자료는 복구할 수 없습니다.`);
    if (!confirmed) {
      return;
    }

    setDeletingId(resource.id);
    setManagementStatus(null);

    try {
      const token = await auth.currentUser?.getIdToken() || '';
      if (!token) {
        throw new Error('다시 로그인한 후 삭제해 주세요.');
      }

      await deleteDoc(doc(db, 'resources', resource.id));

      if (resource.filePublicId) {
        try {
          await removeUploadedDocument(resource.filePublicId, token);
        } catch {
          setManagementStatus({
            type: 'warning',
            message: '자료 목록에서는 삭제했지만 Cloudinary 파일 정리에 실패했습니다. Cloudinary에서 해당 파일을 확인해 주세요.',
          });
          return;
        }
      }

      setManagementStatus({ type: 'success', message: '자료를 삭제했습니다.' });
    } catch (error) {
      setManagementStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '자료 삭제에 실패했습니다.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> 관리자 화면으로
          </Link>

          <div className="mt-6">
            <p className="text-sm font-semibold text-blue-700">자료실 관리</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">PDF 자료 관리</h1>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="resource-upload-heading">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                  <FileUp className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 id="resource-upload-heading" className="text-xl font-bold text-slate-900">새 PDF 등록</h2>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-6">
                <div>
                  <label htmlFor="resource-title" className="mb-2 block text-sm font-semibold text-slate-700">제목</label>
                  <input
                    id="resource-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                    placeholder="예: 2026년 3월 첫째 주 주보"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="resource-category" className="mb-2 block text-sm font-semibold text-slate-700">분류</label>
                    <select
                      id="resource-category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                    >
                      {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="resource-date" className="mb-2 block text-sm font-semibold text-slate-700">자료 날짜 <span className="font-normal text-slate-400">(선택)</span></label>
                    <input
                      id="resource-date"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="resource-description" className="mb-2 block text-sm font-semibold text-slate-700">설명 <span className="font-normal text-slate-400">(선택)</span></label>
                  <textarea
                    id="resource-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    maxLength={500}
                    className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                    placeholder="자료에 대한 짧은 안내를 적어 주세요."
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">{description.length}/500</p>
                </div>

                <div>
                  <label htmlFor="resource-file" className="mb-2 block text-sm font-semibold text-slate-700">PDF 파일</label>
                  <input
                    ref={fileInputRef}
                    id="resource-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    required
                    className="w-full rounded-md border border-slate-300 p-2 text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-800 hover:file:bg-blue-100"
                  />
                  <p className="mt-2 text-xs text-slate-500">PDF만 가능하며 최대 파일 크기는 10MB입니다.</p>
                  {file ? <p className="mt-2 text-sm font-medium text-blue-800">선택됨: {file.name}</p> : null}
                </div>

                {status ? (
                  <p role="status" className={`border-l-4 px-4 py-3 text-sm ${statusClassName(status.type)}`}>
                    {status.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading || !file}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> 업로드 중...</> : <><FileUp className="h-5 w-5" aria-hidden="true" /> PDF 등록</>}
                </button>
              </form>
            </section>

            <section className="border border-slate-200 bg-white shadow-sm" aria-labelledby="resource-list-heading">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 id="resource-list-heading" className="text-xl font-bold text-slate-900">등록된 자료</h2>
                <p className="mt-1 text-sm text-slate-500">총 {resources.length}개</p>
              </div>

              {managementStatus ? (
                <p role="status" className={`mx-6 mt-5 border-l-4 px-4 py-3 text-sm ${statusClassName(managementStatus.type)}`}>
                  {managementStatus.message}
                </p>
              ) : null}

              {resourcesLoading ? (
                <div className="flex justify-center px-6 py-16" aria-label="등록된 자료를 불러오는 중">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
                </div>
              ) : resourcesError ? (
                <p className="m-6 border-l-4 border-red-600 bg-red-50 px-4 py-4 text-sm text-red-800">
                  자료 목록을 불러오지 못했습니다. Firestore 규칙을 확인해 주세요.
                </p>
              ) : resources.length === 0 ? (
                <p className="px-6 py-16 text-center text-sm text-slate-500">등록된 자료가 없습니다.</p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {resources.map((resource) => (
                    <article key={resource.id} className="px-6 py-5">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                          <FileText className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">{resource.category}</span>
                            {resource.date ? <span className="text-xs text-slate-500">{resource.date.replaceAll('-', '. ')}</span> : null}
                          </div>
                          <h3 className="mt-2 break-words text-base font-bold text-slate-900">{resource.title}</h3>
                          <p className="mt-1 truncate text-xs text-slate-500">{resource.fileName || 'PDF 자료'} · {formatFileSize(resource.fileSize)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-700 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" /> 보기
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditDialog(resource)}
                          disabled={deletingId === resource.id}
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-700 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" /> 수정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(resource)}
                          disabled={deletingId === resource.id}
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === resource.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                          삭제
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {editingResource ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeEditDialog();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-resource-heading"
              className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-md bg-white p-6 shadow-xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700">자료 정보</p>
                  <h2 id="edit-resource-heading" className="mt-1 text-2xl font-bold text-slate-900">자료 수정</h2>
                </div>
                <button
                  type="button"
                  onClick={closeEditDialog}
                  disabled={savingEdit}
                  title="닫기"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">닫기</span>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="edit-resource-title" className="mb-2 block text-sm font-semibold text-slate-700">제목</label>
                  <input
                    id="edit-resource-title"
                    type="text"
                    value={editForm.title}
                    onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                    maxLength={120}
                    required
                    autoFocus
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="edit-resource-category" className="mb-2 block text-sm font-semibold text-slate-700">분류</label>
                    <select
                      id="edit-resource-category"
                      value={editForm.category}
                      onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                    >
                      {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-resource-date" className="mb-2 block text-sm font-semibold text-slate-700">자료 날짜</label>
                    <input
                      id="edit-resource-date"
                      type="date"
                      value={editForm.date}
                      onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-resource-description" className="mb-2 block text-sm font-semibold text-slate-700">설명</label>
                  <textarea
                    id="edit-resource-description"
                    value={editForm.description}
                    onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                    rows={5}
                    maxLength={500}
                    className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">{editForm.description.length}/500</p>
                </div>

                {editError ? (
                  <p role="alert" className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {editError}
                  </p>
                ) : null}

                <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
                  <button
                    type="button"
                    onClick={closeEditDialog}
                    disabled={savingEdit}
                    className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit || !editForm.title.trim()}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Pencil className="h-4 w-4" aria-hidden="true" />}
                    저장
                  </button>
                </div>
              </form>
            </section>
          </div>
        ) : null}
      </main>
    </AuthGuard>
  );
}
