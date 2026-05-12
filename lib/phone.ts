export function normalizeRussianPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const normalized =
    digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))
      ? `7${digits.slice(1)}`
      : digits.length === 10
        ? `7${digits}`
        : digits;

  if (!/^7\d{10}$/.test(normalized)) return null;

  return `+7 (${normalized.slice(1, 4)}) ${normalized.slice(4, 7)}-${normalized.slice(7, 9)}-${normalized.slice(9, 11)}`;
}

export function getRussianPhoneDigits(value: string) {
  return normalizeRussianPhone(value)?.replace(/\D/g, '') || null;
}

export function formatRussianPhoneInput(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (digits.length === 10) digits = `7${digits}`;
  if (digits.length > 0 && !digits.startsWith('7')) digits = `7${digits}`;
  digits = digits.slice(0, 11);

  if (!digits) return '';

  const parts = [
    '+7',
    digits.length > 1 ? ` (${digits.slice(1, 4)}` : '',
    digits.length >= 4 ? ')' : '',
    digits.length > 4 ? ` ${digits.slice(4, 7)}` : '',
    digits.length > 7 ? `-${digits.slice(7, 9)}` : '',
    digits.length > 9 ? `-${digits.slice(9, 11)}` : '',
  ];

  return parts.join('');
}
