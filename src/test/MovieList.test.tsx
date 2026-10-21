import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moviesApi } from '../api';
import { MovieList } from '../screens/MovieList';
import { moviePage } from './fixtures';

vi.mock('../api', () => ({ moviesApi: { list: vi.fn() } }));

beforeEach(() => {
  vi.mocked(moviesApi.list).mockImplementation(async (page) => moviePage(page));
});

describe('lista de filmes', () => {
  it('pagina e bloqueia voltar na primeira página', async () => {
    const user = userEvent.setup();
    render(<MovieList />);
    expect(await screen.findByText('Filme 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(await screen.findByText('Filme 16')).toBeInTheDocument();
    expect(screen.getByText('16–30 de 31 filmes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(await screen.findByText('Filme 31')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(await screen.findByText('Filme 16')).toBeInTheDocument();
  });

  it('reinicia a página ao filtrar por ano e vencedor e ao limpar filtros', async () => {
    const user = userEvent.setup();
    render(<MovieList />);
    await screen.findByText('Filme 1');
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    await screen.findByText('Filme 16');
    await user.type(screen.getByLabelText('Filtrar por ano'), '1990');
    await waitFor(() =>
      expect(moviesApi.list).toHaveBeenLastCalledWith(0, '1990', '', expect.any(AbortSignal)),
    );
    await screen.findByText('Filme 1');
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    await screen.findByText('Filme 16');
    await user.selectOptions(screen.getByLabelText('Vencedor?'), 'true');
    await waitFor(() =>
      expect(moviesApi.list).toHaveBeenLastCalledWith(0, '1990', 'true', expect.any(AbortSignal)),
    );
    await user.selectOptions(screen.getByLabelText('Vencedor?'), 'false');
    await waitFor(() =>
      expect(moviesApi.list).toHaveBeenLastCalledWith(0, '1990', 'false', expect.any(AbortSignal)),
    );
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    await waitFor(() =>
      expect(moviesApi.list).toHaveBeenLastCalledWith(0, '', '', expect.any(AbortSignal)),
    );
    expect(screen.getByLabelText('Filtrar por ano')).toHaveValue('');
    expect(screen.getByLabelText('Vencedor?')).toHaveValue('');
  });

  it('não envia ano incompleto à API', async () => {
    const user = userEvent.setup();
    render(<MovieList />);
    await screen.findByText('Filme 1');
    await user.type(screen.getByLabelText('Filtrar por ano'), '199');
    expect(screen.getByRole('alert')).toHaveTextContent('quatro dígitos');
    expect(moviesApi.list).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });

  it('mostra estado vazio', async () => {
    vi.mocked(moviesApi.list).mockResolvedValue({
      ...moviePage(),
      content: [],
      totalElements: 0,
      totalPages: 0,
    });
    render(<MovieList />);
    expect(
      await screen.findByText('Nenhum filme encontrado com esses filtros.'),
    ).toBeInTheDocument();
    expect(screen.getByText('0–0 de 0 filmes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });

  it('mostra erro e recupera a lista ao repetir', async () => {
    const user = userEvent.setup();
    vi.mocked(moviesApi.list).mockRejectedValueOnce(new Error('Conexão indisponível'));
    render(<MovieList />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Conexão indisponível');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Filme 1')).toBeInTheDocument();
  });
});
