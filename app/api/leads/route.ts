import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { normalizeRussianPhone } from '@/lib/phone';
import { prisma } from '@/lib/prisma';
import { leadSchema } from '@/lib/validation';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(await prisma.lead.findMany({ include: { service: true }, orderBy: { createdAt: 'desc' } }));
}

export async function POST(req: Request) {
  const parsed = leadSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation error' }, { status: 400 });

  const data = parsed.data;
  const phone = normalizeRussianPhone(data.phone);
  if (!phone) return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone,
      email: data.email || null,
      message: data.message || null,
      serviceId: data.serviceId || null,
    },
  });

  await writeAuditLog('create', 'lead', `Поступила новая заявка от ${lead.name}`, lead.id);
  return NextResponse.json(lead, { status: 201 });
}
