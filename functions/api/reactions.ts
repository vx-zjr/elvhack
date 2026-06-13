import { reactionSchema } from './_shared/schemas';
import { jsonError, jsonOk, parseJson, withErrorBoundary } from './_shared/http';
import { supabaseRest } from './_shared/supabase';
import type { Env } from './_shared/types';

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) =>
  withErrorBoundary(async () => {
    const parsed = reactionSchema.safeParse(await parseJson(request));
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid reaction.', 422);
    }
    const result = await supabaseRest(env, 'reactions?select=*', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify(parsed.data)
    });
    if (!result.ok) {
      return jsonError('UPSTREAM_ERROR', result.message, result.status);
    }
    return jsonOk({ reaction: Array.isArray(result.data) ? result.data[0] : result.data }, 201);
  });
