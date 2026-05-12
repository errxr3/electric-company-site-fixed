import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reviewSchema } from '@/lib/validation';

function publishedByStatus(status?: string, fallback = false) {
  if (!status) return fallback;
  return status === 'PUBLISHED';
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = reviewSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation error' }, { status: 400 });

  const data = parsed.data;
  const review = await prisma.review.update({
    where: { id: params.id },
    data: {
      ...data,
      isPublished: publishedByStatus(data.status, data.isPublished ?? false),
    },
  });

  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin/reviews');
  return NextResponse.json(review);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.review.delete({ where: { id: params.id } });
  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/admin/reviews');
  return NextResponse.json({ ok: true });
}
