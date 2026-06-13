import { pageViewSchema } from './_shared/schemas';
import { jsonError, jsonOk, parseJson, withErrorBoundary } from './_shared/http';
import { supabaseRest } from './_shared/supabase';
import type { Env } from './_shared/types';

function getAgentFamily(userAgent: string | null): string {
  if (!userAgent) {
    return 'unknown';
  }
  if (/firefox/i.test(userAgent)) {
    return 'firefox';
  }
  if (/edg/i.test(userAgent)) {
    return 'edge';
  }
  if (/chrome/i.test(userAgent)) {
    return 'chrome';
  }
  if (/safari/i.test(userAgent)) {
    return 'safari';
  }
  return 'other';
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) =>
  withErrorBoundary(async () => {
    const parsed = pageViewSchema.safeParse(await parseJson(request, 2048));
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid analytics event.', 422);
    }
    const result = await supabaseRest(env, 'page_views', {
      method: 'POST',
      body: JSON.stringify({
        ...parsed.data,
        user_agent_family: getAgentFamily(request.headers.get('user-agent'))
      })
    });
    if (!result.ok) {
      return jsonError('UPSTREAM_ERROR', result.message, result.status);
    }
    return jsonOk({ recorded: true }, 201);
  });
