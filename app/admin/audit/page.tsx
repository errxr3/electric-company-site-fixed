import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { authOptions } from '@/lib/auth';
import { formatMoscowDateTime } from '@/lib/formatDate';
import { prisma } from '@/lib/prisma';

const actionLabels: Record<string, string> = {
  create: 'Добавление',
  update: 'Изменение',
  delete: 'Удаление',
  sync: 'Синхронизация',
};

async function clearLogs() {
  'use server';

  await prisma.auditLog.deleteMany();
  revalidatePath('/admin/audit');
}

export default async function AuditAdmin() {
  if (!(await getServerSession(authOptions))) redirect('/admin/login');

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.auditLog.count(),
  ]);

  return (
    <main className="container py-10">
      <AdminNav />
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-bold text-power">Последние 100 записей из {total}</p>
          <h1 className="text-4xl font-black">Журнал действий</h1>
        </div>
        {total > 0 ? (
          <form action={clearLogs}>
            <ConfirmSubmitButton
              className="btn btn-ghost"
              message="Очистить весь журнал действий? Это действие нельзя отменить."
            >
              Очистить журнал
            </ConfirmSubmitButton>
          </form>
        ) : null}
      </div>

      <div className="mt-8 grid gap-3">
        {logs.length === 0 && <div className="card p-5 text-zinc-400">Действий пока нет.</div>}
        {logs.map((log) => (
          <article className="card grid gap-2 p-5 md:grid-cols-[180px_1fr_220px] md:items-center" key={log.id}>
            <b className="text-power">{actionLabels[log.action] || log.action}</b>
            <span>{log.message}</span>
            <time className="text-sm text-zinc-500">{formatMoscowDateTime(log.createdAt)}</time>
          </article>
        ))}
      </div>
    </main>
  );
}
