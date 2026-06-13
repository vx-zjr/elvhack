import { createPostSchema, normalizeSlug } from '../../_shared/schemas';
import { jsonError, jsonOk, parseJson, requireAdmin, withErrorBoundary } from '../../_shared/http';
import { supabaseRest } from '../../_shared/supabase';
import type { Env } from '../../_shared/types';

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) =>
  withErrorBoundary(async () => {
    const admin = await requireAdmin(request.headers.get('authorization'), env);
    if (!admin.ok) {
      return admin.response;
    }

    const parsed = createPostSchema.safeParse(await parseJson(request));
    if (!parsed.success) {
      return jsonError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid post payload.', 422);
    }

    const post = {
      title: parsed.data.title,
      slug: parsed.data.slug || normalizeSlug(parsed.data.title),
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      cover_image_url: parsed.data.cover_image_url || null,
      status: 'draft',
      author_github_username: admin.githubUsername
    };

    const result = await supabaseRest(env, 'posts?select=*', {
      method: 'POST',
      headers: { prefer: 'return=representation' },
      body: JSON.stringify(post)
    });
    if (!result.ok) {
      return jsonError('UPSTREAM_ERROR', result.message, result.status);
    }
    return jsonOk({ post: Array.isArray(result.data) ? result.data[0] : result.data }, 201);
  });
