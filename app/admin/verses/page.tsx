'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
} from 'firebase/firestore';
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Loader2,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import AdminNotice, { AdminNoticeMessage } from '@/components/admin/AdminNotice';
import { db } from '@/lib/firebase';

interface VerseItem {
  id: string;
  title: string;
  scripture?: string;
  message?: string;
}

interface VerseForm {
  title: string;
  scripture: string;
  message: string;
}

const EMPTY_FORM: VerseForm = {
  title: '',
  scripture: '',
  message: '',
};

export default function AdminVersesPage() {
  const [form, setForm] = useState<VerseForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<AdminNoticeMessage | null>(null);
  const [items, setItems] = useState<VerseItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(false);
  const [managementNotice, setManagementNotice] = useState<AdminNoticeMessage | null>(null);
  const [editingItem, setEditingItem] = useState<VerseItem | null>(null);
  const [editForm, setEditForm] = useState<VerseForm>(EMPTY_FORM);
  const [editNotice, setEditNotice] = useState<AdminNoticeMessage | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const versesQuery = query(
      collection(db, 'verses'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      versesQuery,
      (snapshot) => {
        setItems(snapshot.docs.map((verseDoc) => ({
          id: verseDoc.id,
          ...verseDoc.data(),
        })) as VerseItem[]);
        setItemsLoading(false);
        setItemsError(false);
      },
      (error) => {
        console.error('Error loading weekly words:', error);
        setItemsLoading(false);
        setItemsError(true);
      }
    );
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploadNotice(null);
    setLoading(true);

    try {
      await addDoc(collection(db, 'verses'), {
        title: form.title.trim(),
        scripture: form.scripture.trim(),
        message: form.message.trim(),
        createdAt: serverTimestamp(),
      });

      setUploadNotice({ type: 'success', message: '주간 말씀을 등록했습니다.' });
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error('Error posting weekly word:', error);
      setUploadNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '주간 말씀 등록에 실패했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (item: VerseItem) => {
    setManagementNotice(null);
    setEditNotice(null);
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      scripture: item.scripture || '',
      message: item.message || '',
    });
  };

  const closeEditDialog = () => {
    if (!savingEdit) {
      setEditingItem(null);
      setEditNotice(null);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !editingItem
      || !editForm.title.trim()
      || !editForm.scripture.trim()
      || !editForm.message.trim()
    ) {
      setEditNotice({
        type: 'error',
        message: '제목, 성경 구절, 말씀 묵상을 모두 입력해 주세요.',
      });
      return;
    }

    setSavingEdit(true);
    setEditNotice(null);

    try {
      await updateDoc(doc(db, 'verses', editingItem.id), {
        title: editForm.title.trim(),
        scripture: editForm.scripture.trim(),
        message: editForm.message.trim(),
        updatedAt: serverTimestamp(),
      });
      setEditingItem(null);
      setManagementNotice({
        type: 'success',
        message: '주간 말씀을 수정했습니다.',
      });
    } catch (error) {
      console.error('Error updating weekly word:', error);
      setEditNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '주간 말씀 수정에 실패했습니다.',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (item: VerseItem) => {
    const confirmed = window.confirm(
      `"${item.title}" 주간 말씀을 삭제하시겠습니까?\n삭제한 말씀은 복구할 수 없습니다.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setManagementNotice(null);

    try {
      await deleteDoc(doc(db, 'verses', item.id));
      setManagementNotice({
        type: 'success',
        message: '주간 말씀을 삭제했습니다.',
      });
    } catch (error) {
      console.error('Error deleting weekly word:', error);
      setManagementNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '주간 말씀 삭제에 실패했습니다.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600"
          >
            <ArrowLeft className="h-4 w-4" /> 관리자 화면으로
          </Link>

          <div className="mb-8">
            <p className="text-sm font-semibold text-green-700">주간 말씀 관리</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">주간 말씀 관리</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b pb-4">
                <div className="rounded-lg bg-green-100 p-2">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">새 주간 말씀 등록</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="verse-title" className="mb-2 block text-sm font-semibold text-gray-700">
                    제목
                  </label>
                  <input
                    id="verse-title"
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))}
                    maxLength={120}
                    className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="예: 하나님의 신실하심"
                    required
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{form.title.length}/120</p>
                </div>

                <div>
                  <label htmlFor="verse-scripture" className="mb-2 block text-sm font-semibold text-gray-700">
                    성경 구절
                  </label>
                  <input
                    id="verse-scripture"
                    type="text"
                    value={form.scripture}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      scripture: event.target.value,
                    }))}
                    maxLength={100}
                    className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="예: 예레미야애가 3:22-23"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="verse-message" className="mb-2 block text-sm font-semibold text-gray-700">
                    말씀 묵상
                  </label>
                  <textarea
                    id="verse-message"
                    value={form.message}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))}
                    rows={10}
                    maxLength={4000}
                    className="w-full resize-y rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="묵상 내용을 입력해 주세요."
                    required
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{form.message.length}/4000</p>
                </div>

                {uploadNotice ? (
                  <AdminNotice
                    {...uploadNotice}
                    onDismiss={() => setUploadNotice(null)}
                  />
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> 등록 중...
                    </>
                  ) : (
                    '주간 말씀 등록'
                  )}
                </button>
              </form>
            </section>

            <section className="border border-slate-200 bg-white shadow-sm" aria-labelledby="verse-list-heading">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 id="verse-list-heading" className="text-xl font-bold text-slate-900">
                  등록된 주간 말씀
                </h2>
                <p className="mt-1 text-sm text-slate-500">총 {items.length}개</p>
              </div>

              {managementNotice ? (
                <div className="mx-6 mt-5">
                  <AdminNotice
                    {...managementNotice}
                    onDismiss={() => setManagementNotice(null)}
                  />
                </div>
              ) : null}

              {itemsLoading ? (
                <div className="flex justify-center px-6 py-16" aria-label="주간 말씀을 불러오는 중">
                  <Loader2 className="h-8 w-8 animate-spin text-green-700" aria-hidden="true" />
                </div>
              ) : itemsError ? (
                <p className="m-6 border-l-4 border-red-600 bg-red-50 px-4 py-4 text-sm text-red-800">
                  주간 말씀 목록을 불러오지 못했습니다. Firestore 규칙과 네트워크 상태를 확인해 주세요.
                </p>
              ) : items.length === 0 ? (
                <p className="px-6 py-16 text-center text-sm text-slate-500">
                  등록된 주간 말씀이 없습니다.
                </p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <article key={item.id} className="px-6 py-5">
                      <h3 className="break-words text-base font-bold text-slate-900">{item.title}</h3>
                      {item.scripture ? (
                        <p className="mt-2 text-sm font-semibold text-green-800">{item.scripture}</p>
                      ) : null}
                      {item.message ? (
                        <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {item.message}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <Link
                          href="/verses"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-green-700 hover:text-green-800"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          미리보기
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditDialog(item)}
                          disabled={deletingId === item.id}
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-green-700 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          )}
                          삭제
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {editingItem ? (
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
                aria-labelledby="edit-verse-heading"
                className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-md bg-white p-6 shadow-xl sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-green-700">주간 말씀 정보</p>
                    <h2 id="edit-verse-heading" className="mt-1 text-2xl font-bold text-slate-900">
                      주간 말씀 수정
                    </h2>
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
                    <label htmlFor="edit-verse-title" className="mb-2 block text-sm font-semibold text-slate-700">
                      제목
                    </label>
                    <input
                      id="edit-verse-title"
                      type="text"
                      value={editForm.title}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))}
                      maxLength={120}
                      required
                      autoFocus
                      className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">{editForm.title.length}/120</p>
                  </div>

                  <div>
                    <label htmlFor="edit-verse-scripture" className="mb-2 block text-sm font-semibold text-slate-700">
                      성경 구절
                    </label>
                    <input
                      id="edit-verse-scripture"
                      type="text"
                      value={editForm.scripture}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        scripture: event.target.value,
                      }))}
                      maxLength={100}
                      required
                      className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-verse-message" className="mb-2 block text-sm font-semibold text-slate-700">
                      말씀 묵상
                    </label>
                    <textarea
                      id="edit-verse-message"
                      value={editForm.message}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        message: event.target.value,
                      }))}
                      rows={10}
                      maxLength={4000}
                      required
                      className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">{editForm.message.length}/4000</p>
                  </div>

                  {editNotice ? (
                    <AdminNotice
                      {...editNotice}
                      onDismiss={() => setEditNotice(null)}
                    />
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
                      disabled={
                        savingEdit
                        || !editForm.title.trim()
                        || !editForm.scripture.trim()
                        || !editForm.message.trim()
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-green-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {savingEdit ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      )}
                      저장
                    </button>
                  </div>
                </form>
              </section>
            </div>
          ) : null}
        </div>
      </main>
    </AuthGuard>
  );
}
