'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AuthGuard from '@/components/AuthGuard';
import AdminNotice, { AdminNoticeMessage } from '@/components/admin/AdminNotice';
import LiteYouTubeEmbed from '@/components/LiteYouTubeEmbed';
import { getYouTubeVideoId } from '@/lib/youtube';
import { Video, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminSermonsUpload() {
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [date, setDate] = useState('');
  const [scripture, setScripture] = useState('');
  const [summary, setSummary] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<AdminNoticeMessage | null>(null);
  const youtubeId = getYouTubeVideoId(youtubeInput);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!youtubeId) {
      setNotice({
        type: 'error',
        message: '올바른 YouTube 주소 또는 11자리 영상 ID를 입력해 주세요.',
      });
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'sermons'), {
        title: title.trim(),
        preacher: preacher.trim(),
        date,
        scripture: scripture.trim(),
        summary: summary.trim(),
        youtubeId,
        createdAt: serverTimestamp(),
      });

      setNotice({ type: 'success', message: '설교를 등록했습니다.' });
      
      // Clear form
      setTitle('');
      setPreacher('');
      setDate('');
      setScripture('');
      setSummary('');
      setYoutubeInput('');
    } catch (error) {
      console.error("Error posting sermon: ", error);
      setNotice({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '설교 등록에 실패했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> 관리자 화면으로
        </Link>
        
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Video className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">설교 등록</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">설교 제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
              <p className="mt-1 text-right text-xs text-gray-400">{title.length}/120</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">설교자</label>
              <input type="text" value={preacher} onChange={(e) => setPreacher(e.target.value)} maxLength={80} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">설교 날짜</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">본문 말씀</label>
              <input type="text" value={scripture} onChange={(e) => setScripture(e.target.value)} maxLength={100} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="예: 요한복음 3:16" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube 주소 또는 영상 ID</label>
              <input
                type="text"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="YouTube 영상 주소를 그대로 붙여 넣으세요."
                required
              />
              <p className={`mt-1 text-xs ${youtubeInput && !youtubeId ? 'text-red-600' : 'text-gray-400'}`}>
                {youtubeInput && !youtubeId
                  ? '영상 주소 또는 ID를 확인해 주세요.'
                  : youtubeId
                    ? `영상 ID 확인됨: ${youtubeId}`
                    : '일반 영상, 단축 주소, Shorts 주소를 자동으로 인식합니다.'}
              </p>

              {youtubeId ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-gray-700">영상 미리보기</p>
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-950">
                    <LiteYouTubeEmbed
                      videoId={youtubeId}
                      title={title.trim() || '설교 영상 미리보기'}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    썸네일만 먼저 불러오며 재생 버튼을 누를 때만 YouTube 영상이 로드됩니다.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">설교 요약</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} maxLength={3000} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-y" required />
            <p className="mt-1 text-right text-xs text-gray-400">{summary.length}/3000</p>
          </div>

          {notice ? (
            <AdminNotice
              {...notice}
              onDismiss={() => setNotice(null)}
            />
          ) : null}

          <button type="submit" disabled={loading || !youtubeId} className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> 등록 중...</> : '설교 등록'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
