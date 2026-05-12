import webPush, { type PushSubscription as WebPushSubscription } from 'web-push';
import { prisma } from '@/lib/prisma';

type LeadPushPayload = {
  id: string;
  name: string;
  phone: string;
};

type ReviewPushPayload = {
  id: string;
  clientName: string;
  rating: number;
};

type PushPayload = {
  title: string;
  body: string;
  url: string;
};

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:andreilordkipanidze98@yandex.ru';

  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

function configureWebPush() {
  const config = getVapidConfig();
  if (!config) return false;

  webPush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return true;
}

async function sendPushToAdmins(payload: PushPayload) {
  try {
    if (!configureWebPush()) return;

    const subscriptions = await prisma.pushSubscription.findMany();
    if (subscriptions.length === 0) return;

    await Promise.all(
      subscriptions.map(async (subscription) => {
        const pushSubscription: WebPushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        try {
          await webPush.sendNotification(pushSubscription, JSON.stringify(payload));
        } catch (error) {
          const statusCode = typeof error === 'object' && error && 'statusCode' in error ? Number(error.statusCode) : 0;
          if (statusCode === 404 || statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { endpoint: subscription.endpoint } }).catch(() => null);
          }
        }
      }),
    );
  } catch {
    // Push must never block creating leads or reviews.
  }
}

export async function sendNewLeadPush(lead: LeadPushPayload) {
  await sendPushToAdmins({
    title: 'Новая заявка VolteForce',
    body: `${lead.name}, ${lead.phone}`,
    url: '/admin/leads',
  });
}

export async function sendNewReviewPush(review: ReviewPushPayload) {
  await sendPushToAdmins({
    title: 'Новый отзыв на проверке',
    body: `${review.clientName}, ${review.rating} из 5`,
    url: '/admin/reviews?status=PENDING',
  });
}
