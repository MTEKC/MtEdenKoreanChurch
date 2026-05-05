// 'use client';

// import Navbar from '@/components/Navbar';
// import { PlayCircle, User, Calendar } from 'lucide-react';

// // Mock Data
// const sermons = [
//     {
//         id: 1,
//         title: "The Power of Forgiveness",
//         preacher: "Rev. David Kim",
//         date: "Feb 16, 2026",
//         scripture: "Matthew 18:21-35",
//         summary: "Forgiveness is not just a feeling; it is a choice that sets us free. In this sermon, we explore why Jesus commands us to forgive seventy-seven times.",
//         youtubeId: "dQw4w9WgXcQ", // Replace with real YouTube Video ID (e.g., from the URL)
//     },
//     {
//         id: 2,
//         title: "Walking in Faith",
//         preacher: "Rev. David Kim",
//         date: "Feb 09, 2026",
//         scripture: "Hebrews 11:1-6",
//         summary: "What does it mean to have faith when we cannot see the outcome? We look at the heroes of faith and learn how to trust God in uncertainty.",
//         youtubeId: "M7lc1UVf-VE", // Replace with real YouTube Video ID
//     },
// ];

// export default function SermonsPage() {
//     return (
//         <main className="min-h-screen bg-gray-50 pt-20">
//             <Navbar />
//             <div className="max-w-6xl mx-auto px-4 py-12">
//                 <header className="mb-10 text-center">
//                     <h1 className="text-4xl font-bold text-gray-900">Sunday Sermons</h1>
//                     <p className="text-gray-600 mt-2">Watch and listen to the latest messages</p>
//                 </header>

//                 <div className="grid md:grid-cols-2 gap-8">
//                     {sermons.map((sermon) => (
//                         <div key={sermon.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition duration-300">

//                             {/* YouTube Video Section */}
//                             <div className="relative aspect-video bg-black">
//                                 <iframe
//                                     width="100%"
//                                     height="100%"
//                                     src={`https://www.youtube.com/embed/${sermon.youtubeId}`}
//                                     title={sermon.title}
//                                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                                     allowFullScreen
//                                     className="border-0"
//                                 ></iframe>
//                             </div>

//                             {/* Sermon Details */}
//                             <div className="p-6">
//                                 <div className="flex justify-between items-start mb-3">
//                                     <h2 className="text-xl font-bold text-gray-900 leading-tight">
//                                         {sermon.title}
//                                     </h2>
//                                 </div>

//                                 <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
//                                     <div className="flex items-center gap-1">
//                                         <User className="w-4 h-4" />
//                                         {sermon.preacher}
//                                     </div>
//                                     <div className="flex items-center gap-1">
//                                         <Calendar className="w-4 h-4" />
//                                         {sermon.date}
//                                     </div>
//                                 </div>

//                                 <div className="mb-4">
//                                     <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
//                                         {sermon.scripture}
//                                     </span>
//                                 </div>

//                                 <p className="text-gray-600 text-sm line-clamp-3">
//                                     {sermon.summary}
//                                 </p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </main>
//     );
// }

'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User, Calendar, Trash2 } from 'lucide-react';

interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  scripture: string;
  summary: string;
  youtubeId: string;
}

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth); // Checks if Admin is logged in

  useEffect(() => {
    const q = query(collection(db, 'sermons'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSermons(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Sermon[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sermon?")) {
      await deleteDoc(doc(db, 'sermons', id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Sunday Sermons</h1>
          <p className="text-gray-600 mt-2">Watch and listen to the latest messages</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">No sermons have been uploaded yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {sermons.map((sermon) => (
              <div key={sermon.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition duration-300 relative group">
                
                {/* Admin Delete Button */}
                {user && (
                  <button 
                    onClick={() => handleDelete(sermon.id)}
                    className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    title="Delete Sermon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* YouTube Video Section */}
                <div className="relative aspect-video bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${sermon.youtubeId}`}
                    title={sermon.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                  ></iframe>
                </div>

                {/* Sermon Details */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight mb-3">
                    {sermon.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" /> {sermon.preacher}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {sermon.date}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-1 rounded border border-purple-100">
                      {sermon.scripture}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {sermon.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
