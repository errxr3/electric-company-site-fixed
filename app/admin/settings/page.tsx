import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { defaultSiteSettings, getSiteSettings, type SiteSettingKey } from '@/lib/settings';
import { prisma } from '@/lib/prisma';

const fields: Array<{ key: SiteSettingKey; label: string; type?: string; textarea?: boolean }> = [
  { key: 'phonePrimary', label: 'Основной телефон' },
  { key: 'phoneSecondary', label: 'Второй телефон' },
  { key: 'email', label: 'Почта', type: 'email' },
  { key: 'serviceArea', label: 'География работ', textarea: true },
  { key: 'areaNote', label: 'Примечание по выезду', textarea: true },
];

async function saveSettings(fd: FormData) {
  'use server';

  for (const field of fields) {
    const value = String(fd.get(field.key) || defaultSiteSettings[field.key]).trim();
    await prisma.siteSetting.upsert({
      where: { key: field.key },
      create: { key: field.key, value },
      update: { value },
    });
  }

  await writeAuditLog('update', 'settings', 'Обновлены контакты и география работ');
  revalidatePath('/');
  revalidatePath('/contacts');
  revalidatePath('/admin/settings');
}

export default async function SettingsAdmin() {
  if (!(await getServerSession(authOptions))) redirect('/admin/login');

  const settings = await getSiteSettings();

  return (
    <main className="container py-10">
      <AdminNav />
      <h1 className="text-4xl font-black">Контакты сайта</h1>
      <form action={saveSettings} className="card my-8 grid gap-4 p-5">
        {fields.map((field) => (
          <label className="grid gap-2" key={field.key}>
            <span className="font-bold">{field.label}</span>
            {field.textarea ? (
              <textarea name={field.key} defaultValue={settings[field.key]} required />
            ) : (
              <input name={field.key} type={field.type || 'text'} defaultValue={settings[field.key]} required />
            )}
          </label>
        ))}
        <button className="btn btn-primary">Сохранить контакты</button>
      </form>
    </main>
  );
}
