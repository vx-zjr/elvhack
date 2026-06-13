export function AboutPage() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-signal">About</p>
        <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">A personal site with a systems spine.</h1>
      </div>
      <div className="prose-lite rounded-md border border-white/10 bg-white/[0.045] p-6">
        <p>
          `elvhack` is designed as a living technical notebook: public enough to publish, opinionated enough to feel personal, and engineered enough to show how the pieces fit.
        </p>
        <p>
          The rebuild uses Cloudflare as the deployment and API edge, Supabase as the durable backend, and a document-driven workflow to keep fast iteration from turning into architectural drift.
        </p>
      </div>
    </section>
  );
}
