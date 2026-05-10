export type PriceUnit = 'шт.' | 'м.п.' | 'час' | 'услуга' | 'выезд';

export type PriceItem = {
  id: string;
  category: string;
  title: string;
  price: number;
  unit: PriceUnit;
};

export const priceItems: PriceItem[] = [
  { id: 'socket-install', category: 'Розетки и выключатели', title: 'Установка розетки/выключателя в подрозетник', price: 400, unit: 'шт.' },
  { id: 'surface-socket', category: 'Розетки и выключатели', title: 'Установка накладной розетки/выключателя', price: 400, unit: 'шт.' },
  { id: 'socket-replace', category: 'Розетки и выключатели', title: 'Замена розетки/выключателя в подрозетнике', price: 500, unit: 'шт.' },
  { id: 'smart-relay', category: 'Розетки и выключатели', title: 'Установка и синхронизация с умным реле', price: 1500, unit: 'шт.' },
  { id: 'chandelier', category: 'Освещение', title: 'Установка и подключение люстры или потолочного светильника', price: 1000, unit: 'шт.' },
  { id: 'wall-light', category: 'Освещение', title: 'Установка накладного светильника/бра', price: 650, unit: 'шт.' },
  { id: 'spot-light', category: 'Освещение', title: 'Установка точечного светильника в готовое отверстие', price: 200, unit: 'шт.' },
  { id: 'led-profile', category: 'Светодиодная лента', title: 'Монтаж алюминиевого профиля для LED-ленты', price: 200, unit: 'м.п.' },
  { id: 'led-strip', category: 'Светодиодная лента', title: 'Установка светодиодной ленты', price: 200, unit: 'м.п.' },
  { id: 'power-supply', category: 'Светодиодная лента', title: 'Установка блока питания или контроллера', price: 900, unit: 'шт.' },
  { id: 'cable-ceiling', category: 'Прокладка кабеля', title: 'Прокладка кабеля по потолку/полу до 2,5 мм', price: 250, unit: 'м.п.' },
  { id: 'cable-corrugation', category: 'Прокладка кабеля', title: 'Прокладка кабеля в гофре до 2,5 мм', price: 150, unit: 'м.п.' },
  { id: 'low-voltage', category: 'Прокладка кабеля', title: 'Прокладка слаботочного кабеля', price: 90, unit: 'м.п.' },
  { id: 'soft-chase', category: 'Штробление', title: 'Штробление мягких материалов 25х20 мм', price: 200, unit: 'м.п.' },
  { id: 'brick-chase', category: 'Штробление', title: 'Штробление кирпичных стен 25х20 мм', price: 300, unit: 'м.п.' },
  { id: 'concrete-chase', category: 'Штробление', title: 'Штробление бетонных стен 25х20 мм', price: 700, unit: 'м.п.' },
  { id: 'drywall-box', category: 'Подрозетники', title: 'Сверление отверстия под подрозетник в гипсокартоне', price: 120, unit: 'шт.' },
  { id: 'brick-box', category: 'Подрозетники', title: 'Сверление отверстия под подрозетник в кирпиче', price: 400, unit: 'шт.' },
  { id: 'concrete-box', category: 'Подрозетники', title: 'Сверление отверстия под подрозетник в бетоне', price: 1000, unit: 'шт.' },
  { id: 'panel-12', category: 'Электрощит', title: 'Сборка и подключение щита до 12 модулей', price: 6000, unit: 'шт.' },
  { id: 'panel-24', category: 'Электрощит', title: 'Сборка и подключение щита до 24 модулей', price: 12000, unit: 'шт.' },
  { id: 'breaker-1p', category: 'Электрощит', title: 'Установка однополюсного автоматического выключателя', price: 400, unit: 'шт.' },
  { id: 'breaker-2p', category: 'Электрощит', title: 'Установка двухполюсного автомата/УЗО/дифавтомата', price: 600, unit: 'шт.' },
  { id: 'stove', category: 'Подключение техники', title: 'Подключение электроплиты, варочной поверхности или духовки', price: 1000, unit: 'шт.' },
  { id: 'washer', category: 'Подключение техники', title: 'Подключение стиральной или посудомоечной машины', price: 1000, unit: 'шт.' },
  { id: 'diagnostics', category: 'Ремонт и диагностика', title: 'Поиск неисправностей', price: 3000, unit: 'час' },
  { id: 'small-repair', category: 'Ремонт и диагностика', title: 'Мелкие ремонтные работы', price: 3000, unit: 'услуга' },
  { id: 'visit', category: 'Выезд', title: 'Выезд замерщика или бригады до 100 км туда-обратно', price: 1000, unit: 'выезд' },
];

export const featuredPriceItems = priceItems.slice(0, 10);
