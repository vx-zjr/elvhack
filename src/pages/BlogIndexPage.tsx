import { useEffect, useState } from 'react';
import { PostCard } from '../components/PostCards';
import { apiGet, type PostSummary } from '../lib/api';
import { fallbackSummaries } from '../data/fallback';

export function BlogIndexPage() {
  const [posts, setPosts] = useState<PostSummary[]>(fallbackSummaries);
  const [status, setStatus] = useState('Local fallback content');

  useEffect(() => {
    let active = true;
    apiGet<{ posts: PostSummary[] }>('/api/posts')
      .then((result) => {
        if (!active) return;
        if (result.ok) {
          setPosts(result.data.posts);
          setStatus('Live Supabase feed');
        } else {
          setStatus(result.error.message);
        }
      })
      .catch(() => {
        if (active) setStatus('API unavailable, showing local fallback');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-signal">Dispatches</p>
        <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">Blog</h1>
        <p className="mt-4 text-paper/70">Notes on edge systems, interface craft, publishing flow, and whatever earns a place in the lab.</p>
        <p className="mt-4 text-sm text-paper/46">{status}</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
