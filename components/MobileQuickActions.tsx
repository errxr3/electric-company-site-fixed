'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { defaultSiteSettings, phoneHref } from '@/lib/settings';

export function MobileQuickActions() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <div className="h-[calc(env(safe-area-inset-bottom)+82px)] md:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-coal/95 px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 shadow-2xl backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
          <a className="btn btn-ghost min-h-12 px-3 text-sm" href={phoneHref(defaultSiteSettings.phonePrimary)}>
            Позвонить
          </a>
          <Link className="btn btn-primary min-h-12 px-3 text-sm" href="/#lead">
            Заявка
          </Link>
        </div>
      </div>
    </>
  );
}
