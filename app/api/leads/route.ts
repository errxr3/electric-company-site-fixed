import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { normalizeRussianPhone } from '@/lib/phone';
import { prisma } from '@/lib/prisma';
import { sendNewLeadPush } from '@/lib/push';
import { getClientIp, hashIp, verifyTurnstile } from '@/lib/requestSecurity';
import { sendNewLeadTelegram } from '@/lib/telegram';
import { leadSchema } from '@/lib/validation';

const LEAD_COOLDOWN_MINUTES = 10;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(await prisma.lead.findMany({ include: { service: true }, orderBy: { createdAt: 'desc' } }));
}

export async function POST(req: Request) {
  const parsed = leadSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation error' }, { status: 400 });

  const data = parsed.data;
  if (data.companySite) return NextResponse.json({ ok: true }, { status: 201 });

  const phone = normalizeRussianPhone(data.phone);
  if (!phone) return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });

  const ip = getClientIp();
  const ipHash = hashIp(ip, 'lead');
  const recent = await prisma.lead.count({
    where: {
      ipHash,
      createdAt: { gte: new Date(Date.now() - LEAD_COOLDOWN_MINUTES * 60 * 1000) },
    },
  });

  if (recent > 0) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  const captchaOk = await verifyTurnstile(data.turnstileToken, ip);
  if (!captchaOk) return NextResponse.json({ error: 'Captcha required' }, { status: 400 });

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone,
      email: data.email || null,
      message: data.message || null,
      sourcePath: data.sourcePath || null,
      sourceTitle: data.sourceTitle || null,
      ipHash,
      userAgent: req.headers.get('user-agent')?.slice(0, 300) || null,
      serviceId: data.serviceId || null,
    },
  });

  await writeAuditLog('create', 'lead', `Поступила новая заявка от ${lead.name}`, lead.id);
  await sendNewLeadPush({ id: lead.id, name: lead.name, phone: lead.phone });
  await sendNewLeadTelegram({
    email: lead.email,
    id: lead.id,
    message: lead.message,
    name: lead.name,
    phone: lead.phone,
    sourcePath: lead.sourcePath,
    sourceTitle: lead.sourceTitle,
  });
  return NextResponse.json(lead, { status: 201 });
}
