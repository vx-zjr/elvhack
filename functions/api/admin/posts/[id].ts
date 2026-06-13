import { updatePostSchema } from '../../_shared/schemas';
import { jsonError, jsonOk, parseJson, requireAdmin, withErrorBoundary } from '../../_shared/http';
import { encodeFilterValue, supabaseRest } from '../../_shared/supabase';
import type { Env } from '../../_shared/types';

export const onRequestPatch: PagesFunction<Env> = async ({ env, request, params }) =>
  withErrorBoundary(async () => {
    const admin = await requireAdmin(request.headers.get('authorization'), env);
    if (!admin.ok) {
      return admin.response;
    }

    const parsed = updatePostSchema.safeParse(await parseJson(request));
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid post update.', 422);
    }

    const result = await supabaseRest(env, `posts?id=eq.${encodeFilterValue(String(params.id))}&select=*`, {
      method: 'PATCH',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify({ ...parsed.data, updated_by_github_username: admin.githubUsername })
    });
    if (!result.ok) {
      return jsonError('UPSTREAM_ERROR', result.message, result.status);
    }
    return jsonOk({ post: Array.isArray(result.data) ? result.data[0] : result.data });
  });
