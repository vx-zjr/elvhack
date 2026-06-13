import { z } from 'zod';

export const slugSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: slugSchema.optional(),
  excerpt: z.string().trim().max(280).default(''),
  content: z.string().min(1).max(60000),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string().trim().min(1).max(32)).max(8).default([])
});

export const updatePostSchema = createPostSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional()
});

export const publishPostSchema = z.object({
  publish: z.boolean().default(true)
});

export const commentSchema = z.object({
  post_id: z.string().uuid().optional(),
  target_type: z.enum(['post', 'project']).default('post'),
  target_slug: slugSchema.optional(),
  author_name: z.string().trim().min(1).max(80).default('Anonymous'),
  author_email: z.string().email().max(160).optional(),
  body: z.string().trim().min(1).max(2000)
}).refine((value) => Boolean(value.post_id || value.target_slug), {
  message: 'Comment target is required.',
  path: ['target_slug']
});

export const reactionSchema = z.object({
  post_id: z.string().uuid().optional(),
  target_type: z.enum(['post', 'project']).default('post'),
  target_slug: slugSchema.optional(),
  anonymous_id: z.string().uuid().optional(),
  kind: z.enum(['like', 'spark', 'useful', 'mindblown']).default('like')
}).refine((value) => Boolean(value.post_id || value.target_slug), {
  message: 'Reaction target is required.',
  path: ['target_slug']
});

export const interactionQuerySchema = z.object({
  target_type: z.enum(['post', 'project']).default('post'),
  target_slug: slugSchema.optional(),
  post_id: z.string().uuid().optional()
}).refine((value) => Boolean(value.post_id || value.target_slug), {
  message: 'Interaction target is required.',
  path: ['target_slug']
});

export const pageViewSchema = z.object({
  path: z.string().trim().min(1).max(240),
  post_slug: z.string().trim().max(96).optional(),
  referrer: z.string().trim().max(240).optional()
});
