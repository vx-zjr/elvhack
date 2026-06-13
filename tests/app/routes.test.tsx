import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('public route shell', () => {
  it('renders the elvhack immersive homepage as the first viewport', () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /^elvhack$/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /enter blog/i })).toHaveAttribute('href', '/blog');
  });

  it('renders the admin route with a GitHub login gate', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /cms gate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();
  });

  it('uses live post data on the homepage when the edge API is available', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            posts: [
              {
                id: '10000000-0000-4000-8000-000000000001',
                title: 'Live Supabase Dispatch',
                slug: 'live-supabase-dispatch',
                excerpt: 'This headline came from the live edge API.',
                status: 'published',
                cover_image_url: null,
                published_at: '2026-06-13T00:00:00.000Z',
                updated_at: '2026-06-13T00:00:00.000Z'
              }
            ]
          }
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Live Supabase Dispatch')).toBeInTheDocument();
    expect(screen.getByText('This headline came from the live edge API.')).toBeInTheDocument();
  });

  it('renders approved comments and like controls on article detail pages', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/interactions?')) {
        return new Response(
          JSON.stringify({
            ok: true,
            data: {
              comments: [{ id: 'comment-1', author_name: 'Anonymous', body: 'Edge notes landed cleanly.', created_at: '2026-06-13T00:00:00.000Z' }],
              reactions: { like: 7 }
            }
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify({ ok: false, error: { code: 'OFFLINE', message: 'offline' } }), { status: 500, headers: { 'content-type': 'application/json' } });
    });

    render(
      <MemoryRouter initialEntries={['/blog/building-elvhack-on-the-edge']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Edge notes landed cleanly.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /like 7/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/add an anonymous note/i)).toBeInTheDocument();
  });

  it('renders anonymous project comments and likes in the lab', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/interactions?target_type=project&target_slug=edge-bff')) {
        return new Response(
          JSON.stringify({
            ok: true,
            data: {
              comments: [{ id: 'project-comment-1', author_name: 'Anonymous', body: 'The edge BFF is the right boundary.', created_at: '2026-06-13T00:00:00.000Z' }],
              reactions: { like: 3 }
            }
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify({ ok: true, data: { comments: [], reactions: { like: 0 } } }), { status: 200, headers: { 'content-type': 'application/json' } });
    });

    render(
      <MemoryRouter initialEntries={['/lab']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('The edge BFF is the right boundary.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /like 3/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/comment on edge bff/i)).toBeInTheDocument();
  });
});
