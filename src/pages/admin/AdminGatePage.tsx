import { GitBranch, KeyRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { getAccessToken, isSupabaseConfigured, signInWithGitHub } from '../../lib/supabase';

export function AdminGatePage() {
  const [status, setStatus] = useState(isSupabaseConfigured ? 'Checking session...' : 'Supabase env vars are not configured yet.');
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    getAccessToken().then(async (token) => {
      if (!active || !token) {
        if (active && isSupabaseConfigured) setStatus('Sign in with GitHub to continue.');
        return;
      }
      const result = await apiGet<{ githubUsername: string }>('/api/admin/me', token);
      if (!active) return;
      if (result.ok) {
        setAllowed(true);
        setStatus(`Authorized as ${result.data.githubUsername}`);
      } else {
        setStatus(result.error.message);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-md border border-white/10 bg-white/[0.055] p-6 sm:p-8">
        <KeyRound className="text-ember" size={28} aria-hidden="true" />
        <h1 className="mt-5 text-4xl font-bold text-white">CMS Gate</h1>
        <p className="mt-4 text-paper/68">{status}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void signInWithGitHub()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 font-semibold text-ink hover:bg-signal"
          >
            <GitBranch size={18} aria-hidden="true" />
            Continue with GitHub
          </button>
          <Link to="/admin/posts" className={`inline-flex items-center justify-center rounded-md border px-4 py-3 font-semibold ${allowed ? 'border-signal/40 text-signal' : 'pointer-events-none border-white/10 text-paper/35'}`}>
            Open posts
          </Link>
        </div>
      </div>
    </section>
  );
}
