import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { hasProfanity } from '@/lib/profanity';
import { sendNewReviewPush } from '@/lib/push';
import { getClientIp, hashIp, verifyTurnstile } from '@/lib/requestSecurity';
import { checkReviewSpam } from '@/lib/reviewSpam';
import { sendNewReviewTelegram } from '@/lib/telegram';
import { publicReviewSchema } from '@/lib/validation';

const REVIEW_COOLDOWN_MINUTES = 30;

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

  if (hasProfanity(`${clientName} ${text}`)) {
    return NextResponse.json(
      { error: 'Отзыв содержит недопустимые слова. Исправьте текст и отправьте снова.' },
      { status: 400 },
    );
  }

  const spamCheck = checkReviewSpam(clientName, text);
  if (spamCheck.suspicious) {
    return NextResponse.json({ error: spamCheck.reason || 'Отзыв похож на спам. Исправьте текст и отправьте снова.' }, { status: 400 });
  }

  const ip = getClientIp();
  const ipHash = hashIp(ip, 'review');
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

  const duplicateSince = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const duplicate = await prisma.review.count({
    where: {
      text,
      createdAt: { gte: duplicateSince },
    },
  });

  if (duplicate > 0) {
    return NextResponse.json({ error: 'Такой отзыв уже отправляли. Напишите другой текст.' }, { status: 409 });
  }

  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json({ error: 'Подтвердите, что вы не робот.' }, { status: 400 });
  }

  const review = await prisma.review.create({
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

  await sendNewReviewPush({ id: review.id, clientName: review.clientName, rating: review.rating });
  await sendNewReviewTelegram({ id: review.id, clientName: review.clientName, rating: review.rating, text: review.text });
  revalidatePath('/admin/reviews');
  return NextResponse.json({ ok: true });
}
