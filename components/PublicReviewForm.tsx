'use client';

import Script from 'next/script';
import { useState } from 'react';

type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

export function PublicReviewForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setMessage('');

    const form = event.currentTarget;
    const fd = new FormData(form);
    const res = await fetch('/api/public-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: fd.get('clientName'),
        rating: fd.get('rating'),
        text: fd.get('text'),
        website: fd.get('website'),
        turnstileToken: fd.get('cf-turnstile-response'),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      form.reset();
      setState('sent');
      setMessage('Спасибо. Отзыв отправлен на проверку и появится после модерации.');
      return;
    }

    setState('error');
    setMessage(data.error || 'Не удалось отправить отзыв. Попробуйте позже.');
  }

  return (
    <form className="card mt-10 grid gap-4 p-5 md:p-6" onSubmit={submit}>
      <div>
        <p className="font-bold text-power">Оставить отзыв</p>
        <h2 className="mt-1 text-2xl font-black">Отзыв появится после проверки</h2>
      </div>
      <input autoComplete="name" name="clientName" placeholder="Ваше имя" required />
      <select defaultValue="5" name="rating" required>
        <option value="5">5 звезд</option>
        <option value="4">4 звезды</option>
        <option value="3">3 звезды</option>
        <option value="2">2 звезды</option>
        <option value="1">1 звезда</option>
      </select>
      <textarea maxLength={1200} minLength={20} name="text" placeholder="Напишите отзыв" required rows={5} />
      <input
        aria-hidden="true"
        className="hidden"
        name="website"
        tabIndex={-1}
        type="text"
        autoComplete="off"
      />
      {turnstileSiteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
        </>
      ) : null}
      <button className="btn btn-primary" disabled={state === 'sending'} type="submit">
        {state === 'sending' ? 'Отправляем...' : 'Отправить отзыв'}
      </button>
      {message ? (
        <p className={state === 'error' ? 'text-red-400' : 'text-green-400'}>{message}</p>
      ) : null}
    </form>
  );
}
