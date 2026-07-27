'use client';

import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import church1Image from '@/app/image/church1.jpg';
import church3Image from '@/app/image/church3.jpg';
import churchegg from '@/app/image/church_egg.jpg';
import heroEasterImage from '@/app/image/hero_easter_altar.png';
import heroOrganImage from '@/app/image/hero_empty_sanctuary_organ.png';
import heroWindowsImage from '@/app/image/hero_empty_sanctuary_windows.png';

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
    image: church3Image,
    heading: '지역과 이웃을 섬기는 교회',
    subtext: '우리의 일상과 지역사회에 따뜻한 사랑을 나눕니다.',
  },
  {
    image: church1Image,
    heading: '말씀으로 자라는 공동체',
    subtext: '바르게 알고, 바르게 믿고, 삶으로 살아가기를 소망합니다.',
  },
  {
    image: churchegg,
    heading: '부활의 기쁨을 함께',
    subtext: '예수 그리스도의 생명과 소망을 함께 나눕니다.',
    position: 'center 42%',
  },
  {
    image: heroEasterImage,
    heading: '예배의 자리로 초대합니다',
    subtext: '처음 오시는 분도 편안하게 함께하실 수 있습니다.',
  },
];

const autoSlideInterval = 7000;

export default function HomeHeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const next = useCallback(() => {
    setCurrent((previous) => (previous + 1) % slides.length);
  }, []);

  const previous = useCallback(() => {
    setCurrent((currentSlide) => (currentSlide - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused || isHovered) {
      return;
    }

    const timer = window.setInterval(next, autoSlideInterval);
    return () => window.clearInterval(timer);
  }, [isHovered, isPaused, next]);

  return (
    <section
      className="relative flex h-[470px] items-center justify-center overflow-hidden bg-slate-900 text-center text-white sm:h-[500px] lg:h-[520px]"
      aria-roledescription="carousel"
      aria-label="교회 주요 안내"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      <div className="relative z-10 mx-auto max-w-4xl px-12" aria-live="polite">
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
          aria-label={isPaused ? '배너 자동 넘김 재생' : '배너 자동 넘김 일시정지'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/70"
        >
          {isPaused ? (
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
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                index === current ? 'bg-white' : 'bg-white/45 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
