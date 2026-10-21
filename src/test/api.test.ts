import { describe, expect, it, vi } from 'vitest';
import { moviesApi } from '../api';
import { movie, moviePage } from './fixtures';

describe('cliente HTTP', () => {
  it('envia paginação, filtros e sinal de cancelamento', async () => {
    const controller = new AbortController();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(moviePage())));
    await moviesApi.list(2, '1990', 'false', controller.signal);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/movies?page=2&size=15&year=1990&winner=false',
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it('omite filtros não informados', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(moviePage())));
    await moviesApi.list(0, '', '');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/movies?page=0&size=15');
  });

  it.each([
    ['years', 'yearsWithMultipleWinners'],
    ['studios', 'studiosWithWinCount'],
    ['intervals', 'maxMinWinIntervalForProducers'],
  ] as const)('usa o endpoint documentado de %s', async (method, endpoint) => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
    await moviesApi[method]();
    expect(fetchMock.mock.calls[0][0]).toBe(`/api/movies/${endpoint}`);
  });

  it('preserva todos os vencedores e aceita uma resposta individual', async () => {
    const winners = [movie(1, 'Vencedor A', true), movie(2, 'Vencedor B', true)];
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(winners)))
      .mockResolvedValueOnce(new Response(JSON.stringify(winners[0])));
    expect(await moviesApi.winners('1990')).toEqual(winners);
    expect(await moviesApi.winners('1990')).toEqual([winners[0]]);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/movies/winnersByYear?year=1990');
  });

  it('converte falha HTTP em mensagem compreensível', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }));
    await expect(moviesApi.list(0, '', '')).rejects.toThrow('HTTP 503');
  });
});
