'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
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
import AuthGuard from '@/components/AuthGuard'; // Protects this page
import {
  ArrowLeft,
  ExternalLink,
  ImagePlus,
  Images,
  Loader2,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import {
  GalleryItem,
  getGalleryCloudinaryPublicIds,
  getGalleryCoverImage,
  getGalleryImageCount,
} from '@/lib/gallery';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_COUNT = 20;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

interface SignedGalleryUpload {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
  useFilename: boolean;
  uniqueFilename: boolean;
  overwrite: boolean;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  error?: {
    message?: string;
  };
}

interface UploadedGalleryImage {
  publicId: string;
  secureUrl: string;
}

interface EditGalleryForm {
  title: string;
  description: string;
  date: string;
}

function isSupportedImage(file: File) {
  const lowerCaseName = file.name.toLowerCase();
  return ALLOWED_IMAGE_TYPES.has(file.type)
    || ALLOWED_IMAGE_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension));
}

async function getGalleryUploadSignature(token: string) {
  const response = await fetch('/api/cloudinary/gallery/signature', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || '갤러리 업로드 준비에 실패했습니다.');
  }

  return response.json() as Promise<SignedGalleryUpload>;
}

async function uploadImageToCloudinary(file: File, signedUpload: SignedGalleryUpload) {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('api_key', signedUpload.apiKey);
  formData.append('timestamp', String(signedUpload.timestamp));
  formData.append('signature', signedUpload.signature);
  formData.append('folder', signedUpload.folder);
  formData.append('allowed_formats', signedUpload.allowedFormats);
  formData.append('use_filename', String(signedUpload.useFilename));
  formData.append('unique_filename', String(signedUpload.uniqueFilename));
  formData.append('overwrite', String(signedUpload.overwrite));

  const response = await fetch(signedUpload.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as CloudinaryUploadResponse | null;
    throw new Error(data?.error?.message || 'Cloudinary에 이미지를 업로드하지 못했습니다.');
  }

  const data = (await response.json()) as CloudinaryUploadResponse;

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
  } satisfies UploadedGalleryImage;
}

async function removeUploadedImages(publicIds: string[], token: string) {
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicIds }),
  });
  const data = (await response.json().catch(() => null)) as {
    error?: string;
    failed?: unknown[];
  } | null;

  if (!response.ok || (Array.isArray(data?.failed) && data.failed.length > 0)) {
    throw new Error(data?.error || '업로드된 이미지 정리에 실패했습니다.');
  }
}

