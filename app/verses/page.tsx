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
import ContentLoadError from '@/components/ContentLoadError';

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
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [user] = useAuthState(auth); // Admin Check

  useEffect(() => {
    const q = query(collection(db, 'verses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setVerses(snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as VerseData[]);
        setLoadError(false);
        setLoading(false);
      },
      (error) => {
        console.error('주간 말씀 불러오기 오류:', error);
        setLoadError(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [retryKey]);

  const retryLoading = () => {
    setLoading(true);
    setLoadError(false);
    setRetryKey((key) => key + 1);
  };

  const handleDelete = async (id: string) => {
    if (confirm("이 주간 말씀을 삭제하시겠습니까?\n삭제한 내용은 복구할 수 없습니다.")) {
      await deleteDoc(doc(db, 'verses', id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <div className="inline-block bg-blue-100 p-3 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-blue-700" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">주간 말씀</h1>
          <p className="text-gray-600 mt-2">목회자와 함께 묵상하는 이번 주의 말씀입니다.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20" role="status">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" aria-hidden="true"></div>
            <span className="sr-only">주간 말씀을 불러오는 중입니다.</span>
          </div>
        ) : loadError ? (
          <ContentLoadError onRetry={retryLoading} message="주간 말씀을 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요." />
        ) : verses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">등록된 주간 말씀이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {verses.map((verse) => (
              <div key={verse.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 relative">
                
                {/* Admin Delete Button */}
                {user && (
                  <button 
                    onClick={() => handleDelete(verse.id)}
                    className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 sm:top-6 sm:right-6"
                    title="주간 말씀 삭제"
                    aria-label={`${verse.title} 삭제`}
                  >
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}

                <div className="p-8">
                  <div className="mb-6">
                    <span className="mb-4 inline-block rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 font-bold text-blue-700">
                      {verse.scripture}
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{verse.title}</h2>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      {verse.createdAt?.seconds
                        ? new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(verse.createdAt.seconds * 1000))
                        : '방금 게시됨'}
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
