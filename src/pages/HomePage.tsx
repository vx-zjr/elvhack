import { ArrowRight, Blocks, RadioTower, TerminalSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImmersiveField } from '../components/ImmersiveField';

const signals = [
  { label: 'Edge CMS', value: 'Cloudflare Pages Functions', icon: RadioTower },
  { label: 'Runtime', value: 'V8, fetch, Web Crypto', icon: TerminalSquare },
  { label: 'Data plane', value: 'Supabase + GitHub Auth', icon: Blocks }
];

export function HomePage() {
  return (
    <div>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <ImmersiveField />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,19,26,0.95),rgba(16,19,26,0.58),rgba(16,19,26,0.86))]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="font-mono text-sm uppercase tracking-[0.28em] text-signal">Personal edge lab / dynamic blog</p>
            <h1 className="mt-5 text-6xl font-black leading-none text-white sm:text-7xl lg:text-8xl">elvhack</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/76 sm:text-xl">
              A visual-first personal site for edge-native notes, experiments, and a compact CMS built on Cloudflare Pages Functions and Supabase.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/blog" className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 font-semibold text-ink transition hover:bg-white">
                Enter blog
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/lab" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/18 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
                View lab
              </Link>
            </div>
          </div>
          <div className="mt-16 grid gap-3 md:grid-cols-3">
            {signals.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-md border border-white/10 bg-white/[0.055] p-4 backdrop-blur-md">
                  <Icon className="text-ember" size={20} aria-hidden="true" />
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-paper/48">{item.label}</p>
                  <p className="mt-2 text-sm text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="border-t border-white/10 bg-paper py-16 text-ink">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.22em] text-ember">What this is</p>
            <h2 className="mt-3 text-3xl font-bold">A publishing system disguised as a personal signal board.</h2>
          </div>
          <p className="text-lg leading-8 text-ink/72">
            The first version favors a striking public surface, durable writing flows, and bounded edge APIs. It leaves the door open for experiments without letting the CMS become a sprawling product.
          </p>
        </div>
      </section>
    </div>
  );
}
