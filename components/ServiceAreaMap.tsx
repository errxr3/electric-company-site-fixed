export function ServiceAreaMap({ className = '' }: { className?: string }) {
  return (
    <div className={`card relative min-h-[360px] overflow-hidden p-6 ${className}`}>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-8 top-8 h-40 w-40 rounded-full border border-power/40" />
        <div className="absolute right-10 top-16 h-56 w-56 rounded-full border border-white/15" />
        <div className="absolute bottom-8 left-1/3 h-48 w-48 rounded-full border border-white/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-white/15" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/15" />
      </div>
      <div className="relative z-10 flex min-h-[312px] flex-col justify-between">
        <div>
          <p className="font-bold text-power">Зона выезда</p>
          <h3 className="mt-2 text-3xl font-black">Тверь и Тверская область</h3>
          <p className="mt-4 max-w-xl text-zinc-300">
            Основная точка на карте: Тверь. Работаем по городу, пригородам и населенным пунктам
            области. Выезд за город рассчитывается заранее.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-power shadow-glow" />
              <b>Тверь</b>
            </div>
            <p className="mt-2 text-sm text-zinc-400">Выезд по области до 100 км туда-обратно: от 1000 ₽.</p>
          </div>
          <a
            className="btn btn-primary"
            href="https://yandex.ru/maps/14/tver/?ll=35.917596%2C56.858721&z=10"
            rel="noreferrer"
            target="_blank"
          >
            Открыть карту
          </a>
        </div>
      </div>
    </div>
  );
}
