// 'use client';

// import Navbar from '@/components/Navbar';
// import { Megaphone, Calendar, Clock, Pin } from 'lucide-react';

// // Mock Data (Replace with Firebase data later)
// const announcements = [
//     {
//         id: 1,
//         title: "수요일 사순절 예배",
//         date: "Feb 19, 2026",
//         category: "예배",
//         content: "이번해 첫 사순절을 맞이하여 수요일 예배를 개최합니다.",
//         isPinned: true, // Highlights this at the top
//     },
//     {
//         id: 2,
//         title: "Building Maintenance Fund",
//         date: "Feb 15, 2026",
//         category: "Finance",
//         content: "We are raising funds to repair the roof of the education center. If you would like to contribute, please mark your offering as 'Building Fund'.",
//         isPinned: false,
//     },
//     {
//         id: 3,
//         title: "New Bible Study Group",
//         date: "Feb 10, 2026",
//         category: "Community",
//         content: "A new study group for young adults is starting next Tuesday at 7 PM. Contact Deacon John for more details.",
//         isPinned: false,
//     },
// ];

// export default function AnnouncementsPage() {
//     return (
//         <main className="min-h-screen bg-gray-50 pt-20">
//             <Navbar />
//             <div className="max-w-4xl mx-auto px-4 py-12">
//                 <header className="mb-10 flex items-center gap-4">
//                     <div className="p-3 bg-orange-100 rounded-full">
//                         <Megaphone className="w-8 h-8 text-orange-600" />
//                     </div>
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
//                         <p className="text-gray-600">Stay updated with church news</p>
//                     </div>
//                 </header>

//                 <div className="space-y-6">
//                     {announcements.map((item) => (
//                         <div
//                             key={item.id}
//                             className={`bg-white rounded-xl shadow-sm border p-6 transition hover:shadow-md ${item.isPinned ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'
//                                 }`}
//                         >
//                             <div className="flex justify-between items-start mb-4">
//                                 <div className="flex gap-2 items-center">
//                                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.category === 'Event' ? 'bg-blue-100 text-blue-800' :
//                                         item.category === 'Finance' ? 'bg-green-100 text-green-800' :
//                                             'bg-gray-100 text-gray-800'
//                                         }`}>
//                                         {item.category}
//                                     </span>
//                                     {item.isPinned && (
//                                         <span className="flex items-center gap-1 text-xs font-semibold text-orange-600">
//                                             <Pin className="w-3 h-3" /> Pinned
//                                         </span>
//                                     )}
//                                 </div>
//                                 <span className="text-sm text-gray-400 flex items-center gap-1">
//                                     <Calendar className="w-3 h-3" /> {item.date}
//                                 </span>
//                             </div>

//                             <h2 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h2>
//                             <p className="text-gray-600 leading-relaxed">{item.content}</p>
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
import { Megaphone, Calendar, Pin, Trash2 } from 'lucide-react';

// Define what our announcement data looks like
interface Announcement {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  isPinned: boolean;
  createdAt?: Timestamp;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Checks if you (the Admin) are currently logged in
  const [user] = useAuthState(auth); 

  useEffect(() => {
    // 1. Point to the 'announcements' drawer in Firestore
    const announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc') // Fetch newest first
    );

    // 2. Listen for real-time updates
    const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Announcement[];

      // 3. Sort them so "Pinned" announcements always stay at the top
      const sortedAnnouncements = fetched.sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
      });

      setAnnouncements(sortedAnnouncements);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Admin Delete Function
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  };

  // Filter announcements based on selected category
  const filteredAnnouncements = selectedCategory === 'All' 
    ? announcements 
    : announcements.filter(item => item.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-10 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <Megaphone className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600">Stay updated with church news</p>
          </div>
        </header>

        {/* Category Tabs */}
        {!loading && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Monday Class', 'Sunday Class', 'Mission', 'General News'].map((cat) => (
               <button
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                   selectedCategory === cat
                     ? 'bg-orange-600 text-white shadow-md'
                     : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                 }`}
               >
                 {cat}
               </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">No announcements found in this category.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAnnouncements.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-xl shadow-sm border p-6 transition relative group ${
                  item.isPinned ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                {/* Admin Delete Button - Only visible if logged in */}
                {user && (
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <div className="flex justify-between items-start mb-4 pr-10">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.category === 'Monday Class' ? 'bg-blue-100 text-blue-800' :
                      item.category === 'Sunday Class' ? 'bg-green-100 text-green-800' :
                      item.category === 'Mission' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.category}
                    </span>
                    {item.isPinned && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>
                  {item.date && (
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {item.date}
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h2>
                {/* 'whitespace-pre-wrap' allows paragraph breaks (Enters) to show properly */}
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
