import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PostSummary } from '../lib/api';

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="rounded-md border border-white/10 bg-white/[0.045] p-5 transition hover:border-signal/50 hover:bg-white/[0.07]">
      <div className="mb-4 flex items-center justify-between gap-4 text-xs text-paper/55">
        <span className="inline-flex items-center gap-2">
          <Clock3 size={14} aria-hidden="true" />
          {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft signal'}
        </span>
        <span className="rounded border border-white/10 px-2 py-1 font-mono text-[11px] uppercase text-signal">{post.status}</span>
      </div>
      <h2 className="text-xl font-semibold leading-tight text-white">{post.title}</h2>
      <p className="mt-3 min-h-14 text-sm leading-6 text-paper/68">{post.excerpt}</p>
      <Link to={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-signal">
        Read dispatch
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
