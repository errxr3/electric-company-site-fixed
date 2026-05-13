import Image from 'next/image';
import Link from 'next/link';
import { seoLandingLinks } from '@/lib/seoLandingPages';
import { getSiteSettings, phoneHref } from '@/lib/settings';

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

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-20 border-t border-white/10 py-10">
      <div className="container grid gap-8 md:grid-cols-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.webp" alt="Логотип" width={56} height={56} />
            <b className="text-xl">
              Volt<span className="text-power">Force</span>
            </b>
          </div>
          <p className="font-bold text-power">Тверь и Тверская область</p>
        </div>
        <p className="text-zinc-400">
          Профессиональный электромонтаж, диагностика и обслуживание. Работаем безопасно, чисто, по договору и с понятной сметой.
        </p>
        <div className="grid gap-2 text-zinc-300">
          <Link href={phoneHref(settings.phonePrimary)}>{settings.phonePrimary}</Link>
          <Link href={phoneHref(settings.phoneSecondary)}>{settings.phoneSecondary}</Link>
          <Link href={`mailto:${settings.email}`}>{settings.email}</Link>
          {avitoLinks.map((link) => (
            <a href={link.href} key={link.href} rel="noreferrer" target="_blank">
              {link.title}
            </a>
          ))}
          <Link href="/admin/login" className="text-zinc-500">
            Админ-панель
          </Link>
        </div>
        <div className="grid gap-2 text-zinc-300">
          <b className="text-white">Услуги в Твери</b>
          {seoLandingLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
