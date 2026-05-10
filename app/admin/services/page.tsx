import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { priceItems } from '@/lib/priceItems';
import { prisma } from '@/lib/prisma';

async function add(formData: FormData) {
  'use server';

  const service = await prisma.service.create({
    data: {
      title: String(formData.get('title')),
      description: String(formData.get('description')),
      priceFrom: Number(formData.get('priceFrom')),
      isPopular: Boolean(formData.get('isPopular')),
    },
  });

  await writeAuditLog('create', 'service', `Добавлена услуга "${service.title}"`, service.id);
  revalidatePath('/services');
  revalidatePath('/admin/services');
}

async function update(formData: FormData) {
  'use server';

  const service = await prisma.service.update({
    where: { id: String(formData.get('id')) },
    data: {
      title: String(formData.get('title')),
      description: String(formData.get('description')),
      priceFrom: Number(formData.get('priceFrom')),
      isPopular: Boolean(formData.get('isPopular')),
    },
  });

  await writeAuditLog('update', 'service', `Обновлена услуга "${service.title}"`, service.id);
  revalidatePath('/services');
  revalidatePath('/admin/services');
}

async function del(formData: FormData) {
  'use server';

  const id = String(formData.get('id'));
  const service = await prisma.service.findUnique({ where: { id }, select: { title: true } });
  await prisma.lead.updateMany({ where: { serviceId: id }, data: { serviceId: null } });
  await prisma.service.delete({ where: { id } });

  await writeAuditLog('delete', 'service', `Удалена услуга "${service?.title || id}"`, id);
  revalidatePath('/services');
  revalidatePath('/admin/services');
}

async function syncPriceServices() {
  'use server';

  const existing = await prisma.service.findMany({ select: { title: true } });
  const titles = new Set(existing.map((item) => item.title));
  const missing = priceItems.filter((item) => !titles.has(item.title));

  if (missing.length) {
    await prisma.service.createMany({
      data: missing.map((item) => ({
        title: item.title,
        description: `${item.category}. Цена указана за ${item.unit}.`,
        priceFrom: item.price,
        isPopular: ['Розетки и выключатели', 'Освещение', 'Электрощит'].includes(item.category),
      })),
    });
    await writeAuditLog('sync', 'service', `Добавлены услуги из прайс-листа: ${missing.length}`);
  }

  revalidatePath('/services');
  revalidatePath('/admin/services');
}

export default async function ServicesAdmin() {
  if (!(await getServerSession(authOptions))) redirect('/admin/login');

  const items = await prisma.service.findMany({ orderBy: [{ isPopular: 'desc' }, { title: 'asc' }] });

  return (
    <main className="container py-10">
      <AdminNav />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-black">Услуги</h1>
        <form action={syncPriceServices}>
          <button className="btn btn-ghost">Добавить услуги из прайса</button>
        </form>
      </div>

      <form action={add} className="card my-8 grid gap-3 p-5">
        <input name="title" placeholder="Название" required />
        <input name="priceFrom" type="number" min="0" placeholder="Цена от" required />
        <textarea name="description" placeholder="Описание" required />
        <label className="flex items-center gap-2">
          <input className="w-auto" type="checkbox" name="isPopular" /> Популярная
        </label>
        <button className="btn btn-primary">Добавить</button>
      </form>

      <div className="grid gap-4">
        {items.map((item) => (
          <article className="card grid gap-4 p-5" key={item.id}>
            <form action={update} className="grid gap-3 md:grid-cols-[1.2fr_160px_1.6fr_150px] md:items-start">
              <input type="hidden" name="id" value={item.id} />
              <input name="title" defaultValue={item.title} placeholder="Название" required />
              <input name="priceFrom" type="number" min="0" defaultValue={item.priceFrom} required />
              <textarea name="description" defaultValue={item.description} placeholder="Описание" required />
              <div className="grid gap-2">
                <label className="flex items-center gap-2">
                  <input className="w-auto" type="checkbox" name="isPopular" defaultChecked={item.isPopular} /> Популярная
                </label>
                <button className="btn btn-primary">Сохранить</button>
              </div>
            </form>
            <form action={del} className="md:w-40">
              <input type="hidden" name="id" value={item.id} />
              <ConfirmSubmitButton message="Удалить эту услугу?">Удалить</ConfirmSubmitButton>
            </form>
          </article>
        ))}
      </div>
    </main>
  );
}
