import webPush, { type PushSubscription as WebPushSubscription } from 'web-push';
import { prisma } from '@/lib/prisma';

type LeadPushPayload = {
  id: string;
  name: string;
  phone: string;
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

export async function sendNewLeadPush(lead: LeadPushPayload) {
  try {
    if (!configureWebPush()) return;

    const subscriptions = await prisma.pushSubscription.findMany();
    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title: 'Новая заявка VolteForce',
      body: `${lead.name}, ${lead.phone}`,
      url: '/admin/leads',
    });

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
          await webPush.sendNotification(pushSubscription, payload);
        } catch (error) {
          const statusCode = typeof error === 'object' && error && 'statusCode' in error ? Number(error.statusCode) : 0;
          if (statusCode === 404 || statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { endpoint: subscription.endpoint } }).catch(() => null);
          }
        }
      }),
    );
  } catch {
    // Push must never block lead creation.
  }
}
