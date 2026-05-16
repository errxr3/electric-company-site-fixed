import { metrikaReplyMarkup, sendTelegramMessage } from '@/lib/telegram';
import { yandexMetrikaId } from '@/lib/yandexMetrika';

type MetrikaApiResponse = {
  totals?: number[];
};

const metricNames = [
  'ym:s:visits',
  'ym:s:users',
  'ym:s:pageviews',
  'ym:s:bounceRate',
  'ym:s:pageDepth',
  'ym:s:avgVisitDurationSeconds',
];

function formatNumber(value?: number, digits = 0) {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value || 0);
}

function formatDuration(seconds?: number) {
  const total = Math.round(seconds || 0);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function getMoscowDate() {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export async function sendDailyMetrikaReport() {
  const report = await getDailyMetrikaReportText();
  await sendTelegramMessage(report.text, { replyMarkup: metrikaReplyMarkup() });
  return report.ok ? { ok: true } : { ok: false, error: report.error };
}

export async function getDailyMetrikaReportText() {
  const token = process.env.YANDEX_METRIKA_TOKEN;
  const counterId = process.env.YANDEX_METRIKA_COUNTER_ID || yandexMetrikaId;

  if (!token || !counterId) {
    return {
      ok: false,
      error: 'Metrika config missing',
      text: '📊 <b>Статистика Метрики не отправлена</b>\n\nНе заданы переменные YANDEX_METRIKA_TOKEN или YANDEX_METRIKA_COUNTER_ID.',
    };
  }

  const date = getMoscowDate();
  const params = new URLSearchParams({
    accuracy: 'full',
    date1: date,
    date2: date,
    ids: counterId,
    metrics: metricNames.join(','),
  });

  const response = await fetch(`https://api-metrika.yandex.net/stat/v1/data?${params.toString()}`, {
    headers: { Authorization: `OAuth ${token}` },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    return {
      ok: false,
      error: `Metrika API ${response.status}`,
      text: `📊 <b>Не удалось получить статистику Метрики</b>\n\nКод: ${response.status}\n${details.slice(0, 500)}`,
    };
  }

  const data = (await response.json()) as MetrikaApiResponse;
  const [visits, users, pageviews, bounceRate, pageDepth, avgDuration] = data.totals || [];

  return {
    ok: true,
    text: [
      '📊 <b>Статистика VolteForce за сегодня</b>',
      '',
      `<b>Дата:</b> ${date}`,
      `<b>Визиты:</b> ${formatNumber(visits)}`,
      `<b>Посетители:</b> ${formatNumber(users)}`,
      `<b>Просмотры:</b> ${formatNumber(pageviews)}`,
      `<b>Отказы:</b> ${formatNumber(bounceRate, 1)}%`,
      `<b>Глубина просмотра:</b> ${formatNumber(pageDepth, 2)}`,
      `<b>Среднее время:</b> ${formatDuration(avgDuration)}`,
    ].join('\n'),
  };
}
