'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Calendar, ImageIcon, Images } from 'lucide-react';
import { GalleryItem, getGalleryImageCount, getGalleryImageUrls } from '@/lib/gallery';

export default function GalleryDetailPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (date?: string) => {
    if (!date) return '';

    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useEffect(() => {
    if (!params.id) return;

    const unsubscribe = onSnapshot(
      doc(db, 'gallery', params.id),
      (snapshot) => {
        if (!snapshot.exists()) {
          setItem(null);
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        setItem({
          id: snapshot.id,
          title: data.title || 'Untitled Event',
          description: data.description || '',
          date: data.date || '',
          imageUrl: data.imageUrl,
          coverImageUrl: data.coverImageUrl,
          imageUrls: data.imageUrls,
          imagePaths: data.imagePaths,
          imagePublicIds: data.imagePublicIds,
          imageProvider: data.imageProvider,
          imageCount: data.imageCount,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error loading gallery event:', error);
        setItem(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [params.id]);

  const imageUrls = item ? getGalleryImageUrls(item) : [];

  return (
    <main className="min-h-screen bg-white pt-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/gallery" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          갤러리로 돌아가기
        </Link>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !item ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-100">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-700">갤러리 행사를 찾을 수 없습니다.</h1>
            <p className="text-gray-400 mt-2">삭제되었거나 주소가 변경되었을 수 있습니다.</p>
          </div>
        ) : (
          <>
            <header className="mb-10 border-b border-gray-100 pb-8">
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {item.date && (
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(item.date)}
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <Images className="w-4 h-4" />
                  사진 {getGalleryImageCount(item)}장
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{item.title}</h1>
              {item.description && (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
                  {item.description}
                </p>
              )}
            </header>

            {imageUrls.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-100">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600">등록된 사진이 없습니다.</h2>
              </div>
            ) : (
              <section aria-label="갤러리 행사 사진">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">사진</h2>
                  <span className="text-sm text-gray-500">
                    {imageUrls.length} {imageUrls.length === 1 ? 'image' : 'images'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {imageUrls.map((imageUrl, index) => (
                    <a
                      key={`${imageUrl}-${index}`}
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <img
                        src={imageUrl}
                        alt={`${item.title} photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
