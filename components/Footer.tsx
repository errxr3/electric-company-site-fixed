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
    <footer className="mt-20 border-t border-white/10 py-8">
      <div className="container grid gap-8 md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.15fr_1fr_0.75fr] lg:items-start">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.webp" alt="Логотип" width={56} height={56} />
            <b className="text-xl">
              Volt<span className="text-power">Force</span>
            </b>
          </div>
          <p className="font-bold text-power">Тверь и Тверская область</p>
          <p className="text-zinc-400">
            Профессиональный электромонтаж, диагностика и обслуживание. Работаем безопасно, чисто, по договору и с понятной сметой.
          </p>
        </div>
        <div className="grid gap-3 text-zinc-300">
          <b className="text-white">Контакты</b>
          <Link className="w-fit hover:text-power" href={phoneHref(settings.phonePrimary)}>{settings.phonePrimary}</Link>
          <Link className="w-fit hover:text-power" href={phoneHref(settings.phoneSecondary)}>{settings.phoneSecondary}</Link>
          <Link className="w-fit break-all hover:text-power" href={`mailto:${settings.email}`}>{settings.email}</Link>
          {avitoLinks.map((link) => (
            <a className="w-fit hover:text-power" href={link.href} key={link.href} rel="noreferrer" target="_blank">
              {link.title}
            </a>
          ))}
          <Link href="/admin/login" className="w-fit text-zinc-500 hover:text-zinc-300">
            Админ-панель
          </Link>
        </div>
        <div className="grid content-start gap-3 text-zinc-300">
          <b className="text-white">Навигация</b>
          <Link className="w-fit hover:text-power" href="/services">Услуги</Link>
          <Link className="w-fit hover:text-power" href="/portfolio">Портфолио</Link>
          <Link className="w-fit hover:text-power" href="/reviews">Отзывы</Link>
          <Link className="w-fit hover:text-power" href="/contacts">Контакты</Link>
        </div>
      </div>
      <div className="container mt-8 border-t border-white/10 pt-5">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
          {seoLandingLinks.map((link) => (
            <Link className="hover:text-zinc-300" href={link.href} key={link.href}>
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
