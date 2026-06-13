import { jsonError, jsonOk, withErrorBoundary } from '../_shared/http';
import { supabaseRest } from '../_shared/supabase';
import type { Env } from '../_shared/types';

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  cover_image_url: string | null;
  published_at: string | null;
  updated_at: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) =>
  withErrorBoundary(async () => {
    const url = new URL(request.url);
    const includeDrafts = url.searchParams.get('includeDrafts') === 'true';
    const statusFilter = includeDrafts ? '' : '&status=eq.published';
    const result = await supabaseRest<PostListItem[]>(
      env,
      `posts?select=id,title,slug,excerpt,status,cover_image_url,published_at,updated_at${statusFilter}&order=published_at.desc.nullslast&limit=50`
    );
    if (!result.ok) {
      return jsonError('UPSTREAM_ERROR', result.message, result.status);
    }
    return jsonOk({ posts: result.data });
  });
