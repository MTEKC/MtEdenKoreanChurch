import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = [
  { href: '/about', label: '교회소개' },
  { href: '/service', label: '예배안내' },
  { href: '/sermons', label: '설교' },
  { href: '/announcements', label: '소식·행사' },
  { href: '/gallery', label: '갤러리' },
  { href: '/resources', label: '자료실' },
];

export default function SiteFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.8fr_1.1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 text-white">
            <Image
              src="/logo_high.png"
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 rounded-full bg-white object-contain"
            />
            <div>
              <p className="text-lg font-bold">마운트 이든 한인교회</p>
              <p className="mt-1 text-xs text-slate-400">The Methodist Church of New Zealand</p>
            </div>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
            말씀을 중심으로 예배하고, 서로를 돌보며, 지역사회를 섬기는 한인 신앙공동체입니다.
          </p>
        </div>

        <nav aria-label="하단 메뉴">
          <p className="font-bold text-white">바로가기</p>
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
            <Link href="/contact" className="hover:text-white">
              오시는 길·문의
            </Link>
          </div>
        </nav>

        <div>
          <p className="font-bold text-white">예배 및 연락처</p>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              주일예배 매주 일요일 오전 11:30
            </p>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              449 Mount Eden Road, Auckland 1024
            </p>
            <a href="tel:+64275141121" className="flex items-start gap-3 hover:text-white">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              027 514 1121
            </a>
            <a
              href="mailto:mtedenkoreanchurch@gmail.com"
              className="flex items-start gap-3 break-all hover:text-white"
            >
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
              mtedenkoreanchurch@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Mount Eden Korean Church. All rights reserved.</p>
          <Link href="/login" className="hover:text-slate-300">
            관리자 로그인
          </Link>
        </div>
      </div>
    </footer>
  );
}
