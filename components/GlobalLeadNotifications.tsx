'use client';

import { useEffect, useRef, useState } from 'react';

type LeadSummary = {
  latestId: string | null;
  newCount: number;
};

export function GlobalLeadNotifications() {
  const [toast, setToast] = useState('');
  const latestSeen = useRef<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    async function checkLeads() {
      const res = await fetch('/api/leads/summary', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401 && timer) window.clearInterval(timer);
        return;
      }

      const next = (await res.json()) as LeadSummary;
      if (!active) return;

      if (!initialized.current) {
        initialized.current = true;
        latestSeen.current = next.latestId;
        return;
      }

      if (next.latestId && next.latestId !== latestSeen.current) {
        latestSeen.current = next.latestId;
        setToast('Поступила новая заявка');

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('VoltForce', { body: 'Поступила новая заявка' });
        }

        window.setTimeout(() => setToast(''), 6000);
      }
    }

    checkLeads();
    timer = window.setInterval(checkLeads, 15000);
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed right-4 top-4 z-[80] max-w-sm rounded-2xl border border-power/40 bg-black px-5 py-4 text-power shadow-glow">
      <b>Новая заявка</b>
      <p className="mt-1 text-sm text-zinc-200">Откройте админ-панель, чтобы посмотреть заказ.</p>
    </div>
  );
}
