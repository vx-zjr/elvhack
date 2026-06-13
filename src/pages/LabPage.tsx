import { Cpu, Database, Gauge, Wand2 } from 'lucide-react';

const experiments = [
  { title: 'Edge BFF', body: 'Cloudflare Pages Functions isolate privileged Supabase writes behind normalized JSON APIs.', icon: Cpu },
  { title: 'Visual runtime', body: 'Canvas-driven first viewport proves motion without turning the whole site into a heavy WebGL dependency.', icon: Wand2 },
  { title: 'Content plane', body: 'Supabase stores drafts, published posts, comments, reactions, and audit events.', icon: Database },
  { title: 'Budget discipline', body: 'The site avoids SSR and expensive transforms inside Functions to protect request CPU time.', icon: Gauge }
];

export function LabPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-sm uppercase text-ember">Experiments</p>
      <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">Lab</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {experiments.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-md border border-white/10 bg-white/[0.045] p-6">
              <Icon className="text-signal" size={24} aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 leading-7 text-paper/68">{item.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
