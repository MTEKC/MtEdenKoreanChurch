'use client';

import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import heroOrganImage from '@/app/image/hero_empty_sanctuary_organ.png';
import heroWindowsImage from '@/app/image/hero_empty_sanctuary_windows.png';
import heroAltarImage from '@/app/image/hero_easter_altar.png';

interface HeroSlide {
  image: StaticImageData;
  heading: string;
  subtext: string;
  position?: string;
}

const slides: HeroSlide[] = [
  {
    image: heroOrganImage,
    heading: '마운트 이든 한인교회',
    subtext: '말씀 안에서 함께 예배하고, 서로를 돌보며, 이웃을 섬깁니다.',
  },
  {
    image: heroWindowsImage,
    heading: '함께 드리는 주일예배',
    subtext: '매주 일요일 오전 11시 30분, 예배의 자리로 초대합니다.',
  },
  {
    image: heroAltarImage,
    heading: '지역과 이웃을 섬기는 교회',
    subtext: '우리의 일상과 지역사회에 따뜻한 사랑을 나눕니다.',
  },
];

const autoSlideInterval = 7000;

export default function HomeHeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const next = useCallback(() => {
    setCurrent((previous) => (previous + 1) % slides.length);
  }, []);

  const previous = useCallback(() => {
    setCurrent((currentSlide) => (currentSlide - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || isHovered || isFocusWithin || prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(next, autoSlideInterval);
    return () => window.clearInterval(timer);
  }, [isFocusWithin, isHovered, isPaused, next, prefersReducedMotion]);

  const autoplayStopped = isPaused || prefersReducedMotion;

  return (
    <section
      className="relative flex h-[470px] items-center justify-center overflow-hidden bg-slate-900 text-center text-white sm:h-[500px] lg:h-[520px]"
      aria-roledescription="carousel"
      aria-label="교회 주요 안내"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocusWithin(false);
        }
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.heading}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={index !== current}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: slide.position || 'center' }}
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>
      ))}

      <div className="relative z-10 mx-auto max-w-4xl px-12" aria-live={autoplayStopped ? 'polite' : 'off'}>
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {slides[current].heading}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90 sm:text-xl">
          {slides[current].subtext}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/service"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-blue-700 px-6 font-bold text-white transition-colors hover:bg-blue-800 sm:w-auto"
          >
            예배 안내
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-white/80 bg-black/15 px-6 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-950 sm:w-auto"
          >
            오시는 길
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={previous}
        aria-label="이전 배너"
        className="absolute left-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/65 sm:left-5"
      >
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="다음 배너"
        className="absolute right-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/65 sm:right-5"
      >
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="absolute bottom-5 z-20 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPaused((paused) => !paused)}
          disabled={prefersReducedMotion}
          aria-label={prefersReducedMotion ? '기기 설정에 따라 배너 자동 넘김이 꺼져 있습니다' : isPaused ? '배너 자동 넘김 재생' : '배너 자동 넘김 일시정지'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {autoplayStopped ? (
            <Play className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <div className="flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.heading}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`${index + 1}번 배너 보기`}
              aria-current={index === current ? 'true' : undefined}
              className="group inline-flex h-11 w-11 items-center justify-center rounded-full"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  index === current ? 'bg-white' : 'bg-white/45 group-hover:bg-white/75'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
