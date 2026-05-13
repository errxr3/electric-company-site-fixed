import Link from 'next/link';
import { AdminLeadNotifier } from '@/components/AdminLeadNotifier';
import { AdminSignOutButton } from '@/components/AdminSignOutButton';

export function AdminNav() {
  return (
    <div className="mb-6 grid gap-3">
      <nav className="flex flex-wrap items-center gap-2">
        <Link className="btn btn-ghost px-3 py-2 text-sm" href="/admin/leads">
          Заявки
        </Link>
        <Link className="btn btn-ghost px-3 py-2 text-sm" href="/admin/services">
          Услуги
        </Link>
        <Link className="btn btn-ghost px-3 py-2 text-sm" href="/admin/portfolio">
          Портфолио
        </Link>
        <Link className="btn btn-ghost px-3 py-2 text-sm" href="/admin/reviews">
          Отзывы
        </Link>
        <Link className="btn btn-ghost px-3 py-2 text-sm" href="/admin/settings">
          Контакты
        </Link>
        <Link className="btn btn-ghost px-3 py-2 text-sm" href="/admin/audit">
          Журнал
        </Link>
        <Link className="btn btn-primary px-3 py-2 text-sm" href="/">
          На сайт
        </Link>
        <AdminSignOutButton />
      </nav>
      <AdminLeadNotifier />
    </div>
  );
}
