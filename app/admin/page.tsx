

// 'use client';

// import AuthGuard from '@/components/AuthGuard';
// import { auth } from '@/lib/firebase';
// import { signOut } from 'firebase/auth';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { LayoutDashboard, Image as ImageIcon, Megaphone, Video, LogOut, BookOpen } from 'lucide-react';
// import Navbar from '@/components/Navbar';

// export default function AdminDashboard() {
//   const router = useRouter();

//   const handleLogout = async () => {
//     await signOut(auth);
//     router.push('/'); // Send back to the public home page
//   };

//   return (
//     <AuthGuard>
//       <div className="max-w-5xl mx-auto mt-16 p-8">
//         <div className="flex justify-between items-center mb-10 border-b pb-6">
//           <div className="flex items-center gap-3">
//             <div className="bg-blue-600 p-3 rounded-xl shadow-sm">
//               <LayoutDashboard className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//               <p className="text-gray-500">Manage your church website content</p>
//             </div>
//           </div>
//           <button 
//             onClick={handleLogout}
//             className="flex items-center gap-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg transition font-medium"
//           >
//             <LogOut className="w-4 h-4" /> Log Out
//           </button>
//         </div>

//         {/* Dashboard Menu Grid */}
//         <div className="grid md:grid-cols-3 gap-6">
          
//           <Link href="/admin/announcements" className="block group">
//             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-orange-500 hover:shadow-md transition cursor-pointer h-full">
//               <Megaphone className="w-10 h-10 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
//               <h2 className="text-xl font-bold text-gray-800 mb-2">Announcements</h2>
//               <p className="text-gray-500 text-sm">Post weekly news, events, and pinned updates.</p>
//             </div>
//           </Link>

//           <Link href="/admin/gallery" className="block group">
//             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer h-full">
//               <ImageIcon className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
//               <h2 className="text-xl font-bold text-gray-800 mb-2">Photo Gallery</h2>
//               <p className="text-gray-500 text-sm">Upload images from church events and services.</p>
//             </div>
//           </Link>

//           <Link href="/admin/sermons" className="block group">
//             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition cursor-pointer h-full">
//               <Video className="w-10 h-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
//               <h2 className="text-xl font-bold text-gray-800 mb-2">Sunday Sermons</h2>
//               <p className="text-gray-500 text-sm">Add YouTube links and sermon summaries.</p>
//             </div>
//           </Link>

//           {/* Add this right under your other Admin links */}
//           <Link href="/admin/verses" className="block group">
//             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-green-500 hover:shadow-md transition cursor-pointer h-full">
//               <BookOpen className="w-10 h-10 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
//               <h2 className="text-xl font-bold text-gray-800 mb-2">Weekly Word</h2>
//               <p className="text-gray-500 text-sm">Post a weekly devotional and scripture.</p>
//             </div>
//           </Link>

//         </div>
//       </div>
//     </AuthGuard>
//   );
// }



'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { auth, db, storage } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Image as ImageIcon, Megaphone, Video, LogOut, BookOpen, Trash2, ExternalLink } from 'lucide-react';
import { GalleryItem, getGalleryCoverImage, getGalleryImageCount, getGalleryStorageRefs } from '@/lib/gallery';

