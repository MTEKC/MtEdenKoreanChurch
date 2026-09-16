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
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [user] = useAuthState(auth); // Admin Check

  useEffect(() => {
    const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setComments(snapshot.docs.map(doc => ({
          id: doc.id,
          author: doc.data().author || '익명',
          text: doc.data().text || '',
          createdAt: doc.data().createdAt,
        })));
        setLoadError(false);
      },
      (error) => {
        console.error('댓글 불러오기 오류:', error);
        setLoadError(true);
      }
    );
    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    setSubmitting(true);
    setStatusMessage('');
    try {
      await addDoc(collection(db, "comments"), {
        postId,
        text: newComment,
        author: authorName,
        createdAt: serverTimestamp()
      });
      setNewComment('');
      setStatusMessage('나눔이 등록되었습니다.');
    } catch (error) {
      console.error('댓글 등록 오류:', error);
      setStatusMessage('나눔을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm("이 나눔을 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "comments", commentId));
    }
  };

  return (
    <div className="mt-8 border-t pt-6 bg-gray-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
        <MessageSquare className="w-5 h-5 text-blue-600" aria-hidden="true" /> 함께 나누기
      </h3>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <input 
          type="text" 
          placeholder="이름 (필수)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <textarea 
          placeholder="묵상이나 기도 제목을 나눠 주세요."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm h-20 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <div className="mt-2 text-right">
          <button type="submit" disabled={submitting} className="min-h-11 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? '등록하는 중...' : '나눔 등록'}
          </button>
        </div>
        {statusMessage && <p role="status" className="mt-3 text-sm text-gray-700">{statusMessage}</p>}
      </form>

      {loadError && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          나눔을 불러오지 못했습니다. 잠시 후 페이지를 새로고침해 주세요.
        </p>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group">
            <div className="flex justify-between items-start mb-1 pr-8">
              <span className="font-bold text-gray-800 text-sm">{comment.author}</span>
              <span className="text-xs text-gray-500">
                {comment.createdAt?.seconds
                  ? new Intl.DateTimeFormat('ko-KR').format(new Date(comment.createdAt.seconds * 1000))
                  : '방금 등록됨'}
              </span>
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{comment.text}</p>
            
            {user && (
              <button onClick={() => handleDelete(comment.id)} className="absolute top-2 right-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600" title="나눔 삭제" aria-label={`${comment.author}님의 나눔 삭제`}>
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
