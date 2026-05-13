'use client';

import { useCallback, useEffect, useState } from 'react';
import { parseLeadMessage } from '@/lib/leadCalculator';
import { formatRussianPhoneInput, normalizeRussianPhone } from '@/lib/phone';
import { reachGoal } from '@/lib/yandexMetrika';
import { TurnstileWidget } from '@/components/TurnstileWidget';

type LeadFormProps = {
  services?: { id: string; title: string }[];
};

const CALCULATOR_STORAGE_KEY = 'voltforce-calculator-summary';
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

export function LeadForm(_: LeadFormProps) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const [phone, setPhone] = useState('');
  const [calculatorSummary, setCalculatorSummary] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const parsedCalculator = parseLeadMessage(calculatorSummary);

  useEffect(() => {
    function syncCalculatorSummary(event?: Event) {
      const detail = event instanceof CustomEvent ? String(event.detail || '') : '';
      setCalculatorSummary(detail || window.localStorage.getItem(CALCULATOR_STORAGE_KEY) || '');
    }

    syncCalculatorSummary();
    window.addEventListener('voltforce-calculator-updated', syncCalculatorSummary);
    return () => window.removeEventListener('voltforce-calculator-updated', syncCalculatorSummary);
  }, []);

  const handleTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(''), []);

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
      setTurnstileResetKey((value) => value + 1);
      form.reset();
      window.localStorage.removeItem(CALCULATOR_STORAGE_KEY);
      setCalculatorSummary('');
      reachGoal('lead_form_success');
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
        <TurnstileWidget
          onExpire={handleTurnstileExpire}
          onVerify={handleTurnstileVerify}
          resetKey={turnstileResetKey}
          siteKey={turnstileSiteKey}
        />
      ) : null}
      {calculatorSummary && (
        <div className="rounded-2xl border border-power/30 bg-power/10 p-4 text-sm text-zinc-200">
          <b className="text-power">В заявку добавится расчет из калькулятора:</b>
          <div className="mt-3 grid gap-3">
            {parsedCalculator.calculatorLines.map((line, index) => (
              <div className="rounded-2xl bg-black/20 p-3" key={`${line.title}-${index}`}>
                <p className="font-bold text-white">{line.title}</p>
                <div className="mt-2 grid gap-1 text-zinc-300 sm:grid-cols-3">
                  <span>Количество: {line.quantity}</span>
                  <span>Цена: {line.price}</span>
                  <span className="font-bold text-power">Сумма: {line.total}</span>
                </div>
              </div>
            ))}
            {parsedCalculator.calculatorTotal ? (
              <p className="rounded-2xl bg-power/15 p-3 font-black text-power">
                Итого от: {parsedCalculator.calculatorTotal}
              </p>
            ) : null}
          </div>
        </div>
      )}
      <button className="btn btn-primary">Отправить</button>
      {ok && <p className="text-power">Заявка отправлена. Мы скоро свяжемся.</p>}
      {err && <p className="text-red-400">{err}</p>}
    </form>
  );
}
