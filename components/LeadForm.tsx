'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { formatRussianPhoneInput, normalizeRussianPhone } from '@/lib/phone';

type LeadFormProps = {
  services?: { id: string; title: string }[];
};

declare global {
  interface Window {
    onLeadTurnstileSuccess?: (token: string) => void;
    onLeadTurnstileExpired?: () => void;
  }
}

const CALCULATOR_STORAGE_KEY = 'voltforce-calculator-summary';
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

export function LeadForm(_: LeadFormProps) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const [phone, setPhone] = useState('');
  const [calculatorSummary, setCalculatorSummary] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    function syncCalculatorSummary(event?: Event) {
      const detail = event instanceof CustomEvent ? String(event.detail || '') : '';
      setCalculatorSummary(detail || window.localStorage.getItem(CALCULATOR_STORAGE_KEY) || '');
    }

    syncCalculatorSummary();
    window.addEventListener('voltforce-calculator-updated', syncCalculatorSummary);
    return () => window.removeEventListener('voltforce-calculator-updated', syncCalculatorSummary);
  }, []);

  useEffect(() => {
    window.onLeadTurnstileSuccess = (token: string) => setTurnstileToken(token);
    window.onLeadTurnstileExpired = () => setTurnstileToken('');

    return () => {
      delete window.onLeadTurnstileSuccess;
      delete window.onLeadTurnstileExpired;
    };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErr('');
    setOk(false);

    const normalizedPhone = normalizeRussianPhone(phone);
    if (!normalizedPhone) {
      setErr('Укажите российский номер в формате +7 (999) 123-45-67.');
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      setErr('Дождитесь подтверждения Cloudflare и отправьте заявку еще раз.');
      return;
    }

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const message = String(data.message || '').trim();
    const calculator = calculatorSummary.trim();
    const payload = {
      ...data,
      phone: normalizedPhone,
      sourcePath: `${window.location.pathname}${window.location.search}`,
      sourceTitle: document.title,
      turnstileToken,
      message: [message, calculator].filter(Boolean).join('\n\n'),
    };

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.ok) {
      setOk(true);
      setPhone('');
      setTurnstileToken('');
      form.reset();
      window.localStorage.removeItem(CALCULATOR_STORAGE_KEY);
      setCalculatorSummary('');
    } else if (response.error === 'Invalid phone') {
      setErr('Укажите российский номер в формате +7 (999) 123-45-67.');
    } else if (response.error === 'Rate limited') {
      setErr('Заявка уже отправлена. Попробуйте повторить позже.');
    } else if (response.error === 'Captcha required') {
      setErr('Подтвердите, что вы не робот.');
    } else {
      setErr('Проверьте поля формы.');
    }
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-6" id="lead">
      <h2 className="text-3xl font-black">Оставить заявку</h2>
      <input name="name" placeholder="Имя" required />
      <input
        inputMode="tel"
        maxLength={24}
        name="phone"
        onBlur={() => setPhone((value) => formatRussianPhoneInput(value))}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="+7 (999) 123-45-67"
        required
        type="tel"
        value={phone}
      />
      <input name="email" placeholder="Email (необязательно)" />
      <textarea name="message" placeholder="Что нужно сделать?" rows={4} />
      <input aria-hidden="true" autoComplete="off" className="hidden" name="companySite" tabIndex={-1} type="text" />
      {turnstileSiteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          <div
            className="cf-turnstile"
            data-callback="onLeadTurnstileSuccess"
            data-expired-callback="onLeadTurnstileExpired"
            data-sitekey={turnstileSiteKey}
          />
        </>
      ) : null}
      {calculatorSummary && (
        <div className="rounded-2xl border border-power/30 bg-power/10 p-4 text-sm text-zinc-200">
          <b className="text-power">В заявку добавится расчет из калькулятора:</b>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-zinc-300">{calculatorSummary.replace('[calculator]\n', '').replace('\n[/calculator]', '')}</pre>
        </div>
      )}
      <button className="btn btn-primary">Отправить</button>
      {ok && <p className="text-power">Заявка отправлена. Мы скоро свяжемся.</p>}
      {err && <p className="text-red-400">{err}</p>}
    </form>
  );
}
