'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface LiteYouTubeEmbedProps {
  videoId: string;
  title: string;
}

export default function LiteYouTubeEmbed({
  videoId,
  title,
}: LiteYouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group absolute inset-0 h-full w-full overflow-hidden bg-slate-950 text-white"
      aria-label={`${title} 영상 재생`}
    >
      {/* Keep thumbnail traffic between the visitor and YouTube. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-105">
        <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
      </span>
    </button>
  );
}
