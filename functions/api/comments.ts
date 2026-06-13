import { commentSchema } from './_shared/schemas';
import { jsonError, jsonOk, parseJson, withErrorBoundary } from './_shared/http';
import { withInteractionTarget } from './_shared/interactions';
import { supabaseRest } from './_shared/supabase';
import type { Env } from './_shared/types';

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) =>
  withErrorBoundary(async () => {
    const parsed = commentSchema.safeParse(await parseJson(request));
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid comment.', 422);
    }
    const result = await supabaseRest(env, 'comments?select=*', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify(withInteractionTarget({ ...parsed.data, status: 'pending' }))
    });
    if (!result.ok) {
      return jsonError('UPSTREAM_ERROR', result.message, result.status);
    }
    return jsonOk({ comment: Array.isArray(result.data) ? result.data[0] : result.data }, 201);
  });
