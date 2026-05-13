import Link from 'next/link';
import { LeadForm } from '@/components/LeadForm';
import { ServiceAreaMap } from '@/components/ServiceAreaMap';
import type { SeoLandingPage } from '@/lib/seoLandingPages';
import { seoLandingLinks } from '@/lib/seoLandingPages';

export function SeoLanding({ page }: { page: SeoLandingPage }) {
  const faq = [
    {
      question: `Сколько стоит ${page.h1.toLowerCase()}?`,
      answer: page.priceNote,
    },
    {
      question: 'Можно ли заранее понять стоимость работ?',
      answer: 'Да. Опишите задачу в заявке или используйте калькулятор на сайте, а перед началом работ мы согласуем объем и цену.',
    },
    {
      question: 'Вы выезжаете по Тверской области?',
      answer: 'Да. Работаем по Твери и Тверской области, условия выезда зависят от адреса и объема работ.',
    },
  ];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="container grid gap-8 py-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="font-bold text-power">Тверь и Тверская область</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">{page.h1}</h1>
          <p className="mt-6 max-w-3xl text-lg text-zinc-300">{page.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="#lead">
              Оставить заявку
            </a>
            <Link className="btn btn-ghost" href="/#calculator">
              Рассчитать стоимость
            </Link>
          </div>
        </div>
        <ServiceAreaMap />
      </section>

      <section className="container grid gap-6 py-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="card p-6">
          <h2 className="text-3xl font-black">Что входит в работу</h2>
          <ul className="mt-5 grid gap-3 text-zinc-300">
            {page.services.map((service) => (
              <li className="rounded-2xl border border-white/10 p-4" key={service}>
                {service}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-3xl font-black">Почему VolteForce</h2>
          <ul className="mt-5 grid gap-3 text-zinc-300">
            {page.advantages.map((advantage) => (
              <li className="rounded-2xl border border-white/10 p-4" key={advantage}>
                {advantage}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-zinc-400">{page.priceNote}</p>
        </div>
      </section>

      <section className="container py-10">
        <div className="card p-6">
          <h2 className="text-3xl font-black">Популярные услуги в Твери</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {seoLandingLinks.map((link) => (
              <Link className="btn btn-ghost" href={link.href} key={link.href}>
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="card p-6">
          <h2 className="text-3xl font-black">Вопросы и ответы</h2>
          <div className="mt-5 grid gap-4">
            {faq.map((item) => (
              <div className="rounded-2xl border border-white/10 p-4" key={item.question}>
                <h3 className="font-black text-white">{item.question}</h3>
                <p className="mt-2 text-zinc-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10" id="lead">
        <LeadForm />
      </section>
    </main>
  );
}
