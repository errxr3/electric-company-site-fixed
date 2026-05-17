import Image from 'next/image';
import Link from 'next/link';

const nav = [
  { href: '/services', title: 'Услуги', mobile: true },
  { href: '/#calculator', title: 'Калькулятор', mobile: true },
  { href: '/portfolio', title: 'Портфолио', mobile: true },
  { href: '/reviews', title: 'Отзывы', mobile: true },
  { href: '/contacts', title: 'Контакты', mobile: true },
];

export function Header() {
  return (
    <header className="site-header relative z-50 border-b border-white/10 bg-coal/95 backdrop-blur md:sticky md:top-0">
      <div className="container grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 py-4 md:grid-cols-[auto_1fr_auto] md:gap-y-3 md:py-3">
        <Link href="/" className="brand-link flex min-w-0 items-center gap-2 sm:gap-3">
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
        <nav className="order-3 col-span-2 -mx-1 flex w-[calc(100%+8px)] gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:order-none md:col-span-1 md:mx-0 md:w-auto md:justify-center md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {nav.map(({ href, title, mobile }) => (
            <Link
              className={`${mobile ? '' : 'hidden md:inline'} nav-link min-h-10 shrink-0 rounded-full border border-white/10 px-4 py-2 text-center text-xs leading-5 text-zinc-300 sm:text-sm md:min-h-0 md:px-3 md:py-2`}
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