export default function AdminGalleryUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editForm, setEditForm] = useState<EditGalleryForm>({
    title: '',
    description: '',
    date: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const galleryQuery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));

    return onSnapshot(
      galleryQuery,
      (snapshot) => {
        setGalleryItems(snapshot.docs.map((galleryDoc) => ({
          id: galleryDoc.id,
          ...galleryDoc.data(),
        })) as GalleryItem[]);
        setGalleryLoading(false);
        setGalleryError(false);
      },
      (error) => {
        console.error('Error loading gallery events:', error);
        setGalleryLoading(false);
        setGalleryError(true);
      }
    );
  }, []);

  // 1. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > MAX_IMAGE_COUNT) {
      setImageFiles([]);
      e.target.value = '';
      alert(`이미지는 한 번에 최대 ${MAX_IMAGE_COUNT}장까지 선택할 수 있습니다.`);
      return;
    }

    const unsupportedFile = selectedFiles.find((file) => !isSupportedImage(file));
    if (unsupportedFile) {
      setImageFiles([]);
      e.target.value = '';
      alert(`"${unsupportedFile.name}" 파일은 지원하지 않는 형식입니다.\nJPG, PNG, WebP, GIF 이미지만 선택해 주세요.`);
      return;
    }

    const emptyFile = selectedFiles.find((file) => file.size === 0);
    if (emptyFile) {
      setImageFiles([]);
      e.target.value = '';
      alert(`"${emptyFile.name}" 파일이 비어 있습니다.`);
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversizedFile) {
      setImageFiles([]);
      e.target.value = '';
      alert(`"${oversizedFile.name}" 파일이 10MB를 초과합니다.`);
      return;
    }

    setImageFiles(selectedFiles);
  };

  // 2. Handle the Upload Process
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("행사 제목과 간단한 설명을 입력해 주세요.");
      return;
    }

    if (imageFiles.length === 0) {
      alert("이미지를 한 장 이상 선택해 주세요.");
      return;
    }

    setLoading(true);
    setUploadedCount(0);
    let token = '';
    const uploadedImages: { publicId: string; url: string }[] = [];

    try {
      token = await auth.currentUser?.getIdToken() || '';

      if (!token) {
        throw new Error('다시 로그인한 후 이미지를 업로드해 주세요.');
      }

      const signedUpload = await getGalleryUploadSignature(token);

      for (const [index, file] of imageFiles.entries()) {
        const uploadedImage = await uploadImageToCloudinary(file, signedUpload);

        uploadedImages.push({
          publicId: uploadedImage.publicId,
          url: uploadedImage.secureUrl,
        });
        setUploadedCount(index + 1);
      }

      // Save one event-style gallery item that owns all selected images.
      await addDoc(collection(db, 'gallery'), {
        title: title.trim(),
        description: description.trim(),
        date: date,
        imageUrl: uploadedImages[0].url,
        coverImageUrl: uploadedImages[0].url,
        imageUrls: uploadedImages.map((image) => image.url),
        imagePublicIds: uploadedImages.map((image) => image.publicId),
        imageProvider: 'cloudinary',
        imageCount: uploadedImages.length,
        createdAt: serverTimestamp(),
      });

      alert('갤러리 행사를 등록했습니다.');
      
      // Clear the form
      setTitle('');
      setDescription('');
      setDate('');
      setImageFiles([]);
      setUploadedCount(0);
      
      // Reset the file input visually
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("Error uploading gallery event: ", error);

      if (uploadedImages.length > 0 && token) {
        await removeUploadedImages(
          uploadedImages.map((image) => image.publicId),
          token
        ).catch((cleanupError) => {
          console.error('Error cleaning up uploaded gallery images:', cleanupError);
        });
      }

      alert(error instanceof Error ? error.message : '갤러리 행사 등록에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (item: GalleryItem) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      description: item.description || '',
      date: item.date || '',
    });
  };

  const closeEditDialog = () => {
    if (!savingEdit) {
      setEditingItem(null);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingItem || !editForm.title.trim() || !editForm.description.trim()) {
      alert('행사 제목과 간단한 설명을 입력해 주세요.');
      return;
    }

    setSavingEdit(true);

    try {
      await updateDoc(doc(db, 'gallery', editingItem.id), {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        date: editForm.date,
        updatedAt: serverTimestamp(),
      });
      setEditingItem(null);
      alert('갤러리 행사 정보를 수정했습니다.');
    } catch (error) {
      console.error('Error updating gallery event:', error);
      alert(error instanceof Error ? error.message : '갤러리 행사 수정에 실패했습니다.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    const confirmed = window.confirm(
      `"${item.title}" 갤러리 행사를 삭제하시겠습니까?\n연결된 이미지도 함께 삭제되며 복구할 수 없습니다.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);

    try {
      const publicIds = getGalleryCloudinaryPublicIds(item);
      const token = publicIds.length > 0
        ? await auth.currentUser?.getIdToken() || ''
        : '';

      if (publicIds.length > 0 && !token) {
        throw new Error('다시 로그인한 후 갤러리 행사를 삭제해 주세요.');
      }

      await deleteDoc(doc(db, 'gallery', item.id));

      if (publicIds.length > 0) {
        try {
          await removeUploadedImages(publicIds, token);
        } catch (cleanupError) {
          console.error('Error cleaning up gallery images:', cleanupError);
          alert('행사는 삭제했지만 Cloudinary 이미지 정리에 실패했습니다. 저장소를 확인해 주세요.');
          return;
        }
      }

      alert('갤러리 행사와 연결된 이미지를 삭제했습니다.');
    } catch (error) {
      console.error('Error deleting gallery event:', error);
      alert(error instanceof Error ? error.message : '갤러리 행사 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> 관리자 화면으로
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-700">갤러리 관리</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">갤러리 행사 관리</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ImagePlus className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">새 갤러리 행사 등록</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">행사 제목</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="예: 2026년 부활절 예배"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">간단한 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
              placeholder="행사에 대한 간단한 설명을 입력해 주세요."
              maxLength={500}
              required
            />
            <p className="mt-1 text-xs text-gray-400">{description.length}/500자</p>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">행사 날짜 (선택)</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Image File Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">이미지 선택</label>
            <input 
              id="file-upload"
              type="file" 
              accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG, WebP, GIF만 가능하며 한 장당 10MB, 한 번에 최대 20장까지 등록할 수 있습니다.
            </p>
            {imageFiles.length > 0 && (
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-900">
                  이미지 {imageFiles.length}장 선택됨
                </p>
                <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-blue-800">
                  {imageFiles.map((file) => (
                    <li key={`${file.name}-${file.lastModified}`} className="truncate">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || imageFiles.length === 0}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> 업로드 중 {uploadedCount}/{imageFiles.length}
              </>
            ) : (
              imageFiles.length > 1 ? `사진 ${imageFiles.length}장 등록` : '갤러리 행사 등록'
            )}
          </button>
        </form>
        </section>

        <section className="border border-slate-200 bg-white shadow-sm" aria-labelledby="gallery-list-heading">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 id="gallery-list-heading" className="text-xl font-bold text-slate-900">
              등록된 갤러리 행사
            </h2>
            <p className="mt-1 text-sm text-slate-500">총 {galleryItems.length}개</p>
          </div>

          {galleryLoading ? (
            <div className="flex justify-center px-6 py-16" aria-label="갤러리 행사를 불러오는 중">
              <Loader2 className="h-8 w-8 animate-spin text-blue-700" aria-hidden="true" />
            </div>
          ) : galleryError ? (
            <p className="m-6 border-l-4 border-red-600 bg-red-50 px-4 py-4 text-sm text-red-800">
              갤러리 목록을 불러오지 못했습니다. Firestore 규칙과 네트워크 상태를 확인해 주세요.
            </p>
          ) : galleryItems.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-slate-500">
              등록된 갤러리 행사가 없습니다.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {galleryItems.map((item) => {
                const coverImage = getGalleryCoverImage(item);
                const imageCount = getGalleryImageCount(item);

                return (
                  <article key={item.id} className="px-6 py-5">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        {coverImage ? (
                          // Cloudinary and legacy gallery URLs can use different hosts.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={coverImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300">
                            <Images className="h-7 w-7" aria-hidden="true" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-base font-bold text-slate-900">{item.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>사진 {imageCount}장</span>
                          {item.date ? <span>{item.date.replaceAll('-', '. ')}</span> : null}
                        </div>
                        {item.description ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/gallery/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-700 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        미리보기
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditDialog(item)}
                        disabled={deletingId === item.id}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-700 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                );
              })}
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
              aria-labelledby="edit-gallery-heading"
              className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-md bg-white p-6 shadow-xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700">갤러리 행사 정보</p>
                  <h2 id="edit-gallery-heading" className="mt-1 text-2xl font-bold text-slate-900">
                    갤러리 행사 수정
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
                  <label htmlFor="edit-gallery-title" className="mb-2 block text-sm font-semibold text-slate-700">
                    행사 제목
                  </label>
                  <input
                    id="edit-gallery-title"
                    type="text"
                    value={editForm.title}
                    onChange={(event) => setEditForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))}
                    maxLength={120}
                    required
                    autoFocus
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="edit-gallery-date" className="mb-2 block text-sm font-semibold text-slate-700">
                    행사 날짜 <span className="font-normal text-slate-400">(선택)</span>
                  </label>
                  <input
                    id="edit-gallery-date"
                    type="date"
                    value={editForm.date}
                    onChange={(event) => setEditForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="edit-gallery-description" className="mb-2 block text-sm font-semibold text-slate-700">
                    간단한 설명
                  </label>
                  <textarea
                    id="edit-gallery-description"
                    value={editForm.description}
                    onChange={(event) => setEditForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))}
                    rows={6}
                    maxLength={500}
                    required
                    className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {editForm.description.length}/500
                  </p>
                </div>

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
                    disabled={savingEdit || !editForm.title.trim() || !editForm.description.trim()}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
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
