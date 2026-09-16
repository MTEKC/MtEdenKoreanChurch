'use client';

import { useCallback, useEffect, useState } from 'react';
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
  ExternalLink,
  Loader2,
  Pencil,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import AdminNotice, { AdminNoticeMessage } from '@/components/admin/AdminNotice';
import LiteYouTubeEmbed from '@/components/LiteYouTubeEmbed';
import { db } from '@/lib/firebase';
import { getYouTubeVideoId } from '@/lib/youtube';

interface SermonItem {
  id: string;
  title: string;
  preacher?: string;
  date?: string;
  scripture?: string;
  summary?: string;
  youtubeId?: string;
}

interface SermonForm {
  title: string;
  preacher: string;
  date: string;
  scripture: string;
  summary: string;
  youtubeInput: string;
}

const EMPTY_FORM: SermonForm = {
  title: '',
  preacher: '',
  date: '',
  scripture: '',
  summary: '',
  youtubeInput: '',
};

export default function AdminSermonsPage() {
  const [form, setForm] = useState<SermonForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<AdminNoticeMessage | null>(null);
  const [items, setItems] = useState<SermonItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(false);
  const [managementNotice, setManagementNotice] = useState<AdminNoticeMessage | null>(null);
  const [editingItem, setEditingItem] = useState<SermonItem | null>(null);
  const [editForm, setEditForm] = useState<SermonForm>(EMPTY_FORM);
  const [editNotice, setEditNotice] = useState<AdminNoticeMessage | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const youtubeId = getYouTubeVideoId(form.youtubeInput);
  const editYoutubeId = getYouTubeVideoId(editForm.youtubeInput);

  const openEditDialog = useCallback((item: SermonItem) => {
    setManagementNotice(null);
    setEditNotice(null);
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      preacher: item.preacher || '',
      date: item.date || '',
      scripture: item.scripture || '',
      summary: item.summary || '',
      youtubeInput: item.youtubeId || '',
    });
  }, []);

  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get('edit');
    let editLinkHandled = false;
    const sermonsQuery = query(
      collection(db, 'sermons'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      sermonsQuery,
      (snapshot) => {
        const loadedItems = snapshot.docs.map((sermonDoc) => ({
          id: sermonDoc.id,
          ...sermonDoc.data(),
        })) as SermonItem[];
        setItems(loadedItems);

        if (editId && !editLinkHandled) {
          const selectedItem = loadedItems.find((item) => item.id === editId);
          if (selectedItem) {
            editLinkHandled = true;
            openEditDialog(selectedItem);
          } else if (!snapshot.metadata.fromCache) {
            editLinkHandled = true;
            setManagementNotice({
              type: 'error',
              message: '수정할 게시글을 찾을 수 없습니다. 삭제된 게시글인지 확인해 주세요.',
            });
          }
        }
        setItemsLoading(false);
        setItemsError(false);
      },
      (error) => {
        console.error('Error loading sermons:', error);
        setItemsLoading(false);
        setItemsError(true);
      }
    );
  }, [openEditDialog]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploadNotice(null);

    if (!youtubeId) {
      setUploadNotice({
        type: 'error',
        message: '올바른 YouTube 주소 또는 11자리 영상 ID를 입력해 주세요.',
      });
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'sermons'), {
        title: form.title.trim(),
        preacher: form.preacher.trim(),
        date: form.date,
        scripture: form.scripture.trim(),
        summary: form.summary.trim(),
        youtubeId,
        createdAt: serverTimestamp(),
      });

      setUploadNotice({ type: 'success', message: '설교를 등록했습니다.' });
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error('Error posting sermon:', error);
      setUploadNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '설교 등록에 실패했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const closeEditDialog = () => {
    if (!savingEdit) {
      setEditingItem(null);
      setEditNotice(null);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingItem || !editYoutubeId) {
      setEditNotice({
        type: 'error',
        message: '올바른 YouTube 주소 또는 11자리 영상 ID를 입력해 주세요.',
      });
      return;
    }

    if (
      !editForm.title.trim()
      || !editForm.preacher.trim()
      || !editForm.date
      || !editForm.scripture.trim()
      || !editForm.summary.trim()
    ) {
      setEditNotice({
        type: 'error',
        message: '설교 정보를 모두 입력해 주세요.',
      });
      return;
    }

    setSavingEdit(true);
    setEditNotice(null);

    try {
      await updateDoc(doc(db, 'sermons', editingItem.id), {
        title: editForm.title.trim(),
        preacher: editForm.preacher.trim(),
        date: editForm.date,
        scripture: editForm.scripture.trim(),
        summary: editForm.summary.trim(),
        youtubeId: editYoutubeId,
        updatedAt: serverTimestamp(),
      });
      setEditingItem(null);
      setManagementNotice({
        type: 'success',
        message: '설교 정보를 수정했습니다.',
      });
    } catch (error) {
      console.error('Error updating sermon:', error);
      setEditNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '설교 수정에 실패했습니다.',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (item: SermonItem) => {
    const confirmed = window.confirm(
      `"${item.title}" 설교를 삭제하시겠습니까?\n삭제한 설교는 복구할 수 없습니다.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setManagementNotice(null);

    try {
      await deleteDoc(doc(db, 'sermons', item.id));
      setManagementNotice({
        type: 'success',
        message: '설교를 삭제했습니다.',
      });
    } catch (error) {
      console.error('Error deleting sermon:', error);
      setManagementNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '설교 삭제에 실패했습니다.',
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
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600"
          >
            <ArrowLeft className="h-4 w-4" /> 관리자 화면으로
          </Link>

          <div className="mb-8">
            <p className="text-sm font-semibold text-purple-700">설교 관리</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">설교 관리</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b pb-4">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">새 설교 등록</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="sermon-title" className="mb-2 block text-sm font-semibold text-gray-700">
                    설교 제목
                  </label>
                  <input
                    id="sermon-title"
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))}
                    maxLength={120}
                    className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{form.title.length}/120</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sermon-preacher" className="mb-2 block text-sm font-semibold text-gray-700">
                      설교자
                    </label>
                    <input
                      id="sermon-preacher"
                      type="text"
                      value={form.preacher}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        preacher: event.target.value,
                      }))}
                      maxLength={80}
                      className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="sermon-date" className="mb-2 block text-sm font-semibold text-gray-700">
                      설교 날짜
                    </label>
                    <input
                      id="sermon-date"
                      type="date"
                      value={form.date}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))}
                      className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sermon-scripture" className="mb-2 block text-sm font-semibold text-gray-700">
                    본문 말씀
                  </label>
                  <input
                    id="sermon-scripture"
                    type="text"
                    value={form.scripture}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      scripture: event.target.value,
                    }))}
                    maxLength={100}
                    className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="예: 요한복음 3:16"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="sermon-youtube" className="mb-2 block text-sm font-semibold text-gray-700">
                    YouTube 주소 또는 영상 ID
                  </label>
                  <input
                    id="sermon-youtube"
                    type="text"
                    value={form.youtubeInput}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      youtubeInput: event.target.value,
                    }))}
                    className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="YouTube 영상 주소를 그대로 붙여 넣으세요."
                    required
                  />
                  <p className={`mt-1 text-xs ${form.youtubeInput && !youtubeId ? 'text-red-600' : 'text-gray-400'}`}>
                    {form.youtubeInput && !youtubeId
                      ? '영상 주소 또는 ID를 확인해 주세요.'
                      : youtubeId
                        ? `영상 ID 확인됨: ${youtubeId}`
                        : '일반 영상, 단축 주소, Shorts 주소를 자동으로 인식합니다.'}
                  </p>

                  {youtubeId ? (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-semibold text-gray-700">영상 미리보기</p>
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-950">
                        <LiteYouTubeEmbed
                          videoId={youtubeId}
                          title={form.title.trim() || '설교 영상 미리보기'}
                        />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-gray-500">
                        썸네일만 먼저 불러오며 재생 버튼을 누를 때만 YouTube 영상이 로드됩니다.
                      </p>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="sermon-summary" className="mb-2 block text-sm font-semibold text-gray-700">
                    설교 요약
                  </label>
                  <textarea
                    id="sermon-summary"
                    value={form.summary}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      summary: event.target.value,
                    }))}
                    rows={6}
                    maxLength={3000}
                    className="w-full resize-y rounded-lg border p-3 outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{form.summary.length}/3000</p>
                </div>

                {uploadNotice ? (
                  <AdminNotice
                    {...uploadNotice}
                    onDismiss={() => setUploadNotice(null)}
                  />
                ) : null}

                <button
                  type="submit"
                  disabled={loading || !youtubeId}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> 등록 중...
                    </>
                  ) : (
                    '설교 등록'
                  )}
                </button>
              </form>
            </section>

            <section className="border border-slate-200 bg-white shadow-sm" aria-labelledby="sermon-list-heading">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 id="sermon-list-heading" className="text-xl font-bold text-slate-900">
                  등록된 설교
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
                <div className="flex justify-center px-6 py-16" aria-label="설교를 불러오는 중">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-700" aria-hidden="true" />
                </div>
              ) : itemsError ? (
                <p className="m-6 border-l-4 border-red-600 bg-red-50 px-4 py-4 text-sm text-red-800">
                  설교 목록을 불러오지 못했습니다. Firestore 규칙과 네트워크 상태를 확인해 주세요.
                </p>
              ) : items.length === 0 ? (
                <p className="px-6 py-16 text-center text-sm text-slate-500">
                  등록된 설교가 없습니다.
                </p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <article key={item.id} className="px-6 py-5">
                      <h3 className="break-words text-base font-bold text-slate-900">{item.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        {item.preacher ? <span>{item.preacher}</span> : null}
                        {item.date ? <span>{item.date.replaceAll('-', '. ')}</span> : null}
                        {item.scripture ? <span>{item.scripture}</span> : null}
                      </div>
                      {item.summary ? (
                        <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {item.summary}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <Link
                          href="/sermons"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-purple-700 hover:text-purple-800"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          미리보기
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditDialog(item)}
                          disabled={deletingId === item.id}
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-purple-700 hover:text-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                aria-labelledby="edit-sermon-heading"
                className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6 shadow-xl sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-purple-700">설교 정보</p>
                    <h2 id="edit-sermon-heading" className="mt-1 text-2xl font-bold text-slate-900">
                      설교 수정
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
                    <label htmlFor="edit-sermon-title" className="mb-2 block text-sm font-semibold text-slate-700">
                      설교 제목
                    </label>
                    <input
                      id="edit-sermon-title"
                      type="text"
                      value={editForm.title}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))}
                      maxLength={120}
                      required
                      autoFocus
                      className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-purple-700 focus:ring-2 focus:ring-purple-100"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">{editForm.title.length}/120</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="edit-sermon-preacher" className="mb-2 block text-sm font-semibold text-slate-700">
                        설교자
                      </label>
                      <input
                        id="edit-sermon-preacher"
                        type="text"
                        value={editForm.preacher}
                        onChange={(event) => setEditForm((current) => ({
                          ...current,
                          preacher: event.target.value,
                        }))}
                        maxLength={80}
                        required
                        className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-purple-700 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-sermon-date" className="mb-2 block text-sm font-semibold text-slate-700">
                        설교 날짜
                      </label>
                      <input
                        id="edit-sermon-date"
                        type="date"
                        value={editForm.date}
                        onChange={(event) => setEditForm((current) => ({
                          ...current,
                          date: event.target.value,
                        }))}
                        required
                        className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-purple-700 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-sermon-scripture" className="mb-2 block text-sm font-semibold text-slate-700">
                      본문 말씀
                    </label>
                    <input
                      id="edit-sermon-scripture"
                      type="text"
                      value={editForm.scripture}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        scripture: event.target.value,
                      }))}
                      maxLength={100}
                      required
                      className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-purple-700 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-sermon-youtube" className="mb-2 block text-sm font-semibold text-slate-700">
                      YouTube 주소 또는 영상 ID
                    </label>
                    <input
                      id="edit-sermon-youtube"
                      type="text"
                      value={editForm.youtubeInput}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        youtubeInput: event.target.value,
                      }))}
                      required
                      className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-purple-700 focus:ring-2 focus:ring-purple-100"
                    />
                    <p className={`mt-1 text-xs ${editForm.youtubeInput && !editYoutubeId ? 'text-red-600' : 'text-slate-400'}`}>
                      {editForm.youtubeInput && !editYoutubeId
                        ? '영상 주소 또는 ID를 확인해 주세요.'
                        : editYoutubeId
                          ? `영상 ID 확인됨: ${editYoutubeId}`
                          : 'YouTube 주소 또는 영상 ID를 입력해 주세요.'}
                    </p>

                    {editYoutubeId ? (
                      <div className="mt-4">
                        <p className="mb-2 text-sm font-semibold text-slate-700">영상 미리보기</p>
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-950">
                          <LiteYouTubeEmbed
                            videoId={editYoutubeId}
                            title={editForm.title.trim() || '설교 영상 미리보기'}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="edit-sermon-summary" className="mb-2 block text-sm font-semibold text-slate-700">
                      설교 요약
                    </label>
                    <textarea
                      id="edit-sermon-summary"
                      value={editForm.summary}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        summary: event.target.value,
                      }))}
                      rows={7}
                      maxLength={3000}
                      required
                      className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-purple-700 focus:ring-2 focus:ring-purple-100"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">{editForm.summary.length}/3000</p>
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
                        || !editYoutubeId
                        || !editForm.title.trim()
                        || !editForm.preacher.trim()
                        || !editForm.date
                        || !editForm.scripture.trim()
                        || !editForm.summary.trim()
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-purple-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-400"
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
