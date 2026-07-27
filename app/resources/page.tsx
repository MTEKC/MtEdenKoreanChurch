'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Download, ExternalLink, FileText } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, type Timestamp } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';

const categories = ['전체', '주보', '교육·양육', '행사 자료', '신청서·서식'];

interface ResourceItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  date?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  createdAt?: Timestamp;
}

function formatDate(resource: ResourceItem) {
  if (resource.date) {
    return resource.date.replaceAll('-', '. ');
  }

  if (resource.createdAt) {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(resource.createdAt.toDate());
  }

  return '등록일 미정';
}

function formatFileSize(bytes?: number) {
  if (!bytes) {
    return 'PDF';
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function getDownloadUrl(fileUrl: string) {
  return fileUrl.includes('/upload/')
    ? fileUrl.replace('/upload/', '/upload/fl_attachment/')
    : fileUrl;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const resourcesQuery = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));

    return onSnapshot(
      resourcesQuery,
      (snapshot) => {
        setResources(snapshot.docs.map((resource) => ({ id: resource.id, ...resource.data() })) as ResourceItem[]);
        setLoading(false);
        setError(false);
      },
      () => {
        setError(true);
        setLoading(false);
      }
    );
  }, []);

  const filteredResources = selectedCategory === '전체'
    ? resources
    : resources.filter((resource) => resource.category === selectedCategory);

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <p className="text-sm font-semibold text-blue-700">자료실 · Resources</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">교회 자료실</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">주보, 교육 자료, 행사 자료와 각종 서식을 확인하고 내려받으실 수 있습니다.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2" aria-label="자료 분류">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-blue-50 hover:text-blue-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20" aria-label="자료를 불러오는 중">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" />
          </div>
        ) : error ? (
          <div className="border-l-4 border-red-500 bg-white px-6 py-8 text-slate-700">자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>
        ) : filteredResources.length === 0 ? (
          <div className="border-l-4 border-slate-300 bg-white px-6 py-12 text-center text-slate-500">등록된 자료가 없습니다.</div>
        ) : (
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200 bg-white">
            {filteredResources.map((resource) => (
              <article key={resource.id} className="grid gap-5 px-5 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">{resource.category}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(resource)}</span>
                  </div>
                  <h2 className="mt-3 truncate text-lg font-bold text-slate-900">{resource.title}</h2>
                  {resource.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{resource.description}</p>}
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><FileText className="h-4 w-4" aria-hidden="true" />{resource.fileName || 'PDF 자료'} · {formatFileSize(resource.fileSize)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-700 hover:text-blue-800"
                  >
                    보기 <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a
                    href={getDownloadUrl(resource.fileUrl)}
                    download={resource.fileName || true}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-700 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                  >
                    다운로드 <Download className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
