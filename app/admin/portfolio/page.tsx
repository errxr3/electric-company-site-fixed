import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import Image from 'next/image';
import Link from 'next/link';
import sharp from 'sharp';
import { del as delBlob, put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'portfolio');
const PAGE_SIZE = 5;
const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;

async function saveImage(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (!file.type.startsWith('image/')) throw new Error('Можно загружать только изображения');
  if (file.size > MAX_UPLOAD_SIZE) throw new Error('Размер каждого фото должен быть до 2 МБ');

  const filename = `${randomUUID()}.webp`;
  const optimized = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1280, height: 900, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`portfolio/${filename}`, optimized, {
      access: 'public',
      contentType: 'image/webp',
    });

    return blob.url;
  }

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), optimized);

  return `/uploads/portfolio/${filename}`;
}

async function deleteUpload(src?: string | null) {
  if (src?.startsWith('https://')) {
    await delBlob(src).catch(() => undefined);
    return;
  }

  if (!src?.startsWith('/uploads/portfolio/')) return;

  const filePath = path.join(process.cwd(), 'public', src);
  const resolved = path.resolve(filePath);
  const allowed = path.resolve(uploadDir);
  if (!resolved.startsWith(allowed)) return;

  await unlink(resolved).catch(() => undefined);
}

async function add(fd: FormData) {
  'use server';

  const beforeImage = await saveImage(fd.get('beforeImage'));
  const afterImage = await saveImage(fd.get('afterImage'));

  const item = await prisma.portfolioItem.create({
    data: {
      title: String(fd.get('title')),
      objectType: String(fd.get('objectType')),
      description: String(fd.get('description')),
      completedAt: new Date(String(fd.get('completedAt'))),
      beforeImage,
      afterImage,
    },
  });

  await writeAuditLog('create', 'portfolio', `Добавлена работа "${item.title}"`, item.id);
  revalidatePath('/portfolio');
  revalidatePath('/admin/portfolio');
}

async function update(fd: FormData) {
  'use server';

  const id = String(fd.get('id'));
  const current = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!current) return;

  const nextBefore = await saveImage(fd.get('beforeImage'));
  const nextAfter = await saveImage(fd.get('afterImage'));
  const removeBefore = Boolean(fd.get('removeBeforeImage'));
  const removeAfter = Boolean(fd.get('removeAfterImage'));

  if (nextBefore || removeBefore) await deleteUpload(current.beforeImage);
  if (nextAfter || removeAfter) await deleteUpload(current.afterImage);

  const item = await prisma.portfolioItem.update({
    where: { id },
    data: {
      title: String(fd.get('title')),
      objectType: String(fd.get('objectType')),
      description: String(fd.get('description')),
      completedAt: new Date(String(fd.get('completedAt'))),
      beforeImage: nextBefore ?? (removeBefore ? null : current.beforeImage),
      afterImage: nextAfter ?? (removeAfter ? null : current.afterImage),
    },
  });

  await writeAuditLog('update', 'portfolio', `Обновлена работа "${item.title}"`, id);
  revalidatePath('/portfolio');
  revalidatePath('/admin/portfolio');
}

async function del(fd: FormData) {
  'use server';

  const id = String(fd.get('id'));
  const current = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!current) return;

  await prisma.portfolioItem.delete({ where: { id } });
  await deleteUpload(current.beforeImage);
  await deleteUpload(current.afterImage);

  await writeAuditLog('delete', 'portfolio', `Удалена работа "${current.title}"`, id);
  revalidatePath('/portfolio');
  revalidatePath('/admin/portfolio');
}

export default async function PortfolioAdmin({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  if (!(await getServerSession(authOptions))) redirect('/admin/login');

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const [items, total] = await Promise.all([
    prisma.portfolioItem.findMany({
      orderBy: { completedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.portfolioItem.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="container py-10">
      <AdminNav />
      <h1 className="text-4xl font-black">Портфолио</h1>

      <form action={add} className="card my-8 grid gap-3 p-5" encType="multipart/form-data">
        <h2 className="text-2xl font-black">Добавить работу</h2>
        <input name="title" placeholder="Название" required />
        <input name="objectType" placeholder="Тип объекта" required />
        <input name="completedAt" type="date" required />
        <textarea name="description" placeholder="Описание" required />
        <label className="grid gap-2">
          Фото 1
          <input accept="image/*" name="beforeImage" type="file" />
        </label>
        <label className="grid gap-2">
          Фото 2
          <input accept="image/*" name="afterImage" type="file" />
        </label>
        <p className="text-sm text-zinc-500">Фото автоматически сжимаются до WebP. Для стабильной загрузки добавляйте фото до 2 МБ каждое.</p>
        <button className="btn btn-primary">Добавить</button>
      </form>

      <div className="grid gap-4">
        {items.map((item) => (
          <article className="card grid gap-4 p-5" key={item.id}>
            <form action={update} className="grid gap-3" encType="multipart/form-data">
              <input type="hidden" name="id" value={item.id} />
              <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_160px]">
                <input name="title" defaultValue={item.title} placeholder="Название" required />
                <input name="objectType" defaultValue={item.objectType} placeholder="Тип объекта" required />
                <input name="completedAt" type="date" defaultValue={item.completedAt.toISOString().slice(0, 10)} required />
              </div>
              <textarea name="description" defaultValue={item.description} placeholder="Описание" required />

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: 'Фото 1', src: item.beforeImage, fileName: 'beforeImage', removeName: 'removeBeforeImage' },
                  { label: 'Фото 2', src: item.afterImage, fileName: 'afterImage', removeName: 'removeAfterImage' },
                ].map((image) => (
                  <div className="grid gap-2" key={image.fileName}>
                    <span className="font-bold">{image.label}</span>
                    {image.src ? (
                      <Image
                        alt={`${item.title} ${image.label}`}
                        className="aspect-video w-full rounded-2xl object-cover"
                        height={260}
                        loading="lazy"
                        sizes="(min-width: 768px) 50vw, 100vw"
                        src={image.src}
                        width={420}
                      />
                    ) : (
                      <div className="rounded-2xl bg-zinc-800 p-8 text-center text-zinc-500">Фото не добавлено</div>
                    )}
                    <input accept="image/*" name={image.fileName} type="file" />
                    <label className="flex items-center gap-2">
                      <input className="w-auto" name={image.removeName} type="checkbox" /> Удалить фото
                    </label>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary">Сохранить</button>
            </form>
            <form action={del} className="md:w-40">
              <input type="hidden" name="id" value={item.id} />
              <ConfirmSubmitButton message="Удалить эту работу?">Удалить работу</ConfirmSubmitButton>
            </form>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {page > 1 && (
            <Link className="btn btn-ghost" href={`/admin/portfolio?page=${page - 1}`}>
              Назад
            </Link>
          )}
          <span className="text-zinc-400">
            Страница {page} из {totalPages}
          </span>
          {page < totalPages && (
            <Link className="btn btn-ghost" href={`/admin/portfolio?page=${page + 1}`}>
              Вперед
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