interface AdminListItem {
  id: string;
  title: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  // State to hold all our database items
  const [announcements, setAnnouncements] = useState<AdminListItem[]>([]);
  const [sermons, setSermons] = useState<AdminListItem[]>([]);
  const [verses, setVerses] = useState<AdminListItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Fetch all data when the dashboard loads
  useEffect(() => {
    // 1. Fetch Announcements
    const unsubAnnouncements = onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'Untitled Announcement',
      })));
    });

    // 2. Fetch Sermons
    const unsubSermons = onSnapshot(query(collection(db, 'sermons'), orderBy('createdAt', 'desc')), (snapshot) => {
      setSermons(snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'Untitled Sermon',
      })));
    });

    // 3. Fetch Weekly Word (Verses)
    const unsubVerses = onSnapshot(query(collection(db, 'verses'), orderBy('createdAt', 'desc')), (snapshot) => {
      setVerses(snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'Untitled Weekly Word',
      })));
    });

    // 4. Fetch Gallery
    const unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), (snapshot) => {
      setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
    });

    // Cleanup listeners when leaving page
    return () => {
      unsubAnnouncements();
      unsubSermons();
      unsubVerses();
      unsubGallery();
    };
  }, []);

  // --- DELETE FUNCTIONS ---
  
  const deleteTextDoc = async (collectionName: string, id: string) => {
    if (confirm("Are you sure you want to permanently delete this?")) {
      await deleteDoc(doc(db, collectionName, id));
    }
  };

  const deleteGalleryDoc = async (item: GalleryItem) => {
    if (confirm("Are you sure you want to permanently delete this gallery event?")) {
      try {
        const storageRefs = getGalleryStorageRefs(item);
        const deleteResults = await Promise.allSettled(
          storageRefs.map((storageRef) => deleteObject(ref(storage, storageRef)))
        );

        await deleteDoc(doc(db, 'gallery', item.id));

        const failedDeletes = deleteResults.filter((result) => result.status === 'rejected');
        if (failedDeletes.length > 0) {
          console.error("Some gallery images could not be deleted:", failedDeletes);
          alert("Gallery event deleted, but some image files may already have been removed.");
        }
      } catch (error) {
        console.error("Error deleting gallery event:", error);
        alert("Error deleting gallery event. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto mt-10 p-4 md:p-8">
        
        {/* --- TOP HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl shadow-sm">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500">Manage your church website content</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition font-medium">
              <ExternalLink className="w-4 h-4" /> View Live Site
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg transition font-medium">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        {/* --- SECTION 1: ADD NEW CONTENT --- */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Content</h2>
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Link href="/admin/announcements" className="bg-white p-6 rounded-2xl border hover:border-orange-500 hover:shadow-md transition group">
            <Megaphone className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-bold text-gray-800">Announcement</h3>
          </Link>
          <Link href="/admin/gallery" className="bg-white p-6 rounded-2xl border hover:border-blue-500 hover:shadow-md transition group">
            <ImageIcon className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-bold text-gray-800">Gallery Event</h3>
          </Link>
          <Link href="/admin/sermons" className="bg-white p-6 rounded-2xl border hover:border-purple-500 hover:shadow-md transition group">
            <Video className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-bold text-gray-800">Sunday Sermon</h3>
          </Link>
          <Link href="/admin/verses" className="bg-white p-6 rounded-2xl border hover:border-green-500 hover:shadow-md transition group">
            <BookOpen className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition" />
            <h3 className="font-bold text-gray-800">Weekly Word</h3>
          </Link>
        </div>

        {/* --- SECTION 2: MANAGE EXISTING CONTENT --- */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-t pt-8">Manage Existing Content</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Announcements List */}
          <div className="bg-white rounded-2xl border p-4 shadow-sm h-96 overflow-y-auto">
            <h3 className="font-bold text-orange-600 mb-4 sticky top-0 bg-white pb-2 border-b flex items-center gap-2"><Megaphone className="w-4 h-4"/> Announcements</h3>
            <ul className="space-y-3">
              {announcements.map(item => (
                <li key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-medium text-gray-700 truncate pr-4">{item.title}</span>
                  <button onClick={() => deleteTextDoc('announcements', item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
              {announcements.length === 0 && <p className="text-sm text-gray-400">No announcements found.</p>}
            </ul>
          </div>

          {/* Weekly Word List */}
          <div className="bg-white rounded-2xl border p-4 shadow-sm h-96 overflow-y-auto">
            <h3 className="font-bold text-green-600 mb-4 sticky top-0 bg-white pb-2 border-b flex items-center gap-2"><BookOpen className="w-4 h-4"/> Weekly Words</h3>
            <ul className="space-y-3">
              {verses.map(item => (
                <li key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-medium text-gray-700 truncate pr-4">{item.title}</span>
                  <button onClick={() => deleteTextDoc('verses', item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
              {verses.length === 0 && <p className="text-sm text-gray-400">No weekly words found.</p>}
            </ul>
          </div>

          {/* Sermons List */}
          <div className="bg-white rounded-2xl border p-4 shadow-sm h-96 overflow-y-auto">
            <h3 className="font-bold text-purple-600 mb-4 sticky top-0 bg-white pb-2 border-b flex items-center gap-2"><Video className="w-4 h-4"/> Sermons</h3>
            <ul className="space-y-3">
              {sermons.map(item => (
                <li key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-medium text-gray-700 truncate pr-4">{item.title}</span>
                  <button onClick={() => deleteTextDoc('sermons', item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
              {sermons.length === 0 && <p className="text-sm text-gray-400">No sermons found.</p>}
            </ul>
          </div>

          {/* Gallery List */}
          <div className="bg-white rounded-2xl border p-4 shadow-sm h-96 overflow-y-auto">
            <h3 className="font-bold text-blue-600 mb-4 sticky top-0 bg-white pb-2 border-b flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Gallery Events</h3>
            <ul className="space-y-3">
              {gallery.map(item => {
                const coverImage = getGalleryCoverImage(item);
                const imageCount = getGalleryImageCount(item);

                return (
                  <li key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {coverImage ? (
                        <img src={coverImage} alt={item.title} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded bg-gray-100">
                          <ImageIcon className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-gray-700 truncate pr-4">{item.title}</span>
                        <span className="block text-xs text-gray-400">{imageCount} {imageCount === 1 ? 'photo' : 'photos'}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteGalleryDoc(item)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                  </li>
                );
              })}
              {gallery.length === 0 && <p className="text-sm text-gray-400">No gallery events found.</p>}
            </ul>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
