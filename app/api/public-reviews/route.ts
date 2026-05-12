import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { publicReviewSchema } from '@/lib/validation';

const REVIEW_COOLDOWN_MINUTES = 30;

function getClientIp() {
  const h = headers();
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || h.get('x-real-ip') || 'unknown';
}

function hashIp(ip: string) {
  const salt = process.env.REVIEW_IP_SALT || process.env.NEXTAUTH_SECRET || 'volteforce-review-salt';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (ip !== 'unknown') body.set('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = publicReviewSchema.safeParse(raw);

  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const error =
      fields.clientName?.[0] ||
      fields.rating?.[0] ||
      fields.text?.[0] ||
      'Проверьте имя, оценку и текст отзыва.';
    return NextResponse.json({ error }, { status: 400 });
  }

  const { clientName, rating, text, website, companySite, turnstileToken } = parsed.data;
  if (website || companySite) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp();
  const ipHash = hashIp(ip);
  const userAgent = headers().get('user-agent')?.slice(0, 300) || null;
  const since = new Date(Date.now() - REVIEW_COOLDOWN_MINUTES * 60 * 1000);
  const recent = await prisma.review.count({
    where: {
      ipHash,
      createdAt: { gte: since },
    },
  });

  if (recent > 0) {
    return NextResponse.json(
      { error: `Отзыв уже отправлен. Повторить можно через ${REVIEW_COOLDOWN_MINUTES} минут.` },
      { status: 429 },
    );
  }

  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json({ error: 'Подтвердите, что вы не робот.' }, { status: 400 });
  }

  await prisma.review.create({
    data: {
      clientName,
      rating,
      text,
      isPublished: false,
      status: 'PENDING',
      ipHash,
      userAgent,
    },
  });

  revalidatePath('/admin/reviews');
  return NextResponse.json({ ok: true });
}
