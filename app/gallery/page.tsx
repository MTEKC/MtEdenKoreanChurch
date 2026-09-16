'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Calendar, ImageIcon, Images } from 'lucide-react';
import Link from 'next/link';
import { GalleryItem, getGalleryCoverImage, getGalleryImageCount } from '@/lib/gallery';
import ContentLoadError from '@/components/ContentLoadError';

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    const formatDate = (date?: string) => {
        if (!date) return '';

        return new Date(`${date}T00:00:00`).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    useEffect(() => {
        // 1. Point to the 'gallery' drawer in our Firestore database
        const galleryQuery = query(
            collection(db, 'gallery'),
            orderBy('createdAt', 'desc') // Show newest photos first
        );

        // 2. Listen for any real-time updates (if Admin uploads a new photo, it appears instantly)
        const unsubscribe = onSnapshot(
            galleryQuery,
            (snapshot) => {
                const fetchedImages = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    title: doc.data().title || '제목 없는 행사',
                    description: doc.data().description || '',
                    date: doc.data().date || '',
                    imageUrl: doc.data().imageUrl,
                    coverImageUrl: doc.data().coverImageUrl,
                    imageUrls: doc.data().imageUrls,
                    imagePaths: doc.data().imagePaths,
                    imagePublicIds: doc.data().imagePublicIds,
                    imageProvider: doc.data().imageProvider,
                    imageCount: doc.data().imageCount,
                }));

                setImages(fetchedImages);
                setLoadError(false);
                setLoading(false);
            },
            (error) => {
                console.error('갤러리 불러오기 오류:', error);
                setLoadError(true);
                setLoading(false);
            }
        );

        // Cleanup listener when leaving the page
        return () => unsubscribe();
    }, [retryKey]);

    const retryLoading = () => {
        setLoading(true);
        setLoadError(false);
        setRetryKey((key) => key + 1);
    };

    return (
        <main className="min-h-screen bg-white pt-20">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">교회 갤러리</h1>

                {loading ? (
                    // Loading spinner while fetching from Firebase
                    <div className="flex justify-center items-center h-64" role="status">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-hidden="true"></div>
                        <span className="sr-only">갤러리를 불러오는 중입니다.</span>
                    </div>
                ) : loadError ? (
                    <ContentLoadError onRetry={retryLoading} message="갤러리를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요." />
                ) : images.length === 0 ? (
                    // Message if no images are uploaded yet
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                        <h2 className="text-xl font-semibold text-gray-600">등록된 사진이 없습니다.</h2>
                        <p className="text-gray-500 mt-2">행사 사진이 등록되면 이곳에서 확인하실 수 있습니다.</p>
                    </div>
                ) : (
                    // The Gallery Event Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((item) => (
                            <Link
                                key={item.id}
                                href={`/gallery/${item.id}`}
                                className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                    {getGalleryCoverImage(item) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={getGalleryCoverImage(item)}
                                            alt={item.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <ImageIcon className="w-12 h-12 text-gray-400" aria-hidden="true" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                        {item.date && (
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-4 h-4" aria-hidden="true" />
                                                {formatDate(item.date)}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1">
                                            <Images className="w-4 h-4" aria-hidden="true" />
                                            사진 {getGalleryImageCount(item)}장
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition">
                                        {item.title}
                                    </h2>
                                    {item.description && (
                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
