import type { FaqItem } from '@/lib/faq';

export function FaqSection({ faq = [], title = 'Вопросы и ответы' }: { faq: FaqItem[]; title?: string }) {
  return (
    <section className="container py-10">
      <div className="card p-6">
        <h2 className="text-3xl font-black">{title}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {faq.map((item) => (
            <div className="rounded-2xl border border-white/10 p-4" key={item.question}>
              <h3 className="font-black text-white">{item.question}</h3>
              <p className="mt-2 text-zinc-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
