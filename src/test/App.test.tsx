import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { moviesApi } from '../api';
import { intervalData, moviePage, studioData, yearData } from './fixtures';

vi.mock('../api', () => ({
  moviesApi: {
    years: vi.fn(),
    studios: vi.fn(),
    intervals: vi.fn(),
    winners: vi.fn(),
    list: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(moviesApi.years).mockResolvedValue(yearData);
  vi.mocked(moviesApi.studios).mockResolvedValue(studioData);
  vi.mocked(moviesApi.intervals).mockResolvedValue(intervalData);
  vi.mocked(moviesApi.list).mockResolvedValue(moviePage());
});

describe('navegação', () => {
  it('alterna pelo menu e acompanha retorno do histórico', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Visão geral' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Lista de filmes' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Lista de filmes' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lista de filmes' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    window.history.back();
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Visão geral' })).toBeInTheDocument(),
    );
  });

  it('abre link direto da lista e reage a hashchange', async () => {
    window.history.replaceState(null, '', '#movies');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Lista de filmes' })).toBeInTheDocument();
    window.history.replaceState(null, '', '#dashboard');
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Visão geral' }),
    ).toBeInTheDocument();
  });
});
