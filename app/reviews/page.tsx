import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PlatformPresence } from '@/components/PlatformPresence';
import { PublicReviewForm } from '@/components/PublicReviewForm';
import { formatMoscowDate } from '@/lib/formatDate';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Отзывы об электрике VolteForce',
  description: 'Отзывы клиентов о работе электрика и электромонтажных услугах VolteForce в Твери.',
  alternates: { canonical: '/reviews' },
};

const avitoLinks = [
  {
    title: 'Отзывы на Авито',
    href: 'https://www.avito.ru/tver/predlozheniya_uslug/uslugi_elektrika_elektrik_7208285567?utm_campaign=native&utm_medium=item_page_ios&utm_source=soc_sharing_seller',
  },
  {
    title: 'Еще отзывы на Авито',
    href: 'https://www.avito.ru/tver/predlozheniya_uslug/uslugi_elektrika_4533709856?utm_campaign=native&utm_medium=item_page_ios&utm_source=soc_sharing',
  },
];

export default async function Reviews() {
  const reviews = await prisma.review.findMany({
    where: { isPublished: true, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Header />
      <main className="container py-16">
        <p className="font-bold text-power">Отзывы клиентов</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">Отзывы</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">Здесь можно оставить отзыв о работе.</p>

        <PublicReviewForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

        <div className="mt-8 flex flex-wrap gap-3">
          {avitoLinks.map((link) => (
            <a className="btn btn-ghost" href={link.href} key={link.href} rel="noreferrer" target="_blank">
              {link.title}
            </a>
          ))}
        </div>

        <PlatformPresence />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.length ? (
            reviews.map((review) => (
              <article className="card p-6" key={review.id}>
                <div className="text-power">{'★'.repeat(review.rating)}</div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="text-xl font-black">{review.clientName}</h2>
                  <time className="text-sm text-zinc-500" dateTime={review.createdAt.toISOString()}>
                    {formatMoscowDate(review.createdAt)}
                  </time>
                </div>
                <p className="mt-3 text-zinc-400">{review.text}</p>
                {review.companyReply ? (
                  <div className="mt-5 rounded-2xl border border-power/30 bg-power/10 p-4">
                    <b className="text-power">Ответ компании</b>
                    <p className="mt-2 text-zinc-300">{review.companyReply}</p>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <div className="card p-6 text-zinc-400 md:col-span-3">
              Отзывы скоро появятся. Пока можно посмотреть отзывы на Авито.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
