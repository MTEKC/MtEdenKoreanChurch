import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  HeartHandshake,
  MapPin,
} from 'lucide-react';
import HomeHeroBanner from '@/components/HomeHeroBanner';
import HomeLatestContent from '@/components/HomeLatestContent';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';

const mapEmbedUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6382.656091442055!2d174.75900667741848!3d-36.882499781393975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d0d4632b82dd291%3A0xf748835c68dd93a9!2sMt%20Eden%20Village%20Centre!5e0!3m2!1sko!2snz!4v1770990091280!5m2!1sko!2snz';

const mapDirectionsUrl =
  'https://www.google.com/maps/dir/?api=1&destination=449+Mount+Eden+Road%2C+Mount+Eden%2C+Auckland';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-20">
      <Navbar />
      <HomeHeroBanner />

      <section className="border-b border-slate-200 bg-white" aria-label="주일예배 핵심 안내">
        <div className="mx-auto grid max-w-6xl divide-y divide-slate-200 px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
          <Link
            href="/service"
            className="group flex min-h-24 items-center gap-4 py-5 md:px-6 md:first:pl-0"
          >
            <CalendarDays className="h-7 w-7 shrink-0 text-blue-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-500">주일예배</p>
              <p className="mt-1 font-bold text-slate-900 group-hover:text-blue-700">매주 일요일</p>
            </div>
          </Link>

          <Link
            href="/service"
            className="group flex min-h-24 items-center gap-4 py-5 md:px-6"
          >
            <Clock3 className="h-7 w-7 shrink-0 text-blue-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-500">예배 시간</p>
              <p className="mt-1 font-bold text-slate-900 group-hover:text-blue-700">오전 11:30</p>
            </div>
          </Link>

          <a
            href={mapDirectionsUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex min-h-24 items-center gap-4 py-5 md:px-6 md:last:pr-0"
          >
            <MapPin className="h-7 w-7 shrink-0 text-blue-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-500">오시는 길</p>
              <p className="mt-1 font-bold text-slate-900 group-hover:text-blue-700">
                449 Mount Eden Road
              </p>
            </div>
          </a>
        </div>
      </section>

      <HomeLatestContent />

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <p className="text-sm font-bold text-blue-700">마운트 이든 한인교회</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              함께 믿고, 함께 살아가는 공동체
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              말씀 위에 서서 서로를 따뜻하게 돌보고, 이민 생활의 기쁨과 어려움을 함께 나누며,
              지역사회에 축복의 통로가 되기를 소망합니다.
            </p>
            <Link
              href="/about"
              className="mt-7 inline-flex items-center gap-2 font-bold text-blue-700 transition-colors hover:text-blue-900"
            >
              교회소개 더 보기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="border-l-4 border-blue-700 bg-white px-6 py-7">
            <HeartHandshake className="h-8 w-8 text-blue-700" aria-hidden="true" />
            <p className="mt-5 text-lg font-bold text-slate-900">
              처음 방문하시는 분도 편안하게 예배하실 수 있습니다.
            </p>
            <p className="mt-3 leading-7 text-slate-600">
              예배와 방문에 관해 궁금한 점이 있으시면 언제든지 편하게 문의해 주세요.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
            >
              방문 문의하기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="text-sm font-bold text-blue-700">위치 안내</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">교회로 오시는 길</h2>
            <p className="mt-5 leading-7 text-slate-600">
              449 Mount Eden Road,
              <br />
              Mount Eden, Auckland 1024
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              주일예배는 매주 일요일 오전 11시 30분에 시작합니다.
            </p>
            <a
              href={mapDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-3 font-bold text-white transition-colors hover:bg-blue-800"
            >
              <MapPin className="h-5 w-5" aria-hidden="true" />
              Google 지도에서 길찾기
            </a>
          </div>

          <div className="h-[320px] overflow-hidden rounded-lg border border-slate-200 shadow-sm sm:h-[380px]">
            <iframe
              src={mapEmbedUrl}
              title="마운트 이든 한인교회 위치"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
