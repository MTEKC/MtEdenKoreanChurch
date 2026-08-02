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
  ExternalLink,
  Loader2,
  Megaphone,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import AdminNotice, { AdminNoticeMessage } from '@/components/admin/AdminNotice';
import { db } from '@/lib/firebase';

const ANNOUNCEMENT_CATEGORIES = [
  { value: 'General News', label: '교회 소식' },
  { value: 'Monday Class', label: '월요 모임' },
  { value: 'Sunday Class', label: '주일 모임' },
  { value: 'Mission', label: '선교' },
] as const;

interface AnnouncementItem {
  id: string;
  title: string;
  date?: string;
  category?: string;
  content?: string;
  isPinned?: boolean;
}

interface AnnouncementForm {
  title: string;
  date: string;
  category: string;
  content: string;
  isPinned: boolean;
}

const EMPTY_FORM: AnnouncementForm = {
  title: '',
  date: '',
  category: 'General News',
  content: '',
  isPinned: false,
};

function getCategoryLabel(category?: string) {
  return ANNOUNCEMENT_CATEGORIES.find((item) => item.value === category)?.label
    || category
    || '교회 소식';
}

export default function AdminAnnouncementsPage() {
  const [form, setForm] = useState<AnnouncementForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<AdminNoticeMessage | null>(null);
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(false);
  const [managementNotice, setManagementNotice] = useState<AdminNoticeMessage | null>(null);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [editForm, setEditForm] = useState<AnnouncementForm>(EMPTY_FORM);
  const [editNotice, setEditNotice] = useState<AdminNoticeMessage | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      announcementsQuery,
      (snapshot) => {
        setItems(snapshot.docs.map((announcementDoc) => ({
          id: announcementDoc.id,
          ...announcementDoc.data(),
        })) as AnnouncementItem[]);
        setItemsLoading(false);
        setItemsError(false);
      },
      (error) => {
        console.error('Error loading announcements:', error);
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
      await addDoc(collection(db, 'announcements'), {
        title: form.title.trim(),
        date: form.date,
        category: form.category,
        content: form.content.trim(),
        isPinned: form.isPinned,
        createdAt: serverTimestamp(),
      });

      setUploadNotice({ type: 'success', message: '소식·행사를 등록했습니다.' });
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error('Error posting announcement:', error);
      setUploadNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '소식·행사 등록에 실패했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (item: AnnouncementItem) => {
    setManagementNotice(null);
    setEditNotice(null);
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      date: item.date || '',
      category: item.category || 'General News',
      content: item.content || '',
      isPinned: Boolean(item.isPinned),
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

    if (!editingItem || !editForm.title.trim() || !editForm.content.trim()) {
      setEditNotice({
        type: 'error',
        message: '제목과 상세 내용을 입력해 주세요.',
      });
      return;
    }

    setSavingEdit(true);
    setEditNotice(null);

    try {
      await updateDoc(doc(db, 'announcements', editingItem.id), {
        title: editForm.title.trim(),
        date: editForm.date,
        category: editForm.category,
        content: editForm.content.trim(),
        isPinned: editForm.isPinned,
        updatedAt: serverTimestamp(),
      });
      setEditingItem(null);
      setManagementNotice({
        type: 'success',
        message: '소식·행사 내용을 수정했습니다.',
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      setEditNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '소식·행사 수정에 실패했습니다.',
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (item: AnnouncementItem) => {
    const confirmed = window.confirm(
      `"${item.title}" 소식·행사를 삭제하시겠습니까?\n삭제한 항목은 복구할 수 없습니다.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setManagementNotice(null);

    try {
      await deleteDoc(doc(db, 'announcements', item.id));
      setManagementNotice({
        type: 'success',
        message: '소식·행사를 삭제했습니다.',
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setManagementNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '소식·행사 삭제에 실패했습니다.',
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
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600"
          >
            <ArrowLeft className="h-4 w-4" /> 관리자 화면으로
          </Link>

          <div className="mb-8">
            <p className="text-sm font-semibold text-orange-700">소식·행사 관리</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">소식·행사 관리</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b pb-4">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Megaphone className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">새 소식·행사 등록</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="announcement-title" className="mb-2 block text-sm font-semibold text-gray-700">
                    제목
                  </label>
                  <input
                    id="announcement-title"
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))}
                    maxLength={120}
                    className="w-full rounded-lg border border-gray-200 p-3 outline-none transition focus:ring-2 focus:ring-orange-500"
                    placeholder="예: 전교인 야유회 안내"
                    required
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{form.title.length}/120</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="announcement-date" className="mb-2 block text-sm font-semibold text-gray-700">
                      날짜 <span className="font-normal text-gray-400">(선택)</span>
                    </label>
                    <input
                      id="announcement-date"
                      type="date"
                      value={form.date}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))}
                      className="w-full rounded-lg border border-gray-200 p-3 outline-none transition focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="announcement-category" className="mb-2 block text-sm font-semibold text-gray-700">
                      분류
                    </label>
                    <select
                      id="announcement-category"
                      value={form.category}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))}
                      className="w-full rounded-lg border border-gray-200 bg-white p-3 outline-none transition focus:ring-2 focus:ring-orange-500"
                    >
                      {ANNOUNCEMENT_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="announcement-content" className="mb-2 block text-sm font-semibold text-gray-700">
                    상세 내용
                  </label>
                  <textarea
                    id="announcement-content"
                    value={form.content}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      content: event.target.value,
                    }))}
                    rows={7}
                    maxLength={2000}
                    className="w-full resize-y rounded-lg border border-gray-200 p-3 outline-none transition focus:ring-2 focus:ring-orange-500"
                    placeholder="소식이나 행사에 대한 자세한 내용을 입력해 주세요."
                    required
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{form.content.length}/2000</p>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      isPinned: event.target.checked,
                    }))}
                    className="h-4 w-4 cursor-pointer rounded text-orange-600 focus:ring-orange-500"
                  />
                  목록 상단에 고정 (중요 공지)
                </label>

                {uploadNotice ? (
                  <AdminNotice
                    {...uploadNotice}
                    onDismiss={() => setUploadNotice(null)}
                  />
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> 등록 중...
                    </>
                  ) : (
                    '소식·행사 등록'
                  )}
                </button>
              </form>
            </section>

            <section className="border border-slate-200 bg-white shadow-sm" aria-labelledby="announcement-list-heading">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 id="announcement-list-heading" className="text-xl font-bold text-slate-900">
                  등록된 소식·행사
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
                <div className="flex justify-center px-6 py-16" aria-label="소식·행사를 불러오는 중">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-700" aria-hidden="true" />
                </div>
              ) : itemsError ? (
                <p className="m-6 border-l-4 border-red-600 bg-red-50 px-4 py-4 text-sm text-red-800">
                  소식·행사 목록을 불러오지 못했습니다. Firestore 규칙과 네트워크 상태를 확인해 주세요.
                </p>
              ) : items.length === 0 ? (
                <p className="px-6 py-16 text-center text-sm text-slate-500">
                  등록된 소식·행사가 없습니다.
                </p>
              ) : (
                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <article key={item.id} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words text-base font-bold text-slate-900">{item.title}</h3>
                            {item.isPinned ? (
                              <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                                중요
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>{getCategoryLabel(item.category)}</span>
                            {item.date ? <span>{item.date.replaceAll('-', '. ')}</span> : null}
                          </div>
                          {item.content ? (
                            <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                              {item.content}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <Link
                          href="/announcements"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-orange-700 hover:text-orange-800"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          미리보기
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditDialog(item)}
                          disabled={deletingId === item.id}
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-orange-700 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                aria-labelledby="edit-announcement-heading"
                className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-md bg-white p-6 shadow-xl sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-orange-700">소식·행사 정보</p>
                    <h2 id="edit-announcement-heading" className="mt-1 text-2xl font-bold text-slate-900">
                      소식·행사 수정
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
                    <label htmlFor="edit-announcement-title" className="mb-2 block text-sm font-semibold text-slate-700">
                      제목
                    </label>
                    <input
                      id="edit-announcement-title"
                      type="text"
                      value={editForm.title}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))}
                      maxLength={120}
                      required
                      autoFocus
                      className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-700 focus:ring-2 focus:ring-orange-100"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">{editForm.title.length}/120</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="edit-announcement-date" className="mb-2 block text-sm font-semibold text-slate-700">
                        날짜 <span className="font-normal text-slate-400">(선택)</span>
                      </label>
                      <input
                        id="edit-announcement-date"
                        type="date"
                        value={editForm.date}
                        onChange={(event) => setEditForm((current) => ({
                          ...current,
                          date: event.target.value,
                        }))}
                        className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-700 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-announcement-category" className="mb-2 block text-sm font-semibold text-slate-700">
                        분류
                      </label>
                      <select
                        id="edit-announcement-category"
                        value={editForm.category}
                        onChange={(event) => setEditForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-orange-700 focus:ring-2 focus:ring-orange-100"
                      >
                        {ANNOUNCEMENT_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-announcement-content" className="mb-2 block text-sm font-semibold text-slate-700">
                      상세 내용
                    </label>
                    <textarea
                      id="edit-announcement-content"
                      value={editForm.content}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        content: event.target.value,
                      }))}
                      rows={8}
                      maxLength={2000}
                      required
                      className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-700 focus:ring-2 focus:ring-orange-100"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">{editForm.content.length}/2000</p>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={editForm.isPinned}
                      onChange={(event) => setEditForm((current) => ({
                        ...current,
                        isPinned: event.target.checked,
                      }))}
                      className="h-4 w-4 cursor-pointer rounded text-orange-600 focus:ring-orange-500"
                    />
                    목록 상단에 고정 (중요 공지)
                  </label>

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
                      disabled={savingEdit || !editForm.title.trim() || !editForm.content.trim()}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-slate-400"
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
