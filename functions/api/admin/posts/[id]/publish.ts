import { publishPostSchema } from '../../../_shared/schemas';
import { jsonError, jsonOk, parseJson, requireAdmin, withErrorBoundary } from '../../../_shared/http';
import { encodeFilterValue, supabaseRest } from '../../../_shared/supabase';
import type { Env } from '../../../_shared/types';

export const onRequestPost: PagesFunction<Env> = async ({ env, request, params }) =>
  withErrorBoundary(async () => {
    const admin = await requireAdmin(request.headers.get('authorization'), env);
    if (!admin.ok) {
      return admin.response;
    }

    const parsed = publishPostSchema.safeParse(await parseJson(request));
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid publish request.', 422);
    }

    const now = new Date().toISOString();
    const payload = parsed.data.publish
      ? { status: 'published', published_at: now, updated_by_github_username: admin.githubUsername }
      : { status: 'draft', published_at: null, updated_by_github_username: admin.githubUsername };

    const result = await supabaseRest(env, `posts?id=eq.${encodeFilterValue(String(params.id))}&select=*`, {
      method: 'PATCH',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });
    if (!result.ok) {
      return jsonError('UPSTREAM_ERROR', result.message, result.status);
    }
    return jsonOk({ post: Array.isArray(result.data) ? result.data[0] : result.data });
  });
