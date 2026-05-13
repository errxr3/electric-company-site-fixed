import { createHash } from 'crypto';
import { headers } from 'next/headers';

export function getClientIp() {
  const h = headers();
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || h.get('x-real-ip') || 'unknown';
}

export function hashIp(ip: string, scope: string) {
  const salt = process.env.REQUEST_IP_SALT || process.env.NEXTAUTH_SECRET || 'volteforce-request-salt';
  return createHash('sha256').update(`${salt}:${scope}:${ip}`).digest('hex');
}

export async function verifyTurnstile(token: string | undefined, ip: string) {
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
