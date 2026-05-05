'use client';

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AuthGuard from '@/components/AuthGuard'; // Protects this page
import { ImagePlus, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminGalleryUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFiles(Array.from(e.target.files || []));
  };

  // 2. Handle the Upload Process
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please add a title and short description.");
      return;
    }

    if (imageFiles.length === 0) {
      alert("Please select at least one image first.");
      return;
    }

    setLoading(true);
    setUploadedCount(0);

    try {
      const timestamp = Date.now();
      const uploadedImages: { path: string; url: string }[] = [];

      for (const [index, file] of imageFiles.entries()) {
        // Create a unique storage path for every selected file.
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `gallery/${timestamp}-${index}-${safeFileName}`;
        const storageReference = ref(storage, storagePath);

        await uploadBytes(storageReference, file);
        const publicImageUrl = await getDownloadURL(storageReference);

        uploadedImages.push({
          path: storagePath,
          url: publicImageUrl,
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
        imagePaths: uploadedImages.map((image) => image.path),
        imageCount: uploadedImages.length,
        createdAt: serverTimestamp(),
      });

      alert('Gallery event uploaded successfully!');
      
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
      alert('Failed to upload gallery event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ImagePlus className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Upload Gallery Event</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="e.g., Easter Sunday 2026"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
              placeholder="Share a short note about this event."
              maxLength={500}
              required
            />
            <p className="mt-1 text-xs text-gray-400">{description.length}/500 characters</p>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date (Optional)</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Image File Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Images</label>
            <input 
              id="file-upload"
              type="file" 
              accept="image/*" // Only allow image files
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
              required
            />
            {imageFiles.length > 0 && (
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-900">
                  {imageFiles.length} {imageFiles.length === 1 ? 'image' : 'images'} selected
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
                <Loader2 className="w-5 h-5 animate-spin" /> Uploading {uploadedCount}/{imageFiles.length}
              </>
            ) : (
              `Upload ${imageFiles.length > 1 ? `${imageFiles.length} Photos` : 'Gallery Event'}`
            )}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
