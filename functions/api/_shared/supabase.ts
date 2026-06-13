import type { Env, Fetcher, SupabaseConfig } from './types';

type FetchInit = NonNullable<Parameters<Fetcher>[1]>;

export function getSupabaseConfig(env: Env): SupabaseConfig | null {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return {
    url: env.VITE_SUPABASE_URL.replace(/\/$/, ''),
    anonKey: env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
  };
}

export async function supabaseRest<T>(
  env: Env,
  path: string,
  init: FetchInit = {},
  fetcher: Fetcher = fetch
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const config = getSupabaseConfig(env);
  if (!config) {
    return { ok: false, status: 500, message: 'Supabase service configuration is missing.' };
  }

  const headers = new Headers(init.headers);
  headers.set('apikey', config.serviceRoleKey);
  headers.set('authorization', `Bearer ${config.serviceRoleKey}`);
  if (!headers.has('content-type') && init.body) {
    headers.set('content-type', 'application/json');
  }
  headers.set('accept', 'application/json');

  const response = await fetcher(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, status: response.status, message: message || 'Supabase request failed.' };
  }

  if (response.status === 204) {
    return { ok: true, data: null as T };
  }

  return { ok: true, data: (await response.json()) as T };
}

export async function supabaseCount(
  env: Env,
  path: string,
  fetcher: Fetcher = fetch
): Promise<{ ok: true; count: number } | { ok: false; status: number; message: string }> {
  const config = getSupabaseConfig(env);
  if (!config) {
    return { ok: false, status: 500, message: 'Supabase service configuration is missing.' };
  }

  const response = await fetcher(`${config.url}/rest/v1/${path}`, {
    method: 'GET',
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      accept: 'application/json',
      prefer: 'count=exact'
    }
  });

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, status: response.status, message: message || 'Supabase count request failed.' };
  }

  const range = response.headers.get('content-range');
  const total = range?.split('/')[1];
  return { ok: true, count: total && total !== '*' ? Number(total) : 0 };
}

export function encodeFilterValue(value: string): string {
  return encodeURIComponent(value.replace(/\*/g, ''));
}
