import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { InteractionPanel } from '../components/InteractionPanel';
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

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-sm uppercase text-signal">{post.status}</p>
      <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">{post.title}</h1>
      <p className="mt-5 text-lg leading-8 text-paper/70">{post.excerpt}</p>
      <div className="prose-lite mt-10 rounded-md border border-white/10 bg-white/[0.045] p-6 sm:p-8">{renderMarkdown(post.content)}</div>
      <InteractionPanel label="Anonymous discussion" targetSlug={post.slug} targetType="post" />
    </article>
  );
}
