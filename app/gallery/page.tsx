'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Calendar, ImageIcon, Images } from 'lucide-react';
import Link from 'next/link';
import { GalleryItem, getGalleryCoverImage, getGalleryImageCount } from '@/lib/gallery';

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryItem[]>([]);
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
        // 1. Point to the 'gallery' drawer in our Firestore database
        const galleryQuery = query(
            collection(db, 'gallery'),
            orderBy('createdAt', 'desc') // Show newest photos first
        );

        // 2. Listen for any real-time updates (if Admin uploads a new photo, it appears instantly)
        const unsubscribe = onSnapshot(galleryQuery, (snapshot) => {
            const fetchedImages = snapshot.docs.map((doc) => ({
                id: doc.id,
                title: doc.data().title || 'Untitled Event',
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
            setLoading(false);
        });

        // Cleanup listener when leaving the page
        return () => unsubscribe();
    }, []);

    return (
        <main className="min-h-screen bg-white pt-20">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Church Gallery</h1>

                {loading ? (
                    // Loading spinner while fetching from Firebase
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : images.length === 0 ? (
                    // Message if no images are uploaded yet
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600">No photos yet</h2>
                        <p className="text-gray-400 mt-2">Check back soon for updates from our events!</p>
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
                                        <img
                                            src={getGalleryCoverImage(item)}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <ImageIcon className="w-12 h-12 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                        {item.date && (
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(item.date)}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1">
                                            <Images className="w-4 h-4" />
                                            {getGalleryImageCount(item)} {getGalleryImageCount(item) === 1 ? 'photo' : 'photos'}
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
