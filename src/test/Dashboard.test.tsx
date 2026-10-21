import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moviesApi } from '../api';
import { Dashboard } from '../screens/Dashboard';
import { intervalData, movie, studioData, yearData } from './fixtures';

vi.mock('../api', () => ({
  moviesApi: { years: vi.fn(), studios: vi.fn(), intervals: vi.fn(), winners: vi.fn() },
}));

beforeEach(() => {
  vi.mocked(moviesApi.years).mockResolvedValue(yearData);
  vi.mocked(moviesApi.studios).mockResolvedValue(studioData);
  vi.mocked(moviesApi.intervals).mockResolvedValue(intervalData);
  vi.mocked(moviesApi.winners).mockResolvedValue([]);
});

describe('dashboard', () => {
  it('mostra anos, os três primeiros estúdios em ordem e todos os empates de produtores', async () => {
    render(<Dashboard />);
    expect(
      await within(
        screen.getByRole('region', { name: 'Anos com múltiplos vencedores' }),
      ).findByText('1990', { selector: 'td' }),
    ).toBeInTheDocument();
    const studios = screen.getByRole('region', { name: 'Estúdios com mais vitórias' });
    const rows = within(studios).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(rows[1]).toHaveTextContent('Primeiro estúdio');
    expect(rows[2]).toHaveTextContent('Segundo estúdio');
    expect(rows[3]).toHaveTextContent('Terceiro estúdio');
    expect(screen.queryByText('Quarto estúdio')).not.toBeInTheDocument();
    for (const producer of ['Produtor A', 'Produtor B', 'Produtor C', 'Produtor D']) {
      expect(await screen.findByText(producer)).toBeInTheDocument();
    }
  });

  it('valida o ano antes da busca e mostra múltiplos vencedores', async () => {
    const user = userEvent.setup();
    vi.mocked(moviesApi.winners).mockResolvedValue([
      movie(1, 'Vencedor A', true),
      movie(2, 'Vencedor B', true),
    ]);
    render(<Dashboard />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('quatro dígitos');
    expect(moviesApi.winners).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Ano da premiação'), '1990');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText('Vencedor A')).toBeInTheDocument();
    expect(screen.getByText('Vencedor B')).toBeInTheDocument();
    expect(moviesApi.winners).toHaveBeenCalledWith('1990', expect.any(AbortSignal));
  });

  it('preserva intervalos zero repetidos para filmes diferentes no mesmo ano', async () => {
    const sameYear = {
      producer: 'Produtor com três filmes',
      interval: 0,
      previousWin: 1990,
      followingWin: 1990,
    };
    vi.mocked(moviesApi.intervals).mockResolvedValue({ min: [sameYear, sameYear], max: [] });
    const consoleError = vi.spyOn(console, 'error');
    render(<Dashboard />);
    expect(await screen.findAllByText('Produtor com três filmes')).toHaveLength(2);
    expect(screen.getAllByText('0 anos')).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('mostra ausência de vencedores para o ano pesquisado', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.type(screen.getByLabelText('Ano da premiação'), '1999');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText('Nenhum vencedor encontrado em 1999.')).toBeInTheDocument();
  });

  it.each([
    ['years', 'Anos com múltiplos vencedores'],
    ['studios', 'Estúdios com mais vitórias'],
    ['intervals', 'Intervalos entre vitórias'],
  ] as const)('permite repetir falha isolada no painel %s', async (method, name) => {
    vi.mocked(moviesApi[method]).mockRejectedValueOnce(new Error('Serviço indisponível'));
    const user = userEvent.setup();
    render(<Dashboard />);
    const panel = screen.getByRole('region', { name });
    expect(await within(panel).findByRole('alert')).toHaveTextContent('Serviço indisponível');
    await user.click(within(panel).getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(within(panel).queryByRole('alert')).not.toBeInTheDocument());
    expect(moviesApi[method]).toHaveBeenCalledTimes(2);
  });

  it('informa quando os três painéis não possuem registros', async () => {
    vi.mocked(moviesApi.years).mockResolvedValue({ years: [] });
    vi.mocked(moviesApi.studios).mockResolvedValue({ studios: [] });
    vi.mocked(moviesApi.intervals).mockResolvedValue({ min: [], max: [] });
    render(<Dashboard />);
    expect(await screen.findByText('Nenhum ano teve múltiplos vencedores.')).toBeInTheDocument();
    expect(screen.getByText('Nenhum estúdio com vitórias encontrado.')).toBeInTheDocument();
    expect(screen.getByText('Nenhum produtor com duas vitórias encontrado.')).toBeInTheDocument();
  });

  it('exibe carregamento e permite repetir uma busca anual que falhou', async () => {
    const user = userEvent.setup();
    vi.mocked(moviesApi.winners).mockRejectedValueOnce(new Error('Falha ao consultar ano'));
    render(<Dashboard />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    await user.type(screen.getByLabelText('Ano da premiação'), '1990');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao consultar ano');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Nenhum vencedor encontrado em 1990.')).toBeInTheDocument();
  });
});
