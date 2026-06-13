import { ArrowRight, Blocks, Braces, DatabaseZap, Orbit, RadioTower, Sparkles, TerminalSquare, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fallbackSummaries } from '../data/fallback';
import { apiGet, type PostSummary } from '../lib/api';

const signals = [
  { label: 'Edge CMS', value: 'Cloudflare Pages Functions', icon: RadioTower, tone: 'text-signal' },
  { label: 'Runtime', value: 'V8, fetch, Web Crypto', icon: TerminalSquare, tone: 'text-ember' },
  { label: 'Data plane', value: 'Supabase + GitHub Auth', icon: Blocks, tone: 'text-[#ffd166]' }
];

const labNotes = [
  'Cloudflare Pages routes the SPA and privileged BFF calls from the same domain.',
  'Supabase content flows through Edge Functions before it reaches public UI.',
  'Every iteration starts and ends in project memory docs to avoid drift.'
];

export function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState<PostSummary[]>(fallbackSummaries);
  const [feedState, setFeedState] = useState('Fallback feed ready');

  useEffect(() => {
    let active = true;
    apiGet<{ posts: PostSummary[] }>('/api/posts')
      .then((result) => {
        if (!active) return;
        if (result.ok && result.data.posts.length > 0) {
          setFeaturedPosts(result.data.posts.slice(0, 3));
          setFeedState('Supabase feed live');
        } else if (!result.ok) {
          setFeedState('Fallback feed active');
        }
      })
      .catch(() => {
        if (active) setFeedState('Fallback feed active');
      });
    return () => {
      active = false;
    };
  }, []);

  const leadPost = featuredPosts[0];

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(16,19,26,0.88),rgba(16,19,26,0.54)_46%,rgba(29,29,20,0.8))] light:bg-[linear-gradient(105deg,rgba(247,245,239,0.82),rgba(238,247,245,0.52)_46%,rgba(255,244,236,0.78))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="max-w-4xl pt-10 lg:pt-0">
            <div className="inline-flex items-center gap-3 rounded-md border border-white/12 bg-white/[0.06] px-3 py-2 font-mono text-xs uppercase text-signal backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_18px_rgba(79,209,197,0.9)]" />
              Personal edge lab / dynamic blog
            </div>
            <h1 className="mt-6 max-w-4xl text-6xl font-black leading-[0.88] text-white light:text-ink sm:text-8xl lg:text-[8.4rem]">elvhack</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-paper/78 light:text-ink/72 sm:text-xl">
              A kinetic personal homepage for edge-native writing, experiments, and a compact CMS wired through Cloudflare Pages Functions and Supabase.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/blog" className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 font-semibold text-ink transition hover:bg-white">
                Enter blog
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/lab" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/18 bg-white/[0.04] px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                View lab
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl overflow-hidden rounded-md border border-white/10 bg-white/[0.045] backdrop-blur-md sm:grid-cols-3">
              {[
                ['domain', 'elvhack.com'],
                ['deploy', 'Pages'],
                ['feed', feedState]
              ].map(([label, value]) => (
                <div key={label} className="border-b border-white/10 p-3 last:border-b-0 sm:border-r sm:border-b-0 sm:p-4 sm:last:border-r-0">
                  <p className="font-mono text-[10px] uppercase text-paper/42">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative pb-10 lg:pb-0">
            <div className="absolute -left-10 top-8 hidden h-24 w-24 rotate-12 border border-signal/30 lg:block" />
            <div className="rounded-md border border-white/12 bg-ink/68 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl light:border-ink/10 light:bg-paper/72 light:shadow-ink/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 font-mono text-xs uppercase text-paper/54 light:text-ink/54">
                  <Orbit size={16} className="text-signal" aria-hidden="true" />
                  Signal board
                </div>
                <span className="rounded border border-signal/30 px-2 py-1 font-mono text-[10px] uppercase text-signal">Live edge</span>
              </div>
              <Link to={`/blog/${leadPost.slug}`} className="group mt-5 block rounded-md border border-white/10 bg-white/[0.055] p-5 transition hover:border-signal/45 hover:bg-white/[0.08] light:border-ink/10 light:bg-white/70 light:hover:bg-white">
                <p className="font-mono text-xs uppercase text-ember">Latest dispatch</p>
                <h2 className="mt-4 text-3xl font-bold leading-tight text-white group-hover:text-signal light:text-ink">{leadPost.title}</h2>
                <p className="mt-4 leading-7 text-paper/68 light:text-ink/68">{leadPost.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-signal">
                  Read signal
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {featuredPosts.slice(1, 3).map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="rounded-md border border-white/10 bg-white/[0.04] p-4 transition hover:border-ember/45 hover:bg-white/[0.07] light:border-ink/10 light:bg-white/60 light:hover:bg-white">
                    <p className="font-mono text-[10px] uppercase text-paper/42 light:text-ink/42">Archive node</p>
                    <h3 className="mt-3 text-base font-semibold leading-snug text-white light:text-ink">{post.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {signals.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-md border border-white/10 bg-white/[0.055] p-3 backdrop-blur-md">
                    <Icon className={item.tone} size={18} aria-hidden="true" />
                    <p className="mt-3 text-[10px] uppercase text-paper/42">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-ink py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {labNotes.map((note, index) => (
            <div key={note} className="rounded-md border border-white/10 bg-white/[0.045] p-5">
              <p className="font-mono text-xs uppercase text-signal">0{index + 1} / system note</p>
              <p className="mt-4 leading-7 text-paper/70">{note}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="border-y border-white/10 bg-paper py-16 text-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="max-w-xl">
            <p className="font-mono text-sm uppercase text-ember">What this is</p>
            <h2 className="mt-3 text-4xl font-black leading-tight">A publishing system disguised as a personal signal board.</h2>
            <p className="mt-5 text-lg leading-8 text-ink/70">
              The homepage is the public control surface: enough motion to feel alive, enough structure to route readers into writing, experiments, and the CMS-backed archive.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
              <Braces className="text-ember" size={24} aria-hidden="true" />
              <h3 className="mt-5 text-xl font-bold">Readable by default</h3>
              <p className="mt-3 leading-7 text-ink/68">Writing remains the destination. Motion frames the work; it does not bury it.</p>
            </div>
            <div className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
              <DatabaseZap className="text-signal" size={24} aria-hidden="true" />
              <h3 className="mt-5 text-xl font-bold">Supabase ready</h3>
              <p className="mt-3 leading-7 text-ink/68">The feed now prefers live `/api/posts` data and keeps local fallback for empty or offline states.</p>
            </div>
            <div className="rounded-md border border-ink/10 bg-ink p-5 text-paper shadow-sm sm:col-span-2">
              <Sparkles className="text-[#ffd166]" size={24} aria-hidden="true" />
              <h3 className="mt-5 text-xl font-bold text-white">Designed to keep shipping</h3>
              <p className="mt-3 leading-7 text-paper/68">Cloudflare Pages handles the edge, Supabase handles durable content, and project memory docs keep fast iteration honest.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-ink px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-md border border-white/10 bg-white/[0.045] p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-xs uppercase text-ember">Next action</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Open the latest writing or jump into the lab.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/blog" className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 font-semibold text-ink hover:bg-signal">
              Blog archive
              <Zap size={16} aria-hidden="true" />
            </Link>
            <Link to="/admin" className="inline-flex items-center justify-center rounded-md border border-white/14 px-4 py-3 font-semibold text-white hover:bg-white/10">
              CMS gate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
