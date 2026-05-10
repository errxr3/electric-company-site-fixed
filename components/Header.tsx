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
    <header className="relative z-50 border-b border-white/10 bg-coal/90 backdrop-blur md:sticky md:top-0">
      <div className="container grid min-h-20 grid-cols-[1fr_auto] items-center gap-3 py-3 md:grid-cols-[auto_1fr_auto]">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/logo.webp"
            alt="Логотип"
            width={52}
            height={52}
            className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
          />
          <b className="whitespace-nowrap text-xl leading-none">
            Volt<span className="text-power">Force</span>
          </b>
        </Link>
        <nav className="order-3 col-span-2 flex w-full flex-wrap items-center justify-center gap-2 md:order-none md:col-span-1 md:w-auto md:gap-5">
          {nav.map(([href, title]) => (
            <Link
              className="min-h-10 rounded-full border border-white/10 px-3 py-2 text-center text-sm leading-5 text-zinc-300 hover:border-power hover:text-power md:border-0 md:px-0 md:py-0"
              href={href}
              key={href}
            >
              {title}
            </Link>
          ))}
        </nav>
        <Link href="/#lead" className="btn btn-primary min-h-10 px-4 text-sm sm:text-base">
          Оставить заявку
        </Link>
      </div>
    </header>
  );
}
