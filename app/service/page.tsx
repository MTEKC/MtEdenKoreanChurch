import Link from 'next/link';
import {
  Accessibility,
  ArrowRight,
  Baby,
  CalendarDays,
  Clock3,
  Languages,
  MapPin,
  MessageCircleQuestion,
  Navigation,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const services = [
  {
    title: '주일예배',
    schedule: '매주 일요일 오전 11:30–오후 12:30',
    location: 'Mt Eden Village Centre 예배실',
    language: '한국어',
  },
  {
    title: '주일학교',
    schedule: '매주 일요일 오후 12:00–12:30',
    location: 'Mt Eden Village Centre 홀',
    language: '한국어',
  },
  {
    title: '금요기도회',
    schedule: '매주 금요일 오후 8:00–9:00',
    location: 'Mt Eden Village Centre 예배실',
    language: '한국어',
  },
];

const visitTips = [
  {
    icon: Clock3,
    title: '도착 시간',
    description: '처음 방문하신다면 예배 시작 10분 전 도착을 권합니다.',
  },
  {
    icon: Baby,
    title: '어린이 동반',
    description: '주일학교 공간과 당일 안내가 필요하면 방문 전에 문의해 주세요.',
  },
  {
    icon: Accessibility,
    title: '접근성 안내',
    description: '이동이나 좌석에 도움이 필요하시면 미리 알려 주시면 안내해 드립니다.',
  },
  {
    icon: MessageCircleQuestion,
    title: '주차·입구 문의',
    description: '주변 주차 상황과 건물 입구 안내는 방문 전에 문의하시면 가장 정확합니다.',
  },
];

const directionsUrl =
  'https://www.google.com/maps/dir/?api=1&destination=449+Mount+Eden+Road%2C+Mount+Eden%2C+Auckland';

export default function ServicePage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <Navbar />

      <section className="border-b border-blue-100 bg-blue-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <h1 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            예배 안내
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            처음 오시는 분도 편안하게 함께 예배하실 수 있습니다.
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-bold text-blue-900 sm:text-xl">
            <span>주일예배</span>
            <span>매주 일요일 오전 11:30</span>
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-blue-700 px-5 font-bold text-white transition-colors hover:bg-blue-800"
            >
              <Navigation className="h-5 w-5" aria-hidden="true" />
              Google 지도에서 길찾기
            </a>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-5 font-bold text-blue-800 transition-colors hover:bg-blue-100"
            >
              방문 전에 문의하기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section aria-labelledby="service-schedule-heading">
          <div className="mb-8">
            <p className="text-sm font-bold text-blue-700">정기 예배</p>
            <h2 id="service-schedule-heading" className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              예배 시간과 장소
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-blue-800">{service.title}</h3>
                <dl className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
                    <div>
                      <dt className="font-bold text-slate-900">시간</dt>
                      <dd>{service.schedule}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
                    <div>
                      <dt className="font-bold text-slate-900">장소</dt>
                      <dd>{service.location}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Languages className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
                    <div>
                      <dt className="font-bold text-slate-900">언어</dt>
                      <dd>{service.language}</dd>
                    </div>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16" aria-labelledby="first-visit-heading">
          <div className="mb-8">
            <p className="text-sm font-bold text-blue-700">첫 방문 안내</p>
            <h2 id="first-visit-heading" className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              방문 전에 확인해 주세요
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {visitTips.map(({ icon: Icon, title, description }) => (
              <article key={title} className="bg-white p-6 sm:p-7">
                <Icon className="h-7 w-7 text-blue-700" aria-hidden="true" />
                <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-slate-900 px-6 py-8 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-8">
          <div>
            <h2 className="text-xl font-bold">소그룹 모임 일정이 궁금하신가요?</h2>
            <p className="mt-2 leading-7 text-slate-300">
              소그룹 일정과 장소는 시기에 따라 달라질 수 있습니다. 최신 소식에서 확인하거나 교회로 문의해 주세요.
            </p>
          </div>
          <div className="mt-5 flex shrink-0 flex-col gap-3 sm:mt-0 sm:flex-row">
            <Link
              href="/announcements"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-600 px-5 font-bold transition-colors hover:bg-slate-800"
            >
              소식·행사 보기
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 font-bold text-slate-950 transition-colors hover:bg-blue-50"
            >
              문의하기
            </Link>
          </div>
        </section>

        <p className="mt-8 flex items-start gap-2 text-sm leading-6 text-slate-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          449 Mount Eden Road, Mount Eden, Auckland 1024
        </p>
      </div>
    </main>
  );
}
