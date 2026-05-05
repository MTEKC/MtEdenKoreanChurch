// 'use client';

// import { useState, useEffect } from 'react';
// import { db, auth } from '@/lib/firebase';
// import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
// import { Trash2, MessageSquare } from 'lucide-react';
// import { useAuthState } from 'react-firebase-hooks/auth'; // Checks if YOU are logged in

// export default function CommentSection({ postId }: { postId: string }) {
//     const [comments, setComments] = useState<any[]>([]);
//     const [newComment, setNewComment] = useState('');
//     const [authorName, setAuthorName] = useState('');

//     // This hook tells us if the current browser user is an Admin
//     const [user] = useAuthState(auth);

//     // 1. Fetch Comments in Real-time
//     useEffect(() => {
//         const q = query(
//             collection(db, "comments"),
//             where("postId", "==", postId),
//             orderBy("createdAt", "desc")
//         );

//         const unsubscribe = onSnapshot(q, (snapshot) => {
//             setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//         });

//         return () => unsubscribe();
//     }, [postId]);

//     // 2. Handle New Comment (Public)
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!newComment.trim() || !authorName.trim()) return;

//         await addDoc(collection(db, "comments"), {
//             postId,
//             text: newComment,
//             author: authorName, // User types their own name
//             createdAt: serverTimestamp()
//         });

//         setNewComment(''); // Clear input
//     };

//     // 3. Handle Delete (Admin Only)
//     const handleDelete = async (commentId: string) => {
//         if (confirm("Are you sure you want to delete this comment?")) {
//             await deleteDoc(doc(db, "comments", commentId));
//         }
//     };

//     return (
//         <div className="mt-8 border-t pt-6">
//             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
//                 <MessageSquare className="w-5 h-5" /> Comments
//             </h3>

//             {/* Input Form */}
//             <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
//                 <div className="mb-2">
//                     <input
//                         type="text"
//                         placeholder="Your Name"
//                         value={authorName}
//                         onChange={(e) => setAuthorName(e.target.value)}
//                         className="w-full md:w-1/3 p-2 border rounded text-sm mb-2 md:mb-0 mr-2"
//                         required
//                     />
//                 </div>
//                 <textarea
//                     placeholder="Share your thoughts..."
//                     value={newComment}
//                     onChange={(e) => setNewComment(e.target.value)}
//                     className="w-full p-2 border rounded text-sm h-20 resize-none"
//                     required
//                 />
//                 <div className="mt-2 text-right">
//                     <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700">
//                         Post
//                     </button>
//                 </div>
//             </form>

//             {/* List of Comments */}
//             <div className="space-y-4">
//                 {comments.map((comment) => (
//                     <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 relative group">
//                         <div className="flex justify-between items-start mb-1">
//                             <span className="font-bold text-gray-800 text-sm">{comment.author}</span>
//                             <span className="text-xs text-gray-400">
//                                 {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
//                             </span>
//                         </div>
//                         <p className="text-gray-600 text-sm">{comment.text}</p>

//                         {/* The Magic: Only show Delete button if 'user' (Admin) is logged in */}
//                         {user && (
//                             <button
//                                 onClick={() => handleDelete(comment.id)}
//                                 className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
//                                 title="Delete Comment (Admin Only)"
//                             >
//                                 <Trash2 className="w-4 h-4" />
//                             </button>
//                         )}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }


'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, orderBy, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { Trash2, MessageSquare } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt?: Timestamp;
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [user] = useAuthState(auth); // Admin Check

  useEffect(() => {
    const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({
        id: doc.id,
        author: doc.data().author || 'Anonymous',
        text: doc.data().text || '',
        createdAt: doc.data().createdAt,
      })));
    });
    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    await addDoc(collection(db, "comments"), {
      postId,
      text: newComment,
      author: authorName,
      createdAt: serverTimestamp()
    });
    setNewComment('');
  };

  const handleDelete = async (commentId: string) => {
    if (confirm("Delete this comment?")) {
      await deleteDoc(doc(db, "comments", commentId));
    }
  };

  return (
    <div className="mt-8 border-t pt-6 bg-gray-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
        <MessageSquare className="w-5 h-5 text-blue-600" /> Community Thoughts
      </h3>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <input 
          type="text" 
          placeholder="Your Name (Required)" 
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <textarea 
          placeholder="Share your thoughts or prayers..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm h-20 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <div className="mt-2 text-right">
          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Post Comment
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
            <div className="flex justify-between items-start mb-1 pr-8">
              <span className="font-bold text-gray-800 text-sm">{comment.author}</span>
              <span className="text-xs text-gray-400">
                {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
              </span>
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{comment.text}</p>
            
            {user && (
              <button onClick={() => handleDelete(comment.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors bg-white rounded-full p-1" title="Delete Comment">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
