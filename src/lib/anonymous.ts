const key = 'elvhack.anonymous_id';

export function getAnonymousId() {
  if (typeof window === 'undefined') {
    return crypto.randomUUID();
  }
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const next = crypto.randomUUID();
  window.localStorage.setItem(key, next);
  return next;
}
