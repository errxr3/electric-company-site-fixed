import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const actionLabels: Record<string, string> = {
  create: 'Добавление',
  update: 'Изменение',
  delete: 'Удаление',
  sync: 'Синхронизация',
};

export default async function AuditAdmin() {
  if (!(await getServerSession(authOptions))) redirect('/admin/login');

  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });

  return (
    <main className="container py-10">
      <AdminNav />
      <h1 className="text-4xl font-black">Журнал действий</h1>
      <div className="mt-8 grid gap-3">
        {logs.length === 0 && <div className="card p-5 text-zinc-400">Действий пока нет.</div>}
        {logs.map((log) => (
          <article className="card grid gap-2 p-5 md:grid-cols-[180px_1fr_220px] md:items-center" key={log.id}>
            <b className="text-power">{actionLabels[log.action] || log.action}</b>
            <span>{log.message}</span>
            <time className="text-sm text-zinc-500">{new Date(log.createdAt).toLocaleString('ru-RU')}</time>
          </article>
        ))}
      </div>
    </main>
  );
}
