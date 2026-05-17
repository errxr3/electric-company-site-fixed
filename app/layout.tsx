import './globals.css';
import type { Metadata } from 'next';
import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { GlobalLeadNotifications } from '@/components/GlobalLeadNotifications';
import { MobileQuickActions } from '@/components/MobileQuickActions';
import { YandexMetrika } from '@/components/YandexMetrika';

const siteUrl = 'https://volteforce.ru';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'VolteForce — электрик в Твери и Тверской области',
    template: '%s | VolteForce',
  },
  description:
    'Электромонтажные работы под ключ в Твери и Тверской области: услуги электрика, замена проводки, сборка щитов, розетки, освещение, диагностика.',
  keywords: [
    'электрик Тверь',
    'электромонтажные работы Тверь',
    'услуги электрика Тверь',
    'электрик Тверская область',
    'замена проводки Тверь',
    'сборка электрощита Тверь',
    'монтаж розеток Тверь',
  ],
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName: 'VolteForce',
    title: 'VolteForce — электрик в Твери',
    description: 'Электромонтажные работы под ключ по Твери и Тверской области.',
    images: [{ url: '/logo.webp', width: 512, height: 512, alt: 'VolteForce' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    name: 'VolteForce',
    url: siteUrl,
    image: `${siteUrl}/logo.webp`,
    telephone: ['+7 910 835-98-87', '+7 930 186-13-06'],
    email: 'andreilordkipanidze98@yandex.ru',
    areaServed: ['Тверь', 'Тверская область'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Тверь',
      addressRegion: 'Тверская область',
      addressCountry: 'RU',
    },
    priceRange: '₽₽',
    description: 'Услуги электрика и электромонтажные работы под ключ в Твери и Тверской области.',
  };

  return (
    <html lang="ru">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <YandexMetrika />
        {children}
        <MobileQuickActions />
        <GlobalLeadNotifications />
      </body>
    </html>
  );
}
