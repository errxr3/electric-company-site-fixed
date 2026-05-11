import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LeadForm } from '@/components/LeadForm';
import { PriceCalculator } from '@/components/PriceCalculator';
import { ServiceAreaMap } from '@/components/ServiceAreaMap';
import { ServiceCard } from '@/components/ServiceCard';
import { featuredPriceItems } from '@/lib/priceItems';
import { prisma } from '@/lib/prisma';
import { getSiteSettings, phoneHref } from '@/lib/settings';

export const revalidate = 60;

const avitoLinks = [
  {
    title: 'Авито: услуги электрика',
    href: 'https://www.avito.ru/tver/predlozheniya_uslug/uslugi_elektrika_elektrik_7208285567?utm_campaign=native&utm_medium=item_page_ios&utm_source=soc_sharing_seller',
  },
  {
    title: 'Авито: электрик',
    href: 'https://www.avito.ru/tver/predlozheniya_uslug/uslugi_elektrika_4533709856?utm_campaign=native&utm_medium=item_page_ios&utm_source=soc_sharing',
  },
];

export default async function Home() {
  const [services, reviews, settings] = await Promise.all([
    prisma.service.findMany({ take: 6, orderBy: { isPopular: 'desc' } }),
    prisma.review.findMany({
      where: { isPublished: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header />
      <main>
        <section className="container grid items-center gap-8 pb-12 pt-8 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
          <div>
            <p className="mb-4 font-bold text-power">Тверь и Тверская область</p>
            <h1 className="max-w-3xl break-words text-[2rem] font-black leading-[1.08] sm:text-5xl lg:text-6xl">
              Электромонтажные работы под ключ
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-zinc-300 sm:text-xl">
              Проектируем, монтируем и обслуживаем электрику для квартир, домов, офисов и
              коммерческих объектов. Выезжаем по Твери и населенным пунктам области.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#lead" className="btn btn-primary">
                Оставить заявку
              </a>
              <a href="#calculator" className="btn btn-ghost">
                Рассчитать стоимость
              </a>
            </div>
            <div className="mt-6 grid gap-2 text-lg font-bold text-white sm:flex sm:flex-wrap sm:gap-4">
              <a href={phoneHref(settings.phonePrimary)} className="hover:text-power">
                {settings.phonePrimary}
              </a>
              <a href={phoneHref(settings.phoneSecondary)} className="hover:text-power">
                {settings.phoneSecondary}
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-300">
              {avitoLinks.map((link) => (
                <a
                  className="rounded-full border border-white/15 px-4 py-2 hover:border-power hover:text-power"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
          <div className="card mb-8 p-5 shadow-glow sm:mb-0 sm:p-8">
            <Image
              src="/logo.webp"
              alt="Логотип компании VoltForce"
              width={520}
              height={520}
              priority
              className="mx-auto max-h-[34vh] w-auto rounded-3xl object-contain sm:max-h-[52vh]"
            />
          </div>
        </section>

        <section className="container grid gap-5 pb-12 pt-4 md:grid-cols-3 md:py-12">
          {['Гарантия на работы', 'Выезд и диагностика', 'Работа по Тверской области'].map((title) => (
            <div className="card p-6" key={title}>
              <h3 className="text-xl font-black text-power">{title}</h3>
              <p className="mt-2 text-zinc-400">
                Работаем по нормам безопасности, фиксируем сроки и стоимость до начала работ.
              </p>
            </div>
          ))}
        </section>

        <section className="container py-12">
          <div className="mb-8">
            <p className="font-bold text-power">Прайс-лист</p>
            <h2 className="mt-2 text-4xl font-black">Популярные позиции</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {featuredPriceItems.map((item) => (
              <div className="card flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between" key={item.id}>
                <span className="text-zinc-200">{item.title}</span>
                <b className="shrink-0 text-power">
                  от {item.price.toLocaleString('ru-RU')} ₽ / {item.unit}
                </b>
              </div>
            ))}
          </div>
        </section>

        <PriceCalculator />

        <section className="container py-12">
          <h2 className="mb-8 text-4xl font-black">Популярные услуги</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} s={service} />
            ))}
          </div>
        </section>

        <section className="container grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-bold text-power">География работ</p>
            <h2 className="mt-2 text-4xl font-black">Работаем по Твери и Тверской области</h2>
            <p className="mt-4 text-zinc-400">
              Берем объекты в Твери, пригороде и районах области. Для выезда за город заранее
              рассчитываем дорогу и состав бригады, чтобы смета была понятной до начала работ.
            </p>
            <div className="mt-6 grid gap-3 text-zinc-300">
              <p>{settings.serviceArea}</p>
              <p>{settings.areaNote}</p>
            </div>
          </div>
          <ServiceAreaMap />
        </section>

        <section className="container py-12">
          <h2 className="mb-8 text-4xl font-black">Отзывы клиентов</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <div className="card p-6" key={review.id}>
                <div className="text-power">{'★'.repeat(review.rating)}</div>
                <b>{review.clientName}</b>
                <p className="mt-3 text-zinc-400">{review.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-12">
          <LeadForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
