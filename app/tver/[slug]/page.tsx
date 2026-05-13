import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SeoLanding } from '@/components/SeoLanding';
import { getSeoLandingPage, seoLandingPages } from '@/lib/seoLandingPages';

export const revalidate = 60;

export function generateStaticParams() {
  return seoLandingPages.filter((page) => page.slug !== 'tver').map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getSeoLandingPage(params.slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.href },
  };
}

export default function TverServicePage({ params }: { params: { slug: string } }) {
  const page = getSeoLandingPage(params.slug);
  if (!page || page.slug === 'tver') notFound();

  return (
    <>
      <Header />
      <SeoLanding page={page} />
      <Footer />
    </>
  );
}
