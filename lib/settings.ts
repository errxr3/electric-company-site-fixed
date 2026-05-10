import { prisma } from '@/lib/prisma';

export const defaultSiteSettings = {
  phonePrimary: '+7 (910) 835-98-87',
  phoneSecondary: '+7 (930) 186-13-06',
  email: 'andreilordkipanidze98@yandex.ru',
  serviceArea: 'Работаем по Твери, пригородам и населенным пунктам Тверской области.',
  areaNote: 'Выезд по области до 100 км туда-обратно: от 1000 ₽ по прайс-листу.',
};

export type SiteSettings = typeof defaultSiteSettings;
export type SiteSettingKey = keyof SiteSettings;

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany();
  const values = { ...defaultSiteSettings };

  for (const row of rows) {
    if (row.key in values) {
      values[row.key as SiteSettingKey] = row.value;
    }
  }

  return values;
}

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
