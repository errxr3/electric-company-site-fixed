'use client';

import { useState } from 'react';

type LeadFormProps = {
  services?: { id: string; title: string }[];
};

export function LeadForm(_: LeadFormProps) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErr('');

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setOk(true);
      form.reset();
    } else {
      setErr('Проверьте поля формы.');
    }
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-6" id="lead">
      <h2 className="text-3xl font-black">Оставить заявку</h2>
      <input name="name" placeholder="Имя" required />
      <input name="phone" placeholder="Телефон" required />
      <input name="email" placeholder="Email" />
      <textarea name="message" placeholder="Что нужно сделать?" rows={4} />
      <button className="btn btn-primary">Отправить</button>
      {ok && <p className="text-power">Заявка отправлена. Мы скоро свяжемся.</p>}
      {err && <p className="text-red-400">{err}</p>}
    </form>
  );
}
