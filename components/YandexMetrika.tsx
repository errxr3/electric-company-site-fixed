'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { reachGoal, yandexMetrikaId } from '@/lib/yandexMetrika';

export function YandexMetrika() {
  const pathname = usePathname();
  const counterId = Number(yandexMetrikaId);

  useEffect(() => {
    if (!counterId || pathname.startsWith('/admin')) return;

    const url = `${pathname}${window.location.search}`;
    window.ym?.(counterId, 'hit', url);
  }, [counterId, pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest('a') : null;
      if (!target) return;

      const href = target.getAttribute('href') || '';
      if (href.startsWith('tel:')) reachGoal('phone_click');
      if (href.includes('avito.ru')) reachGoal('avito_click');
      if (href === '#lead' || href.endsWith('/#lead')) reachGoal('lead_button_click');
      if (href === '#calculator' || href.endsWith('/#calculator')) reachGoal('calculator_click');
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!counterId) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {
              if (document.scripts[j].src === r) { return; }
            }
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
          ym(${counterId}, 'init', {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true
          });
        `}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={`https://mc.yandex.ru/watch/${counterId}`} style={{ left: '-9999px', position: 'absolute' }} />
        </div>
      </noscript>
    </>
  );
}
