import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serviceSchema } from '@/lib/validation';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = serviceSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation error' }, { status: 400 });

  return NextResponse.json(await prisma.service.update({ where: { id: params.id }, data: parsed.data }));
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.lead.updateMany({ where: { serviceId: params.id }, data: { serviceId: null } });
  await prisma.service.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
