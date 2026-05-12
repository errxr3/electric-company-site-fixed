import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { LeadStatus, Prisma } from '@prisma/client';
import { AdminNav } from '@/components/AdminNav';
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { formatMoscowDateTime } from '@/lib/formatDate';
import { parseLeadMessage } from '@/lib/leadCalculator';
import { getRussianPhoneDigits } from '@/lib/phone';
import { prisma } from '@/lib/prisma';

const statusMeta: Record<LeadStatus, { label: string; dot: string }> = {
  NEW: { label: 'новая', dot: 'bg-red-500' },
  IN_PROGRESS: { label: 'в работе', dot: 'bg-yellow-400' },
  DONE: { label: 'выполнена', dot: 'bg-green-500' },
};

const statusOptions = Object.entries(statusMeta) as Array<[LeadStatus, { label: string; dot: string }]>;

function parseStatus(value?: string): LeadStatus | undefined {
  return value && value in statusMeta ? (value as LeadStatus) : undefined;
}

async function setStatus(formData: FormData) {
  'use server';

  const id = String(formData.get('id'));
  const status = parseStatus(String(formData.get('status'))) || LeadStatus.NEW;
  const lead = await prisma.lead.update({ where: { id }, data: { status } });

  await writeAuditLog('update', 'lead', `Заявка ${lead.name} переведена в статус "${statusMeta[status].label}"`, id);
  revalidatePath('/admin/leads');
}

async function markDone(formData: FormData) {
  'use server';

  const id = String(formData.get('id'));
  const lead = await prisma.lead.update({ where: { id }, data: { status: LeadStatus.DONE } });

  await writeAuditLog('update', 'lead', `Заявка ${lead.name} отмечена как обработанная`, id);
  revalidatePath('/admin/leads');
}

async function deleteLead(formData: FormData) {
  'use server';

  const id = String(formData.get('id'));
  const lead = await prisma.lead.findUnique({ where: { id }, select: { name: true, phone: true } });
  await prisma.lead.delete({ where: { id } });

  await writeAuditLog('delete', 'lead', `Удалена заявка ${lead?.name || ''} ${lead?.phone || ''}`.trim(), id);
  revalidatePath('/admin/leads');
}

