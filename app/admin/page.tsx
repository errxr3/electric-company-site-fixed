import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LeadStatus } from '@prisma/client';
import { AdminNav } from '@/components/AdminNav';
import { authOptions } from '@/lib/auth';
import { formatMoscowDateTime } from '@/lib/formatDate';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  if (!(await getServerSession(authOptions))) redirect('/admin/login');

  const [newLeads, progressLeads, pendingReviews, portfolioCount, latestLeads, latestLogs] = await Promise.all([
    prisma.lead.count({ where: { status: LeadStatus.NEW } }),
    prisma.lead.count({ where: { status: LeadStatus.IN_PROGRESS } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.portfolioItem.count(),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  return (
    <main className="container py-10">
      <AdminNav />
      <div className="mb-8">
        <p className="font-bold text-power">Панель управления</p>
        <h1 className="text-4xl font-black">Сводка</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Link className="card p-5 transition hover:border-power" href="/admin/leads">
          <span className="text-sm text-zinc-500">Новые заявки</span>
          <b className="block text-3xl text-red-400">{newLeads}</b>
        </Link>
        <Link className="card p-5 transition hover:border-power" href="/admin/leads">
          <span className="text-sm text-zinc-500">В работе</span>
          <b className="block text-3xl text-yellow-300">{progressLeads}</b>
        </Link>
        <Link className="card p-5 transition hover:border-power" href="/admin/reviews?status=PENDING">
          <span className="text-sm text-zinc-500">Отзывы на проверке</span>
          <b className="block text-3xl text-power">{pendingReviews}</b>
        </Link>
        <Link className="card p-5 transition hover:border-power" href="/admin/portfolio">
          <span className="text-sm text-zinc-500">Работы в портфолио</span>
          <b className="block text-3xl text-green-400">{portfolioCount}</b>
        </Link>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Последние заявки</h2>
            <Link className="text-sm text-power" href="/admin/leads">
              Все заявки
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {latestLeads.length === 0 && <p className="text-zinc-400">Заявок пока нет.</p>}
            {latestLeads.map((lead) => (
              <div className="rounded-2xl border border-white/10 p-4" key={lead.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b>{lead.name}</b>
                  <span className="text-sm text-zinc-500">{formatMoscowDateTime(lead.createdAt)}</span>
                </div>
                <p className="mt-1 text-zinc-300">{lead.phone}</p>
                {lead.sourcePath ? <p className="mt-1 text-sm text-power">{lead.sourcePath}</p> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Последние действия</h2>
            <Link className="text-sm text-power" href="/admin/audit">
              Журнал
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {latestLogs.length === 0 && <p className="text-zinc-400">Действий пока нет.</p>}
            {latestLogs.map((log) => (
              <div className="rounded-2xl border border-white/10 p-4" key={log.id}>
                <p>{log.message}</p>
                <span className="text-sm text-zinc-500">{formatMoscowDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
