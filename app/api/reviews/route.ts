import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reviewSchema } from '@/lib/validation';

function publishedByStatus(status?: string, fallback = false) {
  if (!status) return fallback;
  return status === 'PUBLISHED';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(await prisma.review.findMany({ orderBy: { createdAt: 'desc' } }));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation error' }, { status: 400 });

  const data = parsed.data;
  return NextResponse.json(
    await prisma.review.create({
      data: {
        ...data,
        isPublished: publishedByStatus(data.status, data.isPublished ?? true),
      },
    }),
    { status: 201 },
  );
}
