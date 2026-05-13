import Link from 'next/link';
import { AdminLeadNotifier } from '@/components/AdminLeadNotifier';
import { AdminSignOutButton } from '@/components/AdminSignOutButton';

export function AdminNav() {
  return (
    <div className="mb-8 grid gap-4">
      <nav className="flex flex-wrap items-center gap-3">
        <Link className="btn btn-ghost" href="/admin">
          Сводка
        </Link>
        <Link className="btn btn-ghost" href="/admin/leads">
          Заявки
        </Link>
        <Link className="btn btn-ghost" href="/admin/services">
          Услуги
        </Link>
        <Link className="btn btn-ghost" href="/admin/portfolio">
          Портфолио
        </Link>
        <Link className="btn btn-ghost" href="/admin/reviews">
          Отзывы
        </Link>
        <Link className="btn btn-ghost" href="/admin/settings">
          Контакты
        </Link>
        <Link className="btn btn-ghost" href="/admin/audit">
          Журнал
        </Link>
        <Link className="btn btn-primary" href="/">
          На сайт
        </Link>
        <AdminSignOutButton />
      </nav>
      <AdminLeadNotifier />
    </div>
  );
}
