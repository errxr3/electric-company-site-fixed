import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { LeadForm } from '@/components/LeadForm';
import { commonFaq, faqJsonLd } from '@/lib/faq';
import { priceItems } from '@/lib/priceItems';

export const metadata: Metadata = {
  title: 'Цены на услуги электрика в Твери',
  description:
    'Прайс-лист VolteForce: цены на услуги электрика и электромонтажные работы в Твери и Тверской области.',
  alternates: { canonical: '/prices' },
};

const currency = new Intl.NumberFormat('ru-RU');

export default function PricesPage() {
  const categories = Array.from(new Set(priceItems.map((item) => item.category)));
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Цены на услуги электрика в Твери',
    itemListElement: priceItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: item.title,
        areaServed: ['Тверь', 'Тверская область'],
        provider: {
          '@type': 'Electrician',
          name: 'VolteForce',
          url: 'https://volteforce.ru',
        },
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: 'RUB',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(commonFaq)) }} />

        <section className="container py-14">
          <p className="font-bold text-power">Тверь и Тверская область</p>
          <h1 className="mt-2 max-w-4xl text-4xl font-black sm:text-5xl">
            Цены на услуги электрика в Твери
          </h1>
          <p className="mt-5 max-w-3xl text-zinc-300">
            Ниже указан базовый прайс-лист на электромонтажные работы. Итоговая стоимость зависит
            от объекта, количества точек, материалов стен, доступа к проводке и срочности выезда.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="#lead">
              Оставить заявку
            </a>
            <Link className="btn btn-ghost" href="/#calculator">
              Рассчитать стоимость
            </Link>
          </div>
        </section>

        <section className="container grid gap-6 pb-12">
          {categories.map((category) => (
            <div className="card overflow-hidden" key={category}>
              <div className="border-b border-white/10 px-5 py-4">
                <h2 className="text-2xl font-black text-power">{category}</h2>
              </div>
              <div className="divide-y divide-white/10">
                {priceItems
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <div
                      className="grid gap-2 px-5 py-4 text-zinc-300 sm:grid-cols-[1fr_auto] sm:items-center"
                      key={item.id}
                    >
                      <span>{item.title}</span>
                      <b className="text-lg text-white">
                        от {currency.format(item.price)} ₽ / {item.unit}
                      </b>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </section>

        <FaqSection faq={commonFaq} />

        <section className="container py-10" id="lead">
          <LeadForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
