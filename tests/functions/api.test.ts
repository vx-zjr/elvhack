import { describe, expect, it, vi } from 'vitest';
import { jsonError, jsonOk, parseJson, requireAdmin } from '../../functions/api/_shared/http';
import { createPostSchema, normalizeSlug } from '../../functions/api/_shared/schemas';

const env = {
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
  ADMIN_GITHUB_USERNAMES: 'vx-zjr,other-admin'
};

describe('normalized API responses', () => {
  it('returns ok payloads as JSON', async () => {
    const response = jsonOk({ value: 42 });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, data: { value: 42 } });
  });

  it('returns structured errors with status codes', async () => {
    const response = jsonError('VALIDATION_ERROR', 'Invalid payload', 422);
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid payload' }
    });
  });
});

describe('request validation', () => {
  it('parses bounded JSON payloads', async () => {
    const request = new Request('https://elvhack.dev/api', {
      method: 'POST',
      body: JSON.stringify({ title: 'Edge Notes' })
    });
    await expect(parseJson(request, 1024)).resolves.toEqual({ title: 'Edge Notes' });
  });

  it('rejects invalid post drafts', () => {
    const result = createPostSchema.safeParse({ title: '', slug: 'Bad Slug!', content: '' });
    expect(result.success).toBe(false);
  });

  it('normalizes slugs for public URLs', () => {
    expect(normalizeSlug(' Edge Runtime: Notes ')).toBe('edge-runtime-notes');
  });
});

describe('admin authorization', () => {
  it('allows whitelisted GitHub usernames', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ user: { user_metadata: { user_name: 'vx-zjr' } } }), { status: 200 }));
    const result = await requireAdmin('Bearer token', env, fetcher);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.githubUsername).toBe('vx-zjr');
    }
  });

  it('blocks non-whitelisted GitHub usernames', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ user: { user_metadata: { user_name: 'guest' } } }), { status: 200 }));
    const result = await requireAdmin('Bearer token', env, fetcher);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
    }
  });
});
