import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SeoLanding } from '@/components/SeoLanding';
import { getSeoLandingPage } from '@/lib/seoLandingPages';

export const revalidate = 60;

const page = getSeoLandingPage('tver')!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.href },
};

export default function TverPage() {
  return (
    <>
      <Header />
      <SeoLanding page={page} />
      <Footer />
    </>
  );
}
