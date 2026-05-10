import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { prisma } from '@/lib/prisma';

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
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Header />
      <main className="container py-16">
        <p className="font-bold text-power">Отзывы клиентов</p>
        <h1 className="mt-2 text-5xl font-black">Отзывы</h1>
        <div className="mt-8 flex flex-wrap gap-3">
          {avitoLinks.map((link) => (
            <a className="btn btn-primary" href={link.href} key={link.href} rel="noreferrer" target="_blank">
              {link.title}
            </a>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.length ? (
            reviews.map((review) => (
              <article className="card p-6" key={review.id}>
                <div className="text-power">{'★'.repeat(review.rating)}</div>
                <h2 className="mt-2 text-xl font-black">{review.clientName}</h2>
                <p className="mt-3 text-zinc-400">{review.text}</p>
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
