import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

async function add(fd: FormData) {
  'use server';

  const review = await prisma.review.create({
    data: {
      clientName: String(fd.get('clientName')),
      rating: Number(fd.get('rating')),
      text: String(fd.get('text')),
      isPublished: true,
    },
  });

  await writeAuditLog('create', 'review', `Добавлен отзыв "${review.clientName}"`, review.id);
  revalidatePath('/reviews');
  revalidatePath('/admin/reviews');
}

async function del(fd: FormData) {
  'use server';

  const id = String(fd.get('id'));
  const review = await prisma.review.findUnique({ where: { id }, select: { clientName: true } });
  await prisma.review.delete({ where: { id } });
  await writeAuditLog('delete', 'review', `Удален отзыв "${review?.clientName || id}"`, id);
  revalidatePath('/reviews');
  revalidatePath('/admin/reviews');
}

export default async function ReviewsAdmin() {
  if (!(await getServerSession(authOptions))) redirect('/admin/login');

  const items = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="container py-10">
      <AdminNav />
      <h1 className="text-4xl font-black">Отзывы</h1>
      <form action={add} className="card my-8 grid gap-3 p-5">
        <input name="clientName" placeholder="Клиент" required />
        <input name="rating" type="number" min="1" max="5" placeholder="Рейтинг" required />
        <textarea name="text" placeholder="Текст" required />
        <button className="btn btn-primary">Добавить</button>
      </form>
      <div className="grid gap-4">
        {items.map((item) => (
          <article className="card grid gap-3 p-5 md:grid-cols-[1fr_160px] md:items-center" key={item.id}>
            <div>
              <div className="text-power">{'★'.repeat(item.rating)}</div>
              <b>{item.clientName}</b>
              <p className="mt-2 text-zinc-400">{item.text}</p>
            </div>
            <form action={del}>
              <input type="hidden" name="id" value={item.id} />
              <ConfirmSubmitButton message="Удалить этот отзыв?">Удалить</ConfirmSubmitButton>
            </form>
          </article>
        ))}
      </div>
    </main>
  );
}
