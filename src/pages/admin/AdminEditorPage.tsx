import { Eye, Save, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiSend } from '../../lib/api';
import { fallbackPosts } from '../../data/fallback';
import { getAccessToken } from '../../lib/supabase';

export function AdminEditorPage() {
  const { id = '' } = useParams();
  const initial = fallbackPosts.find((post) => post.id === id) ?? fallbackPosts[0];
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [content, setContent] = useState(initial.content);
  const [message, setMessage] = useState('Editor is ready.');

  const save = async () => {
    const token = await getAccessToken();
    const result = await apiSend(`/api/admin/posts/${id}`, { title, excerpt, content }, token ?? undefined, 'PATCH');
    setMessage(result.ok ? 'Draft saved.' : result.error.message);
  };

  const publish = async () => {
    const token = await getAccessToken();
    const result = await apiSend(`/api/admin/posts/${id}/publish`, { publish: true }, token ?? undefined);
    setMessage(result.ok ? 'Post published.' : result.error.message);
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <div className="rounded-md border border-white/10 bg-white/[0.045] p-5">
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-ember">Editor</p>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-4 w-full rounded-md border border-white/10 bg-ink/70 p-3 text-2xl font-bold text-white outline-none focus:border-signal" />
        <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} className="mt-3 min-h-24 w-full rounded-md border border-white/10 bg-ink/70 p-3 text-sm text-white outline-none focus:border-signal" />
        <textarea value={content} onChange={(event) => setContent(event.target.value)} className="mt-3 min-h-[28rem] w-full rounded-md border border-white/10 bg-ink/70 p-3 font-mono text-sm text-white outline-none focus:border-signal" />
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2 font-semibold text-ink hover:bg-white">
            <Save size={16} aria-hidden="true" />
            Save
          </button>
          <button type="button" onClick={publish} className="inline-flex items-center gap-2 rounded-md border border-ember/40 px-4 py-2 font-semibold text-ember hover:bg-ember/10">
            <UploadCloud size={16} aria-hidden="true" />
            Publish
          </button>
        </div>
        <p className="mt-4 text-sm text-paper/60">{message}</p>
      </div>
      <aside className="rounded-md border border-white/10 bg-paper p-5 text-ink">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-ember">
          <Eye size={16} aria-hidden="true" />
          Preview
        </div>
        <h2 className="mt-5 text-3xl font-bold">{title}</h2>
        <p className="mt-4 leading-7 text-ink/70">{excerpt}</p>
        <pre className="mt-5 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md bg-ink p-4 text-sm text-paper">{content}</pre>
      </aside>
    </section>
  );
}
