import { interactionQuerySchema } from './_shared/schemas';
import { jsonError, jsonOk, withErrorBoundary } from './_shared/http';
import { targetFilters } from './_shared/interactions';
import { supabaseCount, supabaseRest } from './_shared/supabase';
import type { Env } from './_shared/types';

interface PublicComment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) =>
  withErrorBoundary(async () => {
    const url = new URL(request.url);
    const parsed = interactionQuerySchema.safeParse({
      target_type: url.searchParams.get('target_type') ?? undefined,
      target_slug: url.searchParams.get('target_slug') ?? undefined,
      post_id: url.searchParams.get('post_id') ?? undefined
    });
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid interaction target.', 422);
    }

    const filters = targetFilters(parsed.data);
    const comments = await supabaseRest<PublicComment[]>(
      env,
      `comments?select=id,author_name,body,created_at&${filters}&status=eq.approved&order=created_at.desc&limit=12`
    );
    if (!comments.ok) {
      return jsonError('UPSTREAM_ERROR', comments.message, comments.status);
    }

    const likes = await supabaseCount(env, `reactions?select=id&${filters}&kind=eq.like`);
    if (!likes.ok) {
      return jsonError('UPSTREAM_ERROR', likes.message, likes.status);
    }

    return jsonOk({ comments: comments.data, reactions: { like: likes.count } });
  });
