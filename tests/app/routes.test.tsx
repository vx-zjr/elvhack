import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';

describe('public route shell', () => {
  it('renders the elvhack immersive homepage as the first viewport', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /elvhack/i })).toBeInTheDocument();
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
});
