import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GlobalLeadNotifications } from '@/components/GlobalLeadNotifications';

export const metadata: Metadata = {
  title: 'VoltForce — электромонтажные работы',
  description: 'Надёжные услуги электрика для дома, офиса и бизнеса. Заявка онлайн.',
  openGraph: {
    title: 'VoltForce',
    description: 'Электрика под ключ',
    images: ['/logo.webp'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <GlobalLeadNotifications />
      </body>
    </html>
  );
}
