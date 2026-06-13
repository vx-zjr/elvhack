import { FilePenLine, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiSend, type PostSummary } from '../../lib/api';
import { fallbackSummaries } from '../../data/fallback';
import { getAccessToken } from '../../lib/supabase';

export function AdminPostsPage() {
  const [posts, setPosts] = useState<PostSummary[]>(fallbackSummaries);
  const [message, setMessage] = useState('Drafts require a configured Supabase session.');

  useEffect(() => {
    getAccessToken().then(async (token) => {
      const result = await apiGet<{ posts: PostSummary[] }>('/api/posts?includeDrafts=true', token ?? undefined);
      if (result.ok) {
        setPosts(result.data.posts);
        setMessage('Loaded CMS posts.');
      }
    });
  }, []);

  const createDraft = async () => {
    const token = await getAccessToken();
    const result = await apiSend<{ post: PostSummary }>(
      '/api/admin/posts',
      {
        title: 'Untitled edge dispatch',
        excerpt: 'A fresh draft from the elvhack CMS.',
        content: '# Untitled edge dispatch\n\nStart writing here.'
      },
      token ?? undefined
    );
    if (result.ok) {
      setPosts((current) => [result.data.post, ...current]);
      setMessage('Draft created.');
    } else {
      setMessage(result.error.message);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-sm uppercase text-ember">Admin</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Posts</h1>
          <p className="mt-3 text-paper/62">{message}</p>
        </div>
        <button type="button" onClick={createDraft} className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-3 font-semibold text-ink hover:bg-white">
          <Plus size={18} aria-hidden="true" />
          New draft
        </button>
      </div>
      <div className="mt-8 overflow-hidden rounded-md border border-white/10">
        {posts.map((post) => (
          <Link key={post.id} to={`/admin/posts/${post.id}`} className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.04] p-4 last:border-b-0 hover:bg-white/[0.075]">
            <span>
              <span className="block font-semibold text-white">{post.title}</span>
              <span className="mt-1 block text-sm text-paper/50">/{post.slug}</span>
            </span>
            <FilePenLine className="shrink-0 text-signal" size={20} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
