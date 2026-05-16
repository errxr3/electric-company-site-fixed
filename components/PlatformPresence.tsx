const platformLinks = [
  {
    title: 'Авито: услуги электрика',
    description: 'Объявление с услугами электрика, контактами и отзывами клиентов.',
    href: 'https://www.avito.ru/tver/predlozheniya_uslug/uslugi_elektrika_elektrik_7208285567?utm_campaign=native&utm_medium=item_page_ios&utm_source=soc_sharing_seller',
  },
  {
    title: 'Авито: электрик',
    description: 'Дополнительное объявление VolteForce на Авито по электромонтажным работам.',
    href: 'https://www.avito.ru/tver/predlozheniya_uslug/uslugi_elektrika_4533709856?utm_campaign=native&utm_medium=item_page_ios&utm_source=soc_sharing',
  },
];

export function PlatformPresence() {
  return (
    <section className="container py-12">
      <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 md:p-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="font-bold text-power">Мы есть на площадках</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Отзывы можно проверить</h2>
          <p className="mt-4 text-zinc-400">
            VolteForce размещается на Авито: там можно посмотреть объявления, реальные отзывы,
            историю профиля и быстро связаться с мастером.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {platformLinks.map((link) => (
            <a
              className="group rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:border-power hover:bg-power/10"
              href={link.href}
              key={link.href}
              rel="noreferrer"
              target="_blank"
            >
              <div className="flex items-center justify-between gap-4">
                <b className="text-xl text-white group-hover:text-power">{link.title}</b>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-power text-xl font-black text-black">
                  ↗
                </span>
              </div>
              <p className="mt-3 text-zinc-400">{link.description}</p>
              <span className="mt-4 inline-flex font-bold text-power">Открыть площадку</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
