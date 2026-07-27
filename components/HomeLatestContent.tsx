'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Megaphone,
  Play,
  UserRound,
} from 'lucide-react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Announcement {
  id: string;
  title: string;
  date?: string;
  category?: string;
  isPinned?: boolean;
  createdAt?: Timestamp;
}

interface Sermon {
  id: string;
  title: string;
  preacher?: string;
  date?: string;
  scripture?: string;
  youtubeId: string;
}

interface WeeklyWord {
  id: string;
  title: string;
  scripture?: string;
  message?: string;
}

const categoryLabels: Record<string, string> = {
  Event: '행사',
  'Monday Class': '월요 모임',
  'Sunday Class': '주일 모임',
  Mission: '선교',
  'General News': '교회 소식',
};

function formatDate(date?: string, createdAt?: Timestamp) {
  if (date) {
    const dateParts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateParts) {
      return `${dateParts[1]}년 ${Number(dateParts[2])}월 ${Number(dateParts[3])}일`;
    }
    return date;
  }

  if (createdAt) {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(createdAt.toDate());
  }

  return '';
}

function getYoutubeId(value: string) {
  const match = value
    .trim()
    .match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)?([a-zA-Z0-9_-]{6,})/);
  return match?.[1] || '';
}

function getMessagePreview(message?: string) {
  if (!message) {
    return '';
  }

  const normalized = message.replace(/\s+/g, ' ').trim();
  return normalized.length > 180 ? `${normalized.slice(0, 180)}...` : normalized;
}

function LoadingRows() {
  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200" aria-label="콘텐츠를 불러오는 중">
      {[0, 1, 2].map((row) => (
        <div key={row} className="py-5">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function HomeLatestContent() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [sermon, setSermon] = useState<Sermon | null | undefined>(undefined);
  const [weeklyWord, setWeeklyWord] = useState<WeeklyWord | null | undefined>(undefined);

  useEffect(() => {
    const announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const sermonQuery = query(
      collection(db, 'sermons'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const weeklyWordQuery = query(
      collection(db, 'verses'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeAnnouncements = onSnapshot(
      announcementsQuery,
      (snapshot) => {
        setAnnouncements(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })) as Announcement[]
        );
      },
      () => setAnnouncements([])
    );

    const unsubscribeSermon = onSnapshot(
      sermonQuery,
      (snapshot) => {
        const document = snapshot.docs[0];
        setSermon(document ? ({ id: document.id, ...document.data() } as Sermon) : null);
      },
      () => setSermon(null)
    );

    const unsubscribeWeeklyWord = onSnapshot(
      weeklyWordQuery,
      (snapshot) => {
        const document = snapshot.docs[0];
        setWeeklyWord(document ? ({ id: document.id, ...document.data() } as WeeklyWord) : null);
      },
      () => setWeeklyWord(null)
    );

    return () => {
      unsubscribeAnnouncements();
      unsubscribeSermon();
      unsubscribeWeeklyWord();
    };
  }, []);

  const youtubeId = sermon ? getYoutubeId(sermon.youtubeId) : '';

  return (
    <>
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-7 flex items-end justify-between gap-5">
              <div>
                <Megaphone className="h-7 w-7 text-orange-600" aria-hidden="true" />
                <h2 className="mt-3 text-3xl font-bold text-slate-950">교회 소식</h2>
              </div>
              <Link
                href="/announcements"
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-900"
              >
                전체보기
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {announcements === null ? (
              <LoadingRows />
            ) : announcements.length === 0 ? (
              <div className="border-y border-slate-200 py-12 text-center text-slate-500">
                등록된 새 소식이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {announcements.map((announcement) => (
                  <Link
                    key={announcement.id}
                    href="/announcements"
                    className="group grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-orange-700">
                        <span>
                          {categoryLabels[announcement.category || ''] ||
                            announcement.category ||
                            '소식'}
                        </span>
                        {announcement.isPinned && <span className="text-slate-500">중요</span>}
                      </div>
                      <h3 className="mt-2 truncate text-lg font-bold text-slate-900 group-hover:text-blue-700">
                        {announcement.title}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      {formatDate(announcement.date, announcement.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-7 flex items-end justify-between gap-5">
              <div>
                <Play className="h-7 w-7 text-blue-700" aria-hidden="true" />
                <h2 className="mt-3 text-3xl font-bold text-slate-950">최근 설교</h2>
              </div>
              <Link
                href="/sermons"
                className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-900"
              >
                설교 전체보기
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {sermon === undefined ? (
              <div className="aspect-video animate-pulse rounded-lg bg-slate-200" />
            ) : sermon === null ? (
              <div className="flex aspect-video items-center justify-center border-y border-slate-200 text-slate-500">
                등록된 설교가 없습니다.
              </div>
            ) : (
              <article>
                {youtubeId ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${youtubeId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-video overflow-hidden rounded-lg bg-slate-900"
                    aria-label={`${sermon.title} 설교를 YouTube에서 보기`}
                  >
                    <Image
                      src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
                    <span className="absolute left-1/2 top-1/2 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                      <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
                    </span>
                  </a>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-900 text-white/70">
                    설교 영상 준비 중
                  </div>
                )}

                <h3 className="mt-5 text-2xl font-bold text-slate-950">{sermon.title}</h3>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  {sermon.preacher && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                      {sermon.preacher}
                    </span>
                  )}
                  {sermon.date && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      {formatDate(sermon.date)}
                    </span>
                  )}
                </div>
                {sermon.scripture && (
                  <p className="mt-3 text-sm font-semibold text-blue-700">{sermon.scripture}</p>
                )}
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100 bg-blue-50 py-10 sm:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-center gap-4">
            <BookOpen className="h-9 w-9 shrink-0 text-blue-700" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-slate-950">이번 주 말씀</h2>
          </div>

          {weeklyWord === undefined ? (
            <div className="h-16 animate-pulse rounded bg-blue-100" />
          ) : weeklyWord === null ? (
            <p className="text-slate-600">새로운 말씀이 곧 등록됩니다.</p>
          ) : (
            <div>
              <p className="text-lg font-bold text-slate-900">{weeklyWord.title}</p>
              {weeklyWord.message && (
                <p className="mt-2 leading-7 text-slate-600">{getMessagePreview(weeklyWord.message)}</p>
              )}
              {weeklyWord.scripture && (
                <p className="mt-2 text-sm font-bold text-blue-700">{weeklyWord.scripture}</p>
              )}
            </div>
          )}

          <Link
            href="/verses"
            className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900"
          >
            말씀 전체보기
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
