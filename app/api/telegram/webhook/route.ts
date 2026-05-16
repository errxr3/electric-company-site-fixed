import { NextResponse } from 'next/server';
import {
  answerTelegramCallbackQuery,
  getTelegramChatId,
  metrikaReplyMarkup,
  sendTelegramMessage,
} from '@/lib/telegram';
import { getDailyMetrikaReportText } from '@/lib/yandexMetrikaReport';

type TelegramUpdate = {
  callback_query?: {
    data?: string;
    id: string;
    message?: {
      chat?: { id?: number | string };
    };
  };
  message?: {
    chat?: { id?: number | string };
    text?: string;
  };
};

export const dynamic = 'force-dynamic';

function isAllowedChat(chatId?: number | string) {
  const allowedChatId = getTelegramChatId();
  return Boolean(allowedChatId && String(chatId) === String(allowedChatId));
}

async function sendStats(chatId: number | string) {
  const report = await getDailyMetrikaReportText();
  await sendTelegramMessage(report.text, {
    chatId,
    replyMarkup: metrikaReplyMarkup(),
  });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || process.env.CRON_SECRET;

  if (secret && url.searchParams.get('secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;
  if (!update) return NextResponse.json({ ok: true });

  const messageChatId = update.message?.chat?.id;
  const callbackChatId = update.callback_query?.message?.chat?.id;
  const chatId = messageChatId || callbackChatId;

  if (!isAllowedChat(chatId)) return NextResponse.json({ ok: true });

  const text = update.message?.text?.trim().toLowerCase();
  const callbackData = update.callback_query?.data;

  if (callbackData === 'metrika_today') {
    await answerTelegramCallbackQuery(update.callback_query!.id, 'Запрашиваю статистику...');
    await sendStats(chatId!);
    return NextResponse.json({ ok: true });
  }

  if (text === '/stat' || text === 'статистика') {
    await sendStats(chatId!);
    return NextResponse.json({ ok: true });
  }

  if (text === '/start') {
    await sendTelegramMessage(
      'VolteForce на связи. Нажми кнопку ниже или отправь команду /stat, чтобы получить статистику Яндекс Метрики за сегодня.',
      {
        chatId,
        replyMarkup: metrikaReplyMarkup(),
      },
    );
  }

  return NextResponse.json({ ok: true });
}
