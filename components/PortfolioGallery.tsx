'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  images: string[];
  title: string;
};

export function PortfolioGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeSrc = activeIndex === null ? null : images[activeIndex];
  const displayIndex = activeIndex ?? 0;

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowLeft') setActiveIndex((current) => (current === null ? current : Math.max(0, current - 1)));
      if (event.key === 'ArrowRight') setActiveIndex((current) => (current === null ? current : Math.min(images.length - 1, current + 1)));
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, images.length]);

  if (images.length === 0) {
    return <div className="mb-4 rounded-2xl bg-zinc-800 p-10 text-center text-zinc-500">Фото объекта скоро появятся</div>;
  }

  return (
    <>
      <div className={`mb-4 grid gap-3 ${images.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {images.map((src, index) => (
          <button
            aria-label={`Открыть фото ${index + 1} во весь экран`}
            className="group relative overflow-hidden rounded-2xl text-left"
            key={src}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <Image
              alt={`${title}, фото ${index + 1}`}
              className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              height={360}
              loading="lazy"
              sizes="(min-width: 768px) 50vw, 100vw"
              src={src}
              width={640}
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/65 px-4 py-2 text-sm text-white opacity-0 transition group-hover:opacity-100">
              Открыть во весь экран
            </span>
          </button>
        ))}
      </div>

      {activeSrc && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4" role="dialog" aria-modal="true">
          <button className="absolute inset-0 cursor-default" onClick={() => setActiveIndex(null)} type="button" aria-label="Закрыть" />
          <div className="relative z-10 flex h-full max-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center">
            <button className="btn btn-ghost absolute right-3 top-3 z-20 bg-black/60" onClick={() => setActiveIndex(null)} type="button">
              Закрыть
            </button>
            <Image
              alt={`${title}, фото во весь экран`}
              className="max-h-[calc(100vh-2rem)] w-full rounded-2xl object-contain"
              height={900}
              priority
              sizes="100vw"
              src={activeSrc}
              width={1280}
            />
            {images.length > 1 && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-3">
                <button
                  className="btn btn-ghost pointer-events-auto bg-black/65 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-35"
                  disabled={displayIndex === 0}
                  onClick={() => setActiveIndex((current) => (current === null ? current : Math.max(0, current - 1)))}
                  type="button"
                >
                  Назад
                </button>
                <span className="pointer-events-auto absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/65 px-4 py-2 text-sm font-bold text-zinc-200">
                  {displayIndex + 1} / {images.length}
                </span>
                <button
                  className="btn btn-ghost pointer-events-auto bg-black/65 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-35"
                  disabled={displayIndex === images.length - 1}
                  onClick={() => setActiveIndex((current) => (current === null ? current : Math.min(images.length - 1, current + 1)))}
                  type="button"
                >
                  Вперед
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
