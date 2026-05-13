import { parseLeadMessage } from '@/lib/leadCalculator';

type TelegramLeadPayload = {
  email?: string | null;
  id: string;
  message?: string | null;
  name: string;
  phone: string;
  sourcePath?: string | null;
  sourceTitle?: string | null;
};

type TelegramReviewPayload = {
  clientName: string;
  id: string;
  rating: number;
  text: string;
};

function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return null;
  return { botToken, chatId };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function line(label: string, value?: string | null) {
  const normalized = value?.trim();
  return normalized ? `<b>${label}:</b> ${escapeHtml(normalized)}` : '';
}

async function sendTelegramMessage(text: string) {
  const config = getTelegramConfig();
  if (!config) return;

  try {
    await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        disable_web_page_preview: true,
        parse_mode: 'HTML',
        text,
      }),
    });
  } catch {
    // Telegram notifications must never block creating leads or reviews.
  }
}

export async function sendNewLeadTelegram(lead: TelegramLeadPayload) {
  const parsed = parseLeadMessage(lead.message);
  const calculator = parsed.calculatorLines.length
    ? [
        '',
        '<b>Расчет из калькулятора:</b>',
        ...parsed.calculatorLines.map((item) =>
          `- ${escapeHtml(item.title)}: ${escapeHtml(item.quantity)}, ${escapeHtml(item.price)}, сумма ${escapeHtml(item.total)}`,
        ),
        parsed.calculatorTotal ? `<b>Итого от:</b> ${escapeHtml(parsed.calculatorTotal)}` : '',
      ]
    : [];

  const parts = [
    '⚡ <b>Новая заявка VolteForce</b>',
    '',
    line('Имя', lead.name),
    line('Телефон', lead.phone),
    line('Email', lead.email),
    line('Страница', lead.sourcePath),
    line('Заголовок', lead.sourceTitle),
    parsed.plainMessage ? `\n<b>Комментарий:</b>\n${escapeHtml(parsed.plainMessage)}` : '',
    ...calculator,
    '',
    `<b>ID:</b> ${escapeHtml(lead.id)}`,
  ].filter(Boolean);

  await sendTelegramMessage(parts.join('\n'));
}

export async function sendNewReviewTelegram(review: TelegramReviewPayload) {
  const parts = [
    '⭐ <b>Новый отзыв на проверке</b>',
    '',
    line('Имя', review.clientName),
    line('Оценка', `${review.rating} из 5`),
    `\n<b>Текст:</b>\n${escapeHtml(review.text)}`,
    '',
    `<b>ID:</b> ${escapeHtml(review.id)}`,
  ].filter(Boolean);

  await sendTelegramMessage(parts.join('\n'));
}
