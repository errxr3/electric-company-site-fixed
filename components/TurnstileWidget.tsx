'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback': () => void;
          'error-callback': () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  onExpire: () => void;
  onVerify: (token: string) => void;
  resetKey?: number;
  siteKey: string;
};

export function TurnstileWidget({ onExpire, onVerify, resetKey = 0, siteKey }: TurnstileWidgetProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (window.turnstile) setScriptReady(true);
  }, []);

  useEffect(() => {
    if (!scriptReady || !siteKey || !containerRef.current || !window.turnstile) return;

    containerRef.current.innerHTML = '';
    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'expired-callback': onExpire,
      'error-callback': onExpire,
      theme: 'dark',
    });

    return () => {
      if (window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onExpire, onVerify, pathname, resetKey, scriptReady, siteKey]);

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
