import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ServiceCard } from '@/components/ServiceCard';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Услуги электрика в Твери',
  description: 'Прайс на услуги электрика и электромонтажные работы в Твери: розетки, освещение, проводка, щиты, диагностика.',
  alternates: { canonical: '/services' },
};

export default async function Services() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <>
      <Header />
      <main className="container py-16">
        <h1 className="text-4xl font-black sm:text-5xl">Услуги электрика</h1>
        <p className="mt-4 text-zinc-400">Прозрачные цены «от», точная смета после диагностики.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} s={service} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
