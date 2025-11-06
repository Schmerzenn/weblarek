const rawOrigin = import.meta.env?.VITE_API_ORIGIN ?? '';

const apiOrigin = normaliseOrigin(rawOrigin);

function normaliseOrigin(origin: unknown): string {
  if (typeof origin !== 'string') {
    return '';
  }
  return origin.trim().replace(/\/+$/, '');
}

function composeUrl(segment: string): string {
  const cleanSegment = segment.replace(/^\/+/, '');
  return apiOrigin ? `${apiOrigin}/${cleanSegment}` : `/${cleanSegment}`;
}

// Формирует полные URL относительно переменной VITE_API_ORIGIN
export const API_URL = composeUrl('api/weblarek');
export const CDN_URL = composeUrl('content/weblarek');

const CATEGORY_CLASSNAME_MAP = Object.freeze({
  'софт-скил': 'card__category_soft',
  'хард-скил': 'card__category_hard',
  Button: 'card__category_button',
  'кнопка': 'card__category_button',
  Extras: 'card__category_additional',
  'дополнительное': 'card__category_additional',
  Other: 'card__category_other',
  'другое': 'card__category_other',
} as const);

// Соотносит пользовательские названия категорий с CSS-классами карточек.
export const categoryMap = CATEGORY_CLASSNAME_MAP;
