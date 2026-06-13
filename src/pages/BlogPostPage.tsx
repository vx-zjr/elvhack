import { Send, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiSend, type PostDetail } from '../lib/api';
import { fallbackPosts } from '../data/fallback';

function renderMarkdown(markdown: string) {
  return markdown.split('\n').map((line, index) => {
    if (line.startsWith('# ')) {
      return <h1 key={index} className="mt-8 text-4xl font-bold text-white">{line.slice(2)}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="mt-8 text-2xl font-bold text-white">{line.slice(3)}</h2>;
    }
    if (!line.trim()) {
      return <div key={index} className="h-3" />;
    }
    return <p key={index}>{line}</p>;
  });
}

export function BlogPostPage() {
  const { slug = '' } = useParams();
  const fallback = useMemo(() => fallbackPosts.find((post) => post.slug === slug) ?? fallbackPosts[0], [slug]);
  const [post, setPost] = useState<PostDetail>(fallback);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('Comments are moderated before publication.');

  useEffect(() => {
    let active = true;
    apiGet<{ post: PostDetail }>(`/api/posts/${slug}`)
      .then((result) => {
        if (active && result.ok) setPost(result.data.post);
      })
      .catch(() => undefined);
    void apiSend('/api/page-view', { path: `/blog/${slug}`, post_slug: slug }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [slug]);

  const submitComment = async () => {
    const result = await apiSend('/api/comments', {
      post_id: post.id,
      author_name: 'Visitor',
      body: comment
    });
    setMessage(result.ok ? 'Comment queued for moderation.' : result.error.message);
    if (result.ok) setComment('');
  };

  const react = async () => {
    const result = await apiSend('/api/reactions', { post_id: post.id, kind: 'spark' });
    setMessage(result.ok ? 'Reaction recorded.' : result.error.message);
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-sm uppercase tracking-[0.22em] text-signal">{post.status}</p>
      <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">{post.title}</h1>
      <p className="mt-5 text-lg leading-8 text-paper/70">{post.excerpt}</p>
      <div className="prose-lite mt-10 rounded-md border border-white/10 bg-white/[0.045] p-6 sm:p-8">{renderMarkdown(post.content)}</div>
      <section className="mt-8 rounded-md border border-white/10 bg-white/[0.045] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Reactions and comments</h2>
            <p className="mt-1 text-sm text-paper/60">{message}</p>
          </div>
          <button type="button" onClick={react} className="inline-flex items-center justify-center gap-2 rounded-md border border-signal/35 px-4 py-2 text-signal hover:bg-signal/10">
            <Sparkles size={16} aria-hidden="true" />
            Spark
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="min-h-24 rounded-md border border-white/10 bg-ink/70 p-3 text-sm text-white outline-none focus:border-signal"
            placeholder="Add a thoughtful note"
          />
          <button type="button" onClick={submitComment} className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-2 font-semibold text-ink hover:bg-white">
            <Send size={16} aria-hidden="true" />
            Send
          </button>
        </div>
      </section>
    </article>
  );
}
