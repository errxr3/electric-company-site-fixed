'use client';

import { useEffect, useState } from 'react';

type LeadSummary = {
  latestId: string | null;
  newCount: number;
};

type PushState = 'unsupported' | 'disabled' | 'ready' | 'enabled' | 'error';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function AdminLeadNotifier() {
  const [summary, setSummary] = useState<LeadSummary>({ latestId: null, newCount: 0 });
  const [pushState, setPushState] = useState<PushState>('disabled');
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    async function checkPush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setPushState('unsupported');
        return;
      }

      if (!vapidPublicKey) {
        setPushState('disabled');
        setMessage('Push не настроен: добавьте VAPID ключи в Vercel.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      setPushState(subscription ? 'enabled' : 'ready');
    }

    checkPush().catch(() => setPushState('error'));
  }, []);

  async function enablePush() {
    try {
      setMessage('');

      if (!vapidPublicKey) {
        setPushState('disabled');
        setMessage('Сначала добавьте VAPID ключи в Vercel и сделайте Redeploy.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushState('error');
        setMessage('Браузер не дал разрешение на уведомления.');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) throw new Error('Subscription failed');

      setPushState('enabled');
      setMessage('Push-уведомления включены на этом устройстве.');
    } catch {
      setPushState('error');
      setMessage('Не удалось включить push. Проверьте разрешения браузера и VAPID ключи.');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="rounded-full border border-white/10 px-3 py-2 text-zinc-300">
        Новые заявки: <b className="text-power">{summary.newCount}</b>
      </span>
      {pushState !== 'unsupported' && pushState !== 'enabled' ? (
        <button className="btn btn-ghost px-3 py-2 text-sm" onClick={enablePush} type="button">
          Включить push
        </button>
      ) : null}
      {pushState === 'enabled' ? (
        <span className="rounded-full bg-green-500 px-3 py-2 font-bold text-black">Push включен</span>
      ) : null}
      {message ? <span className="text-zinc-400">{message}</span> : null}
    </div>
  );
}
