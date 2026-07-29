'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AuthGuard from '@/components/AuthGuard';
import AdminNotice, { AdminNoticeMessage } from '@/components/admin/AdminNotice';
import { BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminVersesUpload() {
  const [title, setTitle] = useState('');
  const [scripture, setScripture] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<AdminNoticeMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setLoading(true);

    try {
      await addDoc(collection(db, 'verses'), {
        title: title.trim(),
        scripture: scripture.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      });

      setNotice({ type: 'success', message: '주간 말씀을 등록했습니다.' });
      setTitle(''); setScripture(''); setMessage('');
    } catch (error) {
      console.error("Error posting Weekly Word: ", error);
      setNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '주간 말씀 등록에 실패했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> 관리자 화면으로
        </Link>
        
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">주간 말씀 등록</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="예: 하나님의 신실하심" required />
            <p className="mt-1 text-right text-xs text-gray-400">{title.length}/120</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">성경 구절</label>
            <input type="text" value={scripture} onChange={(e) => setScripture(e.target.value)} maxLength={100} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="예: 예레미야애가 3:22-23" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">말씀 묵상</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} maxLength={4000} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-y" placeholder="묵상 내용을 입력해 주세요." required />
            <p className="mt-1 text-right text-xs text-gray-400">{message.length}/4000</p>
          </div>

          {notice ? (
            <AdminNotice
              {...notice}
              onDismiss={() => setNotice(null)}
            />
          ) : null}

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 등록 중...</> : '주간 말씀 등록'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
