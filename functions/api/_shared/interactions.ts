import { encodeFilterValue } from './supabase';

export type InteractionTarget = {
  post_id?: string;
  target_type: 'post' | 'project';
  target_slug?: string;
};

export function withInteractionTarget<T extends InteractionTarget>(value: T): T & { target_slug: string | null } {
  return {
    ...value,
    target_slug: value.target_slug ?? null
  };
}

export function targetFilters(target: InteractionTarget): string {
  const filters = [`target_type=eq.${target.target_type}`];
  if (target.post_id) {
    filters.push(`post_id=eq.${encodeFilterValue(target.post_id)}`);
  }
  if (target.target_slug) {
    filters.push(`target_slug=eq.${encodeFilterValue(target.target_slug)}`);
  }
  return filters.join('&');
}
