import { Menu, PenTool, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/blog', label: 'Blog' },
  { to: '/lab', label: 'Lab' },
  { to: '/about', label: 'About' },
  { to: '/admin', label: 'CMS' }
];

function linkClass({ isActive }: { isActive: boolean }) {
  return `rounded-md px-3 py-2 text-sm transition ${isActive ? 'bg-white/12 text-white' : 'text-paper/70 hover:bg-white/8 hover:text-white'}`;
}

export function SiteLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen text-paper">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-ink/82 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-[0.14em] text-white">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-signal/40 bg-signal/12 text-signal">
              <PenTool size={18} aria-hidden="true" />
            </span>
            ELVHACK
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
          <Link to="/admin" className="hidden items-center gap-2 rounded-md border border-ember/35 px-3 py-2 text-sm text-ember transition hover:bg-ember/12 md:flex">
            <ShieldCheck size={16} aria-hidden="true" />
            Admin
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/8 text-white md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </nav>
        {open ? (
          <div className="border-t border-white/10 bg-ink px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}
      </header>
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