export default async function Leads({
  searchParams,
}: {
  searchParams?: { status?: string; q?: string };
}) {
  if (!(await getServerSession(authOptions))) redirect('/admin/login');

  const selectedStatus = parseStatus(searchParams?.status);
  const q = String(searchParams?.q || '').trim();
  const where: Prisma.LeadWhereInput = {
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
            { email: { contains: q, mode: 'insensitive' } },
            { message: { contains: q, mode: 'insensitive' } },
            { service: { title: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [leads, total, newCount, progressCount, doneCount] = await Promise.all([
    prisma.lead.findMany({ where, include: { service: true }, orderBy: { createdAt: 'desc' } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: LeadStatus.NEW } }),
    prisma.lead.count({ where: { status: LeadStatus.IN_PROGRESS } }),
    prisma.lead.count({ where: { status: LeadStatus.DONE } }),
  ]);

  return (
    <main className="container py-10">
      <AdminNav />
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-bold text-power">Всего заявок: {total}</p>
          <h1 className="text-4xl font-black">Заявки</h1>
        </div>
        <form className="grid gap-3 md:grid-cols-[240px_180px_140px]" action="/admin/leads">
          <input name="q" placeholder="Поиск по заявкам" defaultValue={q} />
          <select name="status" defaultValue={selectedStatus || ''}>
            <option value="">Все статусы</option>
            {statusOptions.map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
          <button className="btn btn-primary">Найти</button>
        </form>
      </div>

      <div className="my-6 grid gap-3 md:grid-cols-3">
        <div className="card p-5">
          <span className="text-sm text-zinc-500">Новые</span>
          <b className="block text-3xl text-red-400">{newCount}</b>
        </div>
        <div className="card p-5">
          <span className="text-sm text-zinc-500">В работе</span>
          <b className="block text-3xl text-yellow-300">{progressCount}</b>
        </div>
        <div className="card p-5">
          <span className="text-sm text-zinc-500">Выполнены</span>
          <b className="block text-3xl text-green-400">{doneCount}</b>
        </div>
      </div>

      <div className="grid gap-4">
        {leads.length === 0 && <div className="card p-5 text-zinc-400">Заявки не найдены.</div>}
        {leads.map((lead) => {
          const meta = statusMeta[lead.status] ?? statusMeta.NEW;
          const parsedMessage = parseLeadMessage(lead.message);
          const hasCalculator = parsedMessage.calculatorLines.length > 0;
          const serviceLabel = lead.service?.title || (hasCalculator ? 'Расчет из калькулятора' : 'Без услуги');
          const phoneDigits = getRussianPhoneDigits(lead.phone);
          const telHref = phoneDigits ? `tel:+${phoneDigits}` : `tel:${lead.phone}`;
          const whatsappHref = phoneDigits
            ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Здравствуйте, ${lead.name}! Вы оставляли заявку на сайте VolteForce.`)}`
            : null;

          return (
            <article className="card grid gap-4 p-5 md:grid-cols-[1.1fr_1fr_1fr_1fr_190px_150px] md:items-center" key={lead.id}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${meta.dot}`} aria-label={meta.label} />
                  <b>{lead.name}</b>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{meta.label}</p>
              </div>
              <div>
                <span>{lead.phone}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a className="btn btn-ghost px-3 py-2 text-sm" href={telHref}>
                    Позвонить
                  </a>
                  {whatsappHref ? (
                    <a className="btn btn-ghost px-3 py-2 text-sm" href={whatsappHref} rel="noreferrer" target="_blank">
                      WhatsApp
                    </a>
                  ) : null}
                </div>
              </div>
              <span className={hasCalculator ? 'font-bold text-power' : ''}>{serviceLabel}</span>
              <span>{formatMoscowDateTime(lead.createdAt)}</span>
              <form action={setStatus} className="grid gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <select name="status" defaultValue={lead.status}>
                  {statusOptions.map(([value, optionMeta]) => (
                    <option key={value} value={value}>
                      {optionMeta.label}
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary">Сохранить</button>
              </form>
              <div className="grid gap-2">
                <form action={markDone}>
                  <input type="hidden" name="id" value={lead.id} />
                  <button className="btn btn-primary w-full">Обработано</button>
                </form>
                <form action={deleteLead}>
                  <input type="hidden" name="id" value={lead.id} />
                  <ConfirmSubmitButton message="Удалить эту заявку?">Удалить</ConfirmSubmitButton>
                </form>
              </div>
              {(parsedMessage.plainMessage || hasCalculator) && (
                <div className="grid gap-4 md:col-span-6">
                  {parsedMessage.plainMessage && (
                    <div className="rounded-2xl bg-zinc-900/70 p-4 text-zinc-300">
                      <b className="text-white">Комментарий клиента</b>
                      <p className="mt-2 whitespace-pre-wrap">{parsedMessage.plainMessage}</p>
                    </div>
                  )}
                  {hasCalculator && (
                    <div className="overflow-hidden rounded-2xl border border-power/30 bg-power/5">
                      <div className="flex flex-col gap-1 border-b border-power/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <b className="text-power">Расчет из калькулятора</b>
                        {parsedMessage.calculatorTotal && <span className="font-black text-white">Итого от: {parsedMessage.calculatorTotal}</span>}
                      </div>
                      <div className="divide-y divide-white/10">
                        {parsedMessage.calculatorLines.map((line, index) => (
                          <div className="grid gap-2 px-4 py-3 text-sm text-zinc-300 md:grid-cols-[1fr_110px_120px_120px]" key={`${line.title}-${index}`}>
                            <span className="text-white">{line.title}</span>
                            <span>{line.quantity}</span>
                            <span>{line.price}</span>
                            <b className="text-power">{line.total}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
