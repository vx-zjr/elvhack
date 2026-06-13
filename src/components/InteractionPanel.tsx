import { Heart, MessageSquare, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiSend, type InteractionSummary, type PublicComment } from '../lib/api';
import { getAnonymousId } from '../lib/anonymous';

type TargetType = 'post' | 'project';

interface InteractionPanelProps {
  compact?: boolean;
  label: string;
  targetSlug: string;
  targetType: TargetType;
}

const emptySummary: InteractionSummary = {
  comments: [],
  reactions: { like: 0 }
};

function commentKey(comment: PublicComment) {
  return `${comment.id}-${comment.created_at}`;
}

export function InteractionPanel({ compact = false, label, targetSlug, targetType }: InteractionPanelProps) {
  const [summary, setSummary] = useState<InteractionSummary>(emptySummary);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('Anonymous comments are moderated before publication.');

  const query = useMemo(() => `/api/interactions?target_type=${targetType}&target_slug=${encodeURIComponent(targetSlug)}`, [targetSlug, targetType]);

  useEffect(() => {
    let active = true;
    apiGet<InteractionSummary>(query)
      .then((result) => {
        if (!active) return;
        if (result.ok) {
          setSummary(result.data);
          setMessage('Anonymous comments are moderated before publication.');
        } else {
          setMessage('Interactions are offline for the moment.');
        }
      })
      .catch(() => {
        if (active) setMessage('Interactions are offline for the moment.');
      });
    return () => {
      active = false;
    };
  }, [query]);

  const like = async () => {
    const result = await apiSend<{ recorded: boolean }>('/api/reactions', {
      target_type: targetType,
      target_slug: targetSlug,
      anonymous_id: getAnonymousId(),
      kind: 'like'
    });
    if (result.ok) {
      setSummary((current) => ({
        ...current,
        reactions: { like: result.data.recorded ? current.reactions.like + 1 : current.reactions.like }
      }));
      setMessage(result.data.recorded ? 'Like recorded.' : 'You already liked this.');
    } else {
      setMessage(result.error.message);
    }
  };

  const submitComment = async () => {
    const result = await apiSend('/api/comments', {
      target_type: targetType,
      target_slug: targetSlug,
      author_name: 'Anonymous',
      body: comment
    });
    setMessage(result.ok ? 'Comment queued for moderation.' : result.error.message);
    if (result.ok) setComment('');
  };

  return (
    <section className={compact ? 'mt-5 border-t border-white/10 pt-5' : 'mt-8 rounded-md border border-white/10 bg-white/[0.045] p-5'}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className={compact ? 'text-base font-semibold text-white' : 'text-xl font-semibold text-white'}>{label}</h2>
          <p className="mt-1 text-sm text-paper/60">{message}</p>
        </div>
        <button type="button" onClick={like} className="inline-flex items-center justify-center gap-2 rounded-md border border-signal/35 px-4 py-2 text-signal hover:bg-signal/10">
          <Heart size={16} aria-hidden="true" />
          Like {summary.reactions.like}
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="min-h-24 rounded-md border border-white/10 bg-ink/70 p-3 text-sm text-white outline-none focus:border-signal"
          placeholder={`Add an anonymous note${compact ? ` / comment on ${label.toLowerCase()}` : ''}`}
        />
        <button type="button" onClick={submitComment} className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-2 font-semibold text-ink hover:bg-white">
          <Send size={16} aria-hidden="true" />
          Send
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {summary.comments.length > 0 ? (
          summary.comments.map((item) => (
            <article key={commentKey(item)} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center gap-2 text-xs text-paper/50">
                <MessageSquare size={14} aria-hidden="true" />
                <span>{item.author_name}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-paper/78">{item.body}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-paper/46">No approved comments yet.</p>
        )}
      </div>
    </section>
  );
}
