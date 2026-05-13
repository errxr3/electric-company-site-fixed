export const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '109149546';

declare global {
  interface Window {
    ym?: (counterId: number, method: string, target: string, params?: Record<string, unknown>) => void;
  }
}

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const counterId = Number(yandexMetrikaId);
  if (!counterId || !window.ym) return;

  window.ym(counterId, 'reachGoal', goal, params);
}
