import Image from 'next/image';
import Link from 'next/link';

const nav = [
  ['/services', 'Услуги'],
  ['/#calculator', 'Калькулятор'],
  ['/portfolio', 'Портфолио'],
  ['/reviews', 'Отзывы'],
  ['/contacts', 'Контакты'],
];

export function Header() {
  return (
    <header className="relative z-50 border-b border-white/10 bg-coal/95 backdrop-blur md:sticky md:top-0">
      <div className="container grid grid-cols-[1fr_auto] items-center gap-3 py-3 md:grid-cols-[auto_1fr_auto]">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src="/logo.webp"
            alt="Логотип"
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-[52px] sm:w-[52px]"
          />
          <b className="whitespace-nowrap text-lg leading-none sm:text-xl">
            Volt<span className="text-power">Force</span>
          </b>
        </Link>
        <nav className="scrollbar-none order-3 col-span-2 flex w-full snap-x gap-2 overflow-x-auto pb-1 md:order-none md:col-span-1 md:justify-center md:gap-5 md:overflow-visible md:pb-0">
          {nav.map(([href, title]) => (
            <Link
              className="shrink-0 snap-start rounded-full border border-white/10 px-3 py-2 text-center text-sm leading-5 text-zinc-300 hover:border-power hover:text-power md:border-0 md:px-0 md:py-0"
              href={href}
              key={href}
            >
              {title}
            </Link>
          ))}
        </nav>
        <Link href="/#lead" className="btn btn-primary min-h-10 px-4 text-sm sm:text-base">
          <span className="sm:hidden">Заявка</span>
          <span className="hidden sm:inline">Оставить заявку</span>
        </Link>
      </div>
    </header>
  );
}
