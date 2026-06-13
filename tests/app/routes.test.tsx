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
});
