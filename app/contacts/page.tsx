import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LeadForm } from '@/components/LeadForm';
import { ServiceAreaMap } from '@/components/ServiceAreaMap';
import { getSiteSettings } from '@/lib/settings';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Контакты электрика в Твери',
  description: 'Связаться с VolteForce: электрик и электромонтажные работы по Твери и Тверской области.',
  alternates: { canonical: '/contacts' },
};

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

export default async function Contacts() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header />
      <main className="container grid gap-8 py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <section>
          <p className="font-bold text-power">Тверь и Тверская область</p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">Контакты</h1>
          <div className="mt-8 grid gap-3 text-zinc-300">
            <p>Телефон: {settings.phonePrimary}</p>
            <p>Телефон: {settings.phoneSecondary}</p>
            <p>Email: {settings.email}</p>
            <p>{settings.serviceArea}</p>
            <p>{settings.areaNote}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="/#lead">
              Оставить заявку
            </a>
          </div>
          <div className="mt-6 grid gap-2 text-zinc-300">
            {avitoLinks.map((link) => (
              <a className="hover:text-power" href={link.href} key={link.href} rel="noreferrer" target="_blank">
                {link.title}
              </a>
            ))}
          </div>
          <ServiceAreaMap className="mt-8" />
        </section>
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}
