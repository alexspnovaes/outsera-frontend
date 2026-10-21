import type {
  Movie,
  MoviePage,
  ProducerIntervals,
  StudioWithWinCount,
  WinnerFilter,
  YearWithMultipleWinners,
} from './types';

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/movies').replace(/\/$/, '');

async function request<T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const query = new URLSearchParams(params);
  const response = await fetch(`${baseUrl}${path}${query.size ? `?${query.toString()}` : ''}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Não foi possível consultar os dados (HTTP ${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export const moviesApi = {
  list(page: number, year: string, winner: WinnerFilter, signal?: AbortSignal) {
    const params: Record<string, string> = { page: String(page), size: '15' };
    if (year) params.year = year;
    if (winner) params.winner = winner;
    return request<MoviePage>('', params, signal);
  },
  years(signal?: AbortSignal) {
    return request<{ years: YearWithMultipleWinners[] }>('/yearsWithMultipleWinners', {}, signal);
  },
  studios(signal?: AbortSignal) {
    return request<{ studios: StudioWithWinCount[] }>('/studiosWithWinCount', {}, signal);
  },
  intervals(signal?: AbortSignal) {
    return request<ProducerIntervals>('/maxMinWinIntervalForProducers', {}, signal);
  },
  async winners(year: string, signal?: AbortSignal): Promise<Movie[]> {
    const result = await request<Movie[] | Movie>('/winnersByYear', { year }, signal);
    return Array.isArray(result) ? result : result ? [result] : [];
  },
};
