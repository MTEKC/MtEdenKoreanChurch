'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AuthGuard from '@/components/AuthGuard'; // Protects this page
import { ImagePlus, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

  return (
    <AuthGuard>
      <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> 관리자 화면으로
        </Link>

        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ImagePlus className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">갤러리 행사 등록</h1>
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
      </div>
    </AuthGuard>
  );
}
