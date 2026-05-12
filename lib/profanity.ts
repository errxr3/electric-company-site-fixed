const profanityPatterns = [
  /б\s*л\s*[яе]\s*[дт]/,
  /б\s*л\s*я/,
  /б\s*л\s*и\s*а/,
  /в\s*ы\s*е\s*б/,
  /в\s*ь?\s*е\s*б/,
  /г\s*а\s*н\s*д\s*о\s*н/,
  /д\s*о\s*л\s*б\s*о\s*[её]\s*б/,
  /е\s*б\s*а/,
  /е\s*б\s*л/,
  /е\s*б\s*н/,
  /е\s*б\s*у/,
  /з\s*а\s*е\s*б/,
  /м\s*у\s*д\s*а\s*к/,
  /н\s*а\s*х\s*у/,
  /о\s*х\s*у\s*е/,
  /п\s*и\s*д\s*[оа]\s*р/,
  /п\s*и\s*з\s*д/,
  /п\s*о\s*х\s*у/,
  /п\s*р\s*и\s*д\s*у\s*р/,
  /с\s*у\s*к\s*а/,
  /х\s*е\s*р/,
  /х\s*у\s*[еёийюя]/,
  /х\s*у\s*й/,
  /ч\s*м\s*о/,
  /ш\s*а\s*л\s*а\s*в/,
];

const replacements: Record<string, string> = {
  a: 'а',
  c: 'с',
  e: 'е',
  k: 'к',
  m: 'м',
  o: 'о',
  p: 'р',
  t: 'т',
  x: 'х',
  y: 'у',
  '0': 'о',
  '3': 'з',
  '4': 'ч',
  '6': 'б',
  '@': 'а',
  '*': '',
};

function normalizeProfanityInput(value: string) {
  return value
    .toLowerCase()
    .replace(/[acekmopxty0346@*]/g, (char) => replacements[char] ?? char)
    .replace(/ё/g, 'е')
    .replace(/[^а-яa-z0-9]+/g, ' ');
}

export function hasProfanity(value: string) {
  const normalized = normalizeProfanityInput(value);
  const compact = normalized.replace(/\s+/g, '');
  return profanityPatterns.some((pattern) => pattern.test(normalized) || pattern.test(compact));
}
