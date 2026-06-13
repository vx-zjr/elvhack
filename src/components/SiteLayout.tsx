import { Menu, Moon, PenTool, ShieldCheck, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { SmokeBackground } from './SmokeBackground';

const links = [
  { to: '/blog', label: 'Blog' },
  { to: '/lab', label: 'Lab' },
  { to: '/about', label: 'About' },
  { to: '/admin', label: 'CMS' }
];

function linkClass({ isActive }: { isActive: boolean }) {
  return `rounded-md px-3 py-2 text-sm transition ${isActive ? 'bg-white/12 text-white light:bg-ink/10 light:text-ink' : 'text-paper/70 hover:bg-white/8 hover:text-white light:text-ink/70 light:hover:bg-ink/8 light:hover:text-ink'}`;
}

export function SiteLayout() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('elvhack.theme') === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('elvhack.theme', theme);
  }, [theme]);

  const light = theme === 'light';

  return (
    <div data-testid="site-shell" data-theme={theme} className="min-h-screen text-paper transition-colors duration-300 light:text-ink">
      <SmokeBackground theme={theme} />
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-ink/82 backdrop-blur-xl light:border-ink/10 light:bg-paper/82">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold text-white light:text-ink">
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
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/8 text-white transition hover:bg-white/10 light:border-ink/10 light:bg-ink/5 light:text-ink light:hover:bg-ink/10"
              onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
              aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
              title={light ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {light ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
            </button>
            <Link to="/admin" className="hidden items-center gap-2 rounded-md border border-ember/35 px-3 py-2 text-sm text-ember transition hover:bg-ember/12 md:flex">
              <ShieldCheck size={16} aria-hidden="true" />
              Admin
            </Link>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/8 text-white md:hidden light:border-ink/10 light:bg-ink/5 light:text-ink"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </nav>
        {open ? (
          <div className="border-t border-white/10 bg-ink px-4 py-3 md:hidden light:border-ink/10 light:bg-paper">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
                  {link.label}
                </NavLink>
              ))}
              <button
                type="button"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm text-white light:border-ink/10 light:bg-ink/5 light:text-ink"
                onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
                aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {light ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
                {light ? 'Dark mode' : 'Light mode'}
              </button>
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
