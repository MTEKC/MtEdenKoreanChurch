'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogIn, Menu, X } from 'lucide-react';

const navItems = [
    { name: '홈', href: '/' },
    { name: '교회소개', href: '/about' },
    { name: '예배안내', href: '/service' },
    { name: '설교', href: '/sermons' },
    { name: '소식·행사', href: '/announcements' },
    { name: '갤러리', href: '/gallery' },
    { name: '자료실', href: '/resources' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

    const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        firstMobileLinkRef.current?.focus();

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                menuButtonRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between gap-4">

                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setIsOpen(false)}>
                            <Image src="/logo_high.png" alt="마운트 이든 한인교회 로고" width={256} height={256} className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16" priority />
                            <div className="min-w-0 font-bold text-lg text-gray-800 sm:text-2xl tracking-tight">
                                마운트 이든 한인교회
                                <div className="truncate text-xs font-normal text-gray-600 sm:text-sm">The Methodist Church of New Zealand</div>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden xl:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                aria-current={isActive(item.href) ? 'page' : undefined}
                                className={`whitespace-nowrap rounded-sm text-base font-semibold transition-colors duration-200 hover:text-blue-700 ${
                                    isActive(item.href) ? 'text-blue-800 underline decoration-2 underline-offset-8' : 'text-gray-600'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/contact"
                            aria-current={isActive('/contact') ? 'page' : undefined}
                            className={`ml-2 inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3.5 text-[15px] font-semibold text-white transition ${
                                isActive('/contact') ? 'bg-blue-900' : 'bg-blue-700 hover:bg-blue-800'
                            }`}
                        >
                            오시는 길·문의
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-blue-700"
                            aria-label="관리자 로그인"
                            title="관리자 로그인"
                        >
                            <LogIn className="h-5 w-5" aria-hidden="true" />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="xl:hidden flex items-center">
                        <button ref={menuButtonRef} type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="mobile-navigation" aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'} className="inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100">
                            {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div id="mobile-navigation" className="border-t bg-white xl:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item, index) => (
                            <Link
                                key={item.name}
                                ref={index === 0 ? firstMobileLinkRef : undefined}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                aria-current={isActive(item.href) ? 'page' : undefined}
                                className={`flex min-h-11 items-center rounded-md px-3 text-base font-medium transition hover:bg-blue-50 hover:text-blue-800 ${
                                    isActive(item.href) ? 'bg-blue-50 text-blue-800' : 'text-gray-700'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/contact"
                            onClick={() => setIsOpen(false)}
                            aria-current={isActive('/contact') ? 'page' : undefined}
                            className={`flex min-h-11 items-center rounded-md px-3 text-base font-medium transition hover:bg-blue-50 hover:text-blue-800 ${
                                isActive('/contact') ? 'bg-blue-50 text-blue-800' : 'text-gray-700'
                            }`}
                        >
                            오시는 길·문의
                        </Link>
                        <Link
                            href="/login"
                            onClick={() => setIsOpen(false)}
                            className="flex min-h-11 items-center rounded-md px-3 text-base font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-800"
                        >
                            관리자 로그인
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
