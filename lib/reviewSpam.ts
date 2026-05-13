const SUSPICIOUS_LINK_RE = /(https?:\/\/|www\.|\.ru\b|\.com\b|\.net\b|\.org\b|t\.me\/|wa\.me\/)/i;
const REPEATED_CHARS_RE = /(.)\1{7,}/;
const CYRILLIC_OR_LATIN_RE = /[a-zа-яё]/i;

export type ReviewSpamCheck = {
  reason?: string;
  suspicious: boolean;
};

function uniqueWordRatio(text: string) {
  const words = text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);

  if (words.length < 8) return 1;
  return new Set(words).size / words.length;
}

export function checkReviewSpam(clientName: string, text: string): ReviewSpamCheck {
  const normalizedText = text.trim();
  const normalizedName = clientName.trim();
  const emojiCount = Array.from(normalizedText).filter((char) => {
    const code = char.codePointAt(0) || 0;
    return code >= 0x1f300 && code <= 0x1faff;
  }).length;

  if (SUSPICIOUS_LINK_RE.test(normalizedText) || SUSPICIOUS_LINK_RE.test(normalizedName)) {
    return { suspicious: true, reason: 'Ссылки в публичных отзывах запрещены.' };
  }

  if (REPEATED_CHARS_RE.test(normalizedText) || REPEATED_CHARS_RE.test(normalizedName)) {
    return { suspicious: true, reason: 'В отзыве слишком много повторяющихся символов.' };
  }

  if (!CYRILLIC_OR_LATIN_RE.test(normalizedText) || !CYRILLIC_OR_LATIN_RE.test(normalizedName)) {
    return { suspicious: true, reason: 'Проверьте имя и текст отзыва.' };
  }

  if (emojiCount > 6) {
    return { suspicious: true, reason: 'Слишком много эмодзи в отзыве.' };
  }

  if (uniqueWordRatio(normalizedText) < 0.45) {
    return { suspicious: true, reason: 'Отзыв похож на повторяющийся спам.' };
  }

  return { suspicious: false };
}
