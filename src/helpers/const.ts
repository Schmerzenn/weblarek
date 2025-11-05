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

/** Builds full API/CDN URLs relative to VITE_API_ORIGIN. */
export const API_URL = composeUrl('api/weblarek');
export const CDN_URL = composeUrl('content/weblarek');

const CATEGORY_CLASSNAME_MAP = Object.freeze({
  'Soft skill': 'card__category_soft',
  'Hard skill': 'card__category_hard',
  Button: 'card__category_button',
  Extras: 'card__category_additional',
  Other: 'card__category_other',
} as const);

/** Maps human-readable categories to card CSS modifiers. */
export const categoryMap = CATEGORY_CLASSNAME_MAP;
