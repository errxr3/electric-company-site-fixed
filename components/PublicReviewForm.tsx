'use client';

import { useCallback, useState } from 'react';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { reachGoal } from '@/lib/yandexMetrika';

type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

export function PublicReviewForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(''), []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setMessage('');

    if (turnstileSiteKey && !turnstileToken) {
      setState('error');
      setMessage('Дождитесь подтверждения Cloudflare и нажмите отправить еще раз.');
      return;
    }

    const form = event.currentTarget;
    const fd = new FormData(form);
    const res = await fetch('/api/public-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: fd.get('clientName'),
        rating: fd.get('rating'),
        text: fd.get('text'),
        companySite: fd.get('companySite'),
        turnstileToken,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      form.reset();
      setTurnstileToken('');
      setTurnstileResetKey((value) => value + 1);
      setState('sent');
      setMessage('Спасибо. Отзыв отправлен на проверку и появится после модерации.');
      reachGoal('review_form_success');
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
      <textarea maxLength={1200} minLength={10} name="text" placeholder="Напишите отзыв" required rows={5} />
      <input
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
        name="companySite"
        tabIndex={-1}
        type="text"
      />
      {turnstileSiteKey ? (
        <TurnstileWidget
          onExpire={handleTurnstileExpire}
          onVerify={handleTurnstileVerify}
          resetKey={turnstileResetKey}
          siteKey={turnstileSiteKey}
        />
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
