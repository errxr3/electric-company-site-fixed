import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [newCount, latest] = await Promise.all([
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true } }),
  ]);

  return NextResponse.json({ latestId: latest?.id ?? null, newCount });
}
