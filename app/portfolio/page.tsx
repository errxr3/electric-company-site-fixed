import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PortfolioGallery } from '@/components/PortfolioGallery';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 6;
export const revalidate = 60;

export default async function Portfolio({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const [items, total] = await Promise.all([
    prisma.portfolioItem.findMany({
      orderBy: { completedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.portfolioItem.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Header />
      <main className="container py-16">
        <p className="font-bold text-power">Тверь и Тверская область</p>
        <h1 className="mt-2 text-5xl font-black">Портфолио</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.length ? (
            items.map((item) => {
              const images = [item.beforeImage, item.afterImage].filter(Boolean) as string[];

              return (
                <article className="card p-6" key={item.id}>
                  <PortfolioGallery images={images} title={item.title} />
                  <h2 className="text-2xl font-black">{item.title}</h2>
                  <p className="text-power">
                    {item.objectType} · {new Date(item.completedAt).toLocaleDateString('ru-RU')}
                  </p>
                  <p className="mt-3 text-zinc-400">{item.description}</p>
                </article>
              );
            })
          ) : (
            <div className="card p-6 text-zinc-400 md:col-span-2">Портфолио пока пустое.</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {page > 1 && (
              <Link className="btn btn-ghost" href={`/portfolio?page=${page - 1}`}>
                Назад
              </Link>
            )}
            <span className="text-zinc-400">
              Страница {page} из {totalPages}
            </span>
            {page < totalPages && (
              <Link className="btn btn-ghost" href={`/portfolio?page=${page + 1}`}>
                Вперед
              </Link>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
