import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { formatMoscowDateTime } from '@/lib/formatDate';
import { prisma } from '@/lib/prisma';

type ReviewStatusValue = 'PENDING' | 'PUBLISHED' | 'HIDDEN' | 'REJECTED';

const statusLabels: Record<ReviewStatusValue, string> = {
  PENDING: 'На проверке',
  PUBLISHED: 'Опубликован',
  HIDDEN: 'Скрыт',
  REJECTED: 'Отклонен',
};

const statusClasses: Record<ReviewStatusValue, string> = {
  PENDING: 'bg-yellow-400 text-black',
  PUBLISHED: 'bg-green-500 text-black',
  HIDDEN: 'bg-zinc-500 text-white',
  REJECTED: 'bg-red-500 text-white',
};

const statusValues = Object.keys(statusLabels) as ReviewStatusValue[];

function parseStatus(status?: string): ReviewStatusValue | undefined {
  return statusValues.includes(status as ReviewStatusValue) ? (status as ReviewStatusValue) : undefined;
}

function publishedByStatus(status: ReviewStatusValue) {
  return status === 'PUBLISHED';
}

async function add(fd: FormData) {
  'use server';

  const status = parseStatus(String(fd.get('status'))) || 'PUBLISHED';
  const review = await prisma.review.create({
    data: {
      clientName: String(fd.get('clientName')),
      rating: Number(fd.get('rating')),
      text: String(fd.get('text')),
      status,
      isPublished: publishedByStatus(status),
    },
  });

  await writeAuditLog('create', 'review', `Добавлен отзыв "${review.clientName}"`, review.id);
  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin/reviews');
}

async function update(fd: FormData) {
  'use server';

  const id = String(fd.get('id'));
  const status = parseStatus(String(fd.get('status'))) || 'PENDING';
  const review = await prisma.review.update({
    where: { id },
    data: {
      clientName: String(fd.get('clientName')),
      rating: Number(fd.get('rating')),
      text: String(fd.get('text')),
      status,
      isPublished: publishedByStatus(status),
    },
  });

  await writeAuditLog('update', 'review', `Обновлен отзыв "${review.clientName}"`, review.id);
  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin/reviews');
}

async function del(fd: FormData) {
  'use server';

  const id = String(fd.get('id'));
  const review = await prisma.review.findUnique({ where: { id }, select: { clientName: true } });
  await prisma.review.delete({ where: { id } });
  await writeAuditLog('delete', 'review', `Удален отзыв "${review?.clientName || id}"`, id);
  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin/reviews');
}

export default async function ReviewsAdmin({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  if (!(await getServerSession(authOptions))) redirect('/admin/login');

  const selectedStatus = parseStatus(searchParams?.status);
  const where = selectedStatus ? { status: selectedStatus } : {};
  const [items, total, pending, badPending] = await Promise.all([
    prisma.review.findMany({ where, orderBy: { createdAt: 'desc' } }),
    prisma.review.count(),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.review.count({ where: { status: 'PENDING', rating: { lte: 3 } } }),
  ]);

  return (
    <main className="container py-10">
      <AdminNav />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-bold text-power">Модерация и защита</p>
          <h1 className="text-4xl font-black">Отзывы</h1>
        </div>
        <Link className="btn btn-ghost" href="/reviews">
          Открыть страницу отзывов
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-zinc-400">Всего отзывов</p>
          <b className="text-3xl">{total}</b>
        </div>
        <div className="card p-5">
          <p className="text-sm text-zinc-400">На проверке</p>
          <b className="text-3xl text-power">{pending}</b>
        </div>
        <div className="card p-5">
          <p className="text-sm text-zinc-400">Низкая оценка на проверке</p>
          <b className="text-3xl text-red-400">{badPending}</b>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link className={`btn ${!selectedStatus ? 'btn-primary' : 'btn-ghost'}`} href="/admin/reviews">
          Все
        </Link>
        {statusValues.map((status) => (
          <Link
            className={`btn ${selectedStatus === status ? 'btn-primary' : 'btn-ghost'}`}
            href={`/admin/reviews?status=${status}`}
            key={status}
          >
            {statusLabels[status]}
          </Link>
        ))}
      </div>

      <form action={add} className="card my-8 grid gap-3 p-5">
        <h2 className="text-2xl font-black">Добавить отзыв вручную</h2>
        <input name="clientName" placeholder="Клиент" required />
        <input name="rating" type="number" min="1" max="5" placeholder="Рейтинг" required />
        <textarea name="text" placeholder="Текст" required rows={4} />
        <select name="status" defaultValue="PUBLISHED">
          {statusValues.map((status) => (
            <option value={status} key={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        <button className="btn btn-primary">Добавить</button>
      </form>

      <div className="grid gap-4">
        {items.length === 0 && <div className="card p-5 text-zinc-400">Отзывы не найдены.</div>}
        {items.map((item) => {
          const status = item.status as ReviewStatusValue;
          return (
            <article className="card grid gap-4 p-5" key={item.id}>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusClasses[status]}`}>
                  {statusLabels[status]}
                </span>
                {item.rating <= 3 ? <span className="text-sm font-bold text-red-400">Низкая оценка</span> : null}
                <span className="text-sm text-zinc-500">{formatMoscowDateTime(item.createdAt)}</span>
              </div>
              <form action={update} className="grid gap-3">
                <input type="hidden" name="id" value={item.id} />
                <div className="grid gap-3 md:grid-cols-[1fr_120px_220px]">
                  <input name="clientName" defaultValue={item.clientName} placeholder="Клиент" required />
                  <input name="rating" type="number" min="1" max="5" defaultValue={item.rating} required />
                  <select name="status" defaultValue={status}>
                    {statusValues.map((value) => (
                      <option value={value} key={value}>
                        {statusLabels[value]}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea name="text" defaultValue={item.text} placeholder="Текст" required rows={4} />
                <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                  <button className="btn btn-primary">Сохранить</button>
                  <span className="text-sm text-zinc-500">
                    {item.ipHash ? 'Публичная отправка, IP сохранен в хеше' : 'Добавлен из админки'}
                  </span>
                </div>
              </form>
              <form action={del}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmSubmitButton message="Удалить этот отзыв?">Удалить</ConfirmSubmitButton>
              </form>
            </article>
          );
        })}
      </div>
    </main>
  );
}
