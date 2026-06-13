import { jsonError, jsonOk, withErrorBoundary } from '../_shared/http';
import { encodeFilterValue, supabaseRest } from '../_shared/supabase';
import type { Env } from '../_shared/types';

interface PostDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  cover_image_url: string | null;
  published_at: string | null;
  updated_at: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) =>
  withErrorBoundary(async () => {
    const slug = String(params.slug || '');
    const result = await supabaseRest<PostDetail[]>(
      env,
      `posts?select=id,title,slug,excerpt,content,status,cover_image_url,published_at,updated_at&slug=eq.${encodeFilterValue(slug)}&status=eq.published&limit=1`
    );
    if (!result.ok) {
      return jsonError('UPSTREAM_ERROR', result.message, result.status);
    }
    const post = result.data[0];
    if (!post) {
      return jsonError('NOT_FOUND', 'Post was not found.', 404);
    }
    return jsonOk({ post });
  });
