'use client';

import { useEffect, useState } from 'react';
import { formatRussianPhoneInput, normalizeRussianPhone } from '@/lib/phone';

type LeadFormProps = {
  services?: { id: string; title: string }[];
};

const CALCULATOR_STORAGE_KEY = 'voltforce-calculator-summary';

export function LeadForm(_: LeadFormProps) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const [phone, setPhone] = useState('');
  const [calculatorSummary, setCalculatorSummary] = useState('');

  useEffect(() => {
    function syncCalculatorSummary(event?: Event) {
      const detail = event instanceof CustomEvent ? String(event.detail || '') : '';
      setCalculatorSummary(detail || window.localStorage.getItem(CALCULATOR_STORAGE_KEY) || '');
    }

    syncCalculatorSummary();
    window.addEventListener('voltforce-calculator-updated', syncCalculatorSummary);
    return () => window.removeEventListener('voltforce-calculator-updated', syncCalculatorSummary);
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

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const message = String(data.message || '').trim();
    const calculator = calculatorSummary.trim();
    const payload = {
      ...data,
      phone: normalizedPhone,
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
      form.reset();
      window.localStorage.removeItem(CALCULATOR_STORAGE_KEY);
      setCalculatorSummary('');
    } else {
      setErr(response.error === 'Invalid phone' ? 'Укажите российский номер в формате +7 (999) 123-45-67.' : 'Проверьте поля формы.');
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
