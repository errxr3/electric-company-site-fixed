'use client';

import { useEffect, useState } from 'react';

type LeadSummary = {
  latestId: string | null;
  newCount: number;
};

export function AdminLeadNotifier() {
  const [summary, setSummary] = useState<LeadSummary>({ latestId: null, newCount: 0 });

  useEffect(() => {
    let active = true;

    async function checkLeads() {
      const res = await fetch('/api/leads/summary', { cache: 'no-store' });
      if (!res.ok) return;

      const next = (await res.json()) as LeadSummary;
      if (active) setSummary(next);
    }

    checkLeads();
    const timer = window.setInterval(checkLeads, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  async function enableNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="rounded-full border border-white/10 px-3 py-2 text-zinc-300">
        Новые заявки: <b className="text-power">{summary.newCount}</b>
      </span>
      {'Notification' in globalThis && Notification.permission === 'default' && (
        <button className="btn btn-ghost px-3 py-2 text-sm" onClick={enableNotifications} type="button">
          Включить уведомления
        </button>
      )}
    </div>
  );
}
