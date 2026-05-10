'use client';

import { useMemo, useState } from 'react';
import { priceItems } from '@/lib/priceItems';

const currency = new Intl.NumberFormat('ru-RU');

export function PriceCalculator() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const total = useMemo(
    () => priceItems.reduce((sum, item) => sum + item.price * (quantities[item.id] || 0), 0),
    [quantities],
  );

  const selected = priceItems.filter((item) => (quantities[item.id] || 0) > 0);
  const categories = Array.from(new Set(priceItems.map((item) => item.category)));

  function setQuantity(id: string, value: string) {
    const next = Math.max(0, Number(value) || 0);
    setQuantities((current) => ({ ...current, [id]: next }));
  }

  return (
    <section className="container py-12" id="calculator">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-bold text-power">Расчет по прайс-листу</p>
          <h2 className="mt-2 text-4xl font-black">Калькулятор стоимости</h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Выберите количество работ. Итог ориентировочный: точная смета зависит от объекта,
            материалов, доступа и состояния существующей проводки.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-5">
          {categories.map((category) => (
            <div className="card overflow-hidden" key={category}>
              <div className="border-b border-white/10 px-5 py-4">
                <h3 className="text-xl font-black text-power">{category}</h3>
              </div>
              <div className="divide-y divide-white/10">
                {priceItems
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <label
                      className="grid gap-3 px-5 py-4 text-base text-zinc-200 md:grid-cols-[1fr_150px_110px] md:items-center"
                      key={item.id}
                    >
                      <span>{item.title}</span>
                      <span className="font-black text-white">
                        {currency.format(item.price)} ₽ / {item.unit}
                      </span>
                      <input
                        aria-label={`Количество: ${item.title}`}
                        min="0"
                        type="number"
                        value={quantities[item.id] || ''}
                        onChange={(event) => setQuantity(item.id, event.target.value)}
                      />
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-500">Итого от</p>
          <p className="mt-2 text-4xl font-black text-power">{currency.format(total)} ₽</p>
          <div className="mt-6 grid gap-3 text-sm text-zinc-300">
            {selected.length ? (
              selected.map((item) => (
                <div className="flex justify-between gap-4" key={item.id}>
                  <span>{item.title}</span>
                  <b className="shrink-0 text-white">
                    {quantities[item.id]} × {currency.format(item.price)}
                  </b>
                </div>
              ))
            ) : (
              <p>Добавьте позиции из прайса, чтобы увидеть расчет.</p>
            )}
          </div>
          <a className="btn btn-primary mt-6 w-full" href="#lead">
            Оставить заявку
          </a>
        </aside>
      </div>
    </section>
  );
}
