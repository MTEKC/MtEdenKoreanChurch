'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AuthGuard from '@/components/AuthGuard';
import { Megaphone, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminAnnouncementsUpload() {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('General News');
    const [content, setContent] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Save the text data into the 'announcements' collection in Firestore
            await addDoc(collection(db, 'announcements'), {
                title,
                date,
                category,
                content,
                isPinned,
                createdAt: serverTimestamp(), // Keeps them in the correct order
            });

            alert('Announcement posted successfully!');

            // Clear the form for the next entry
            setTitle('');
            setDate('');
            setCategory('General News');
            setContent('');
            setIsPinned(false);

        } catch (error) {
            console.error("Error posting announcement: ", error);
            alert('Failed to post announcement. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard>
            <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <Megaphone className="w-6 h-6 text-orange-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Post an Announcement</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Announcement Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                                placeholder="e.g., Annual Church Picnic"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date (Optional)</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition bg-white"
                            >
                                <option value="General News">교회 소식</option>
                                <option value="Monday Class">월요 모임</option>
                                <option value="Sunday Class">주일 모임</option>
                                <option value="Mission">선교</option>
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Announcement Details</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition resize-none"
                            placeholder="Write the full details of the announcement here..."
                            required
                        />
                    </div>

                    {/* Pin Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="pin-checkbox"
                            checked={isPinned}
                            onChange={(e) => setIsPinned(e.target.checked)}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                        />
                        <label htmlFor="pin-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Pin to the top of the list (Important)
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Posting...
                            </>
                        ) : (
                            'Post Announcement'
                        )}
                    </button>
                </form>
            </div>
        </AuthGuard>
    );
}


