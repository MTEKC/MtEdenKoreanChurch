// 'use client';

// import Navbar from '@/components/Navbar';
// import { BookOpen } from 'lucide-react';

// // Sample Data (In real life, you fetch this from Firebase!)
// const verses = [
//     {
//         id: 1,
//         date: 'Feb 12, 2026',
//         title: 'Strength in Waiting',
//         passage: 'Isaiah 40:31',
//         text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
//     },
//     {
//         id: 2,
//         date: 'Feb 05, 2026',
//         title: 'The Peace of God',
//         passage: 'Philippians 4:6-7',
//         text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
//     }
// ];

// export default function VersesPage() {
//     return (
//         <main className="min-h-screen bg-gray-50 pt-20">
//             <Navbar />
//             <div className="max-w-3xl mx-auto px-4 py-12">
//                 <header className="mb-10 text-center">
//                     <span className="inline-block p-3 rounded-full bg-blue-100 mb-4">
//                         <BookOpen className="w-8 h-8 text-blue-600" />
//                     </span>
//                     <h1 className="text-3xl font-bold text-gray-900">Weekly Word</h1>
//                     <p className="text-gray-600 mt-2">A verse to meditate on for the week</p>
//                 </header>

//                 {/* Notice Board List */}
//                 <div className="space-y-6">
//                     {verses.map((verse) => (
//                         <div key={verse.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
//                             {/* Header of the Card */}
//                             <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
//                                 <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
//                                     Week of {verse.date}
//                                 </span>
//                                 <span className="text-sm text-gray-500 font-medium">{verse.passage}</span>
//                             </div>

//                             {/* Content of the Card */}
//                             <div className="p-6">
//                                 <h2 className="text-xl font-bold text-gray-800 mb-3">{verse.title}</h2>
//                                 <p className="text-gray-600 italic leading-relaxed text-lg font-serif">
//                                     "{verse.text}"
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
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, type Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BookOpen, Calendar, Trash2 } from 'lucide-react';
import CommentSection from '@/components/CommentSection'; // Import our comment component

interface VerseData {
  id: string;
  title: string;
  scripture: string;
  message: string;
  createdAt?: Timestamp;
}

export default function VersesPage() {
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth); // Admin Check

  useEffect(() => {
    const q = query(collection(db, 'verses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVerses(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as VerseData[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this Weekly Word?")) {
      await deleteDoc(doc(db, 'verses', id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <div className="inline-block bg-green-100 p-3 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Weekly Word</h1>
          <p className="text-gray-600 mt-2">Reflections and devotionals from our pastoral team</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : verses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">No devotionals posted yet.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {verses.map((verse) => (
              <div key={verse.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 relative">
                
                {/* Admin Delete Button */}
                {user && (
                  <button 
                    onClick={() => handleDelete(verse.id)}
                    className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <div className="p-8">
                  <div className="mb-6">
                    <span className="inline-block bg-green-50 text-green-700 font-bold px-4 py-2 rounded-lg border border-green-100 mb-4">
                      {verse.scripture}
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{verse.title}</h2>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> 
                      {verse.createdAt?.seconds ? new Date(verse.createdAt.seconds * 1000).toLocaleDateString() : 'Just posted'}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {verse.message}
                  </p>
                </div>

                {/* Attach the Comment Section, passing the specific post's ID */}
                <CommentSection postId={verse.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
