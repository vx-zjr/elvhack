import type { AdminResult, Env, Fetcher } from './types';

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

export function jsonOk<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: jsonHeaders
  });
}

export function jsonError(code: string, message: string, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, error: { code, message } }), {
    status,
    headers: jsonHeaders
  });
}

export async function parseJson(request: Request, maxBytes = 8192): Promise<unknown> {
  const text = await request.text();
  if (text.length > maxBytes) {
    throw new Error('PAYLOAD_TOO_LARGE');
  }
  if (!text.trim()) {
    return {};
  }
  return JSON.parse(text) as unknown;
}

export function getBearerToken(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  return match?.[1] ?? null;
}

function parseAdminUsers(env: Env): Set<string> {
  return new Set(
    (env.ADMIN_GITHUB_USERNAMES || 'vx-zjr')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

function getMetadataUsername(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const user = 'user' in payload ? (payload as { user?: unknown }).user : payload;
  if (!user || typeof user !== 'object') {
    return null;
  }
  const metadata = (user as { user_metadata?: unknown }).user_metadata;
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  const fields = metadata as Record<string, unknown>;
  const candidate = fields.user_name ?? fields.preferred_username ?? fields.name;
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
}

export async function requireAdmin(
  authorization: string | null,
  env: Env,
  fetcher: Fetcher = fetch
): Promise<AdminResult> {
  const token = getBearerToken(authorization);
  if (!token) {
    return { ok: false, response: jsonError('UNAUTHORIZED', 'Missing bearer token.', 401) };
  }
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    return { ok: false, response: jsonError('CONFIG_MISSING', 'Supabase public configuration is missing.', 500) };
  }

  const response = await fetcher(`${env.VITE_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.VITE_SUPABASE_ANON_KEY,
      authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    return { ok: false, response: jsonError('UNAUTHORIZED', 'Supabase session is invalid.', 401) };
  }

  const payload = (await response.json()) as unknown;
  const username = getMetadataUsername(payload);
  if (!username) {
    return { ok: false, response: jsonError('FORBIDDEN', 'GitHub username is missing from the session.', 403) };
  }

  const allowed = parseAdminUsers(env);
  if (!allowed.has(username.toLowerCase())) {
    return { ok: false, response: jsonError('FORBIDDEN', 'GitHub user is not allowed to manage this CMS.', 403) };
  }

  return { ok: true, githubUsername: username, user: payload };
}

export async function withErrorBoundary(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError('INVALID_JSON', 'Request body is not valid JSON.', 400);
    }
    if (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE') {
      return jsonError('PAYLOAD_TOO_LARGE', 'Request body is too large.', 413);
    }
    return jsonError('INTERNAL_ERROR', 'The edge function failed safely.', 500);
  }
}
