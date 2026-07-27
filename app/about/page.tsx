import Link from 'next/link';
import { ArrowRight, HeartHandshake, Landmark, UsersRound } from 'lucide-react';
import Navbar from '@/components/Navbar';

const values = [
  {
    title: '말씀 위에 서는 공동체',
    description: '성경을 바르게 배우고, 일상의 자리에서 믿음으로 살아가기를 소망합니다.',
    icon: Landmark,
  },
  {
    title: '서로를 돌보는 공동체',
    description: '이민 생활의 기쁨과 어려움을 함께 나누며 서로를 따뜻하게 격려합니다.',
    icon: HeartHandshake,
  },
  {
    title: '지역을 섬기는 공동체',
    description: '이웃과 지역사회에 축복의 통로가 되는 교회를 함께 만들어 갑니다.',
    icon: UsersRound,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white pt-20">
      <Navbar />

      <section className="border-b border-blue-100 bg-blue-50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-3 text-sm font-semibold text-blue-700">교회소개 · About Our Church</p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">마운트 이든 한인교회</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            뉴질랜드에서 말씀을 중심으로 예배하고, 서로를 돌보며, 지역사회를 섬기는 한인 신앙공동체입니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold text-blue-700">우리 교회</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">삶과 맞닿아 있는 믿음</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-700">
            <p>
              마운트 이든 한인교회는 뉴질랜드 감리교단 노던시노드 코리안패리쉬에 소속된 교회입니다.
            </p>
            <p>
              건강한 신앙의 전통을 소중히 여기며, 정의와 공의가 우리의 일상에서 실현되는 삶을 함께 추구합니다.
              관념이 아닌 실제 삶에 뿌리내린 신앙으로 이웃과 지역사회에 축복의 통로가 되기를 소망합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-sm font-semibold text-blue-700">함께 지향하는 가치</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {values.map(({ title, description, icon: Icon }) => (
              <div key={title} className="border-t-2 border-blue-700 pt-5">
                <Icon className="h-6 w-6 text-blue-700" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="flex flex-col justify-between gap-6 border-l-4 border-blue-700 pl-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-700">예배와 방문</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">함께 예배하기를 기다립니다.</h2>
            <p className="mt-3 text-slate-600">예배 시간과 위치, 문의 방법은 오시는 길·문의 페이지에서 확인하실 수 있습니다.</p>
          </div>
          <Link href="/contact" className="inline-flex shrink-0 items-center gap-2 font-semibold text-blue-700 transition-colors hover:text-blue-900">
            오시는 길·문의 <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
