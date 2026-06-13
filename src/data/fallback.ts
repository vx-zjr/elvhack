import type { PostDetail, PostSummary } from '../lib/api';

export const fallbackPosts: PostDetail[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'Building elvhack on the edge',
    slug: 'building-elvhack-on-the-edge',
    excerpt: 'A rebuild note for a personal CMS that treats the edge as the default place for product behavior.',
    content:
      '# Building elvhack on the edge\n\nThis dispatch sketches the new direction: a visual-first personal site, a practical CMS, and a Cloudflare Pages Functions layer that keeps privileged Supabase work off the client.\n\nThe key constraint is discipline. Runtime code stays edge-compatible, validation is explicit, and every iteration updates the memory documents before it claims completion.',
    status: 'published',
    cover_image_url: null,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    title: 'CMS as a personal flight deck',
    slug: 'cms-as-a-personal-flight-deck',
    excerpt: 'The admin surface is intentionally compact: write, preview, publish, moderate, and keep moving.',
    content:
      '# CMS as a personal flight deck\n\nThe first CMS version is not trying to be a general publishing platform. It is a quiet cockpit for one technical writer: markdown in, structured metadata beside it, publishing controls within reach.',
    status: 'published',
    cover_image_url: null,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const fallbackSummaries: PostSummary[] = fallbackPosts.map((post) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  status: post.status,
  cover_image_url: post.cover_image_url,
  published_at: post.published_at,
  updated_at: post.updated_at
}));
