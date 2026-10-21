import { useCallback, useState } from 'react';
import { moviesApi } from '../api';
import { DataState } from '../components/DataState';
import { MovieTable } from '../components/MovieTable';
import { useResource } from '../hooks/useResource';
import type { WinnerFilter } from '../types';

export function MovieList() {
  const [page, setPage] = useState(0);
  const [year, setYear] = useState('');
  const [winner, setWinner] = useState<WinnerFilter>('');
  const validYear = !year || /^[1-9]\d{3}$/.test(year);
  const loadMovies = useCallback(
    (signal: AbortSignal) => moviesApi.list(page, year, winner, signal),
    [page, year, winner],
  );
  const movies = useResource(loadMovies, validYear);
  const totalPages = movies.data?.totalPages || 0;
  const totalElements = movies.data?.totalElements || 0;
  const firstItem = totalElements ? page * 15 + 1 : 0;
  const lastItem = Math.min((page + 1) * 15, totalElements);

  function clearFilters() {
    setYear('');
    setWinner('');
    setPage(0);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ACERVO DA PREMIAÇÃO</p>
          <h1>Lista de filmes</h1>
          <p className="page-description">
            Explore os indicados e encontre os vencedores de cada ano.
          </p>
        </div>
        <span className="page-tag">15 por página</span>
      </div>
      <section className="card movie-list" aria-labelledby="movie-list-title">
        <div className="list-heading">
          <h2 id="movie-list-title">Filmes indicados</h2>
          <p>Filtre o acervo por ano ou resultado da premiação.</p>
        </div>
        <div className="filters">
          <div className="field">
            <label htmlFor="filter-year">Filtrar por ano</label>
            <input
              id="filter-year"
              type="text"
              inputMode="numeric"
              placeholder="Todos os anos"
              value={year}
              onChange={(event) => {
                setYear(event.target.value.trim());
                setPage(0);
              }}
              aria-invalid={!validYear}
              aria-describedby={!validYear ? 'filter-year-error' : undefined}
            />
          </div>
          <div className="field">
            <label htmlFor="filter-winner">Vencedor?</label>
            <select
              id="filter-winner"
              value={winner}
              onChange={(event) => {
                setWinner(event.target.value as WinnerFilter);
                setPage(0);
              }}
            >
              <option value="">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          {(year || winner) && (
            <button className="button button-text" type="button" onClick={clearFilters}>
              Limpar filtros
            </button>
          )}
        </div>
        {!validYear ? (
          <p className="field-error" id="filter-year-error" role="alert">
            Informe um ano com quatro dígitos para filtrar.
          </p>
        ) : (
          <DataState
            resource={movies}
            empty={!movies.data?.content.length}
            emptyMessage="Nenhum filme encontrado com esses filtros."
          >
            <MovieTable movies={movies.data?.content || []} includeWinner />
          </DataState>
        )}
        <div className="pagination">
          <p aria-live="polite">
            {!validYear || movies.loading || movies.error
              ? '—'
              : `${firstItem}–${lastItem} de ${totalElements} filmes`}
          </p>
          <nav aria-label="Paginação de filmes">
            <button
              className="button button-secondary"
              type="button"
              disabled={page === 0 || movies.loading || !!movies.error || !validYear}
              onClick={() => setPage((value) => value - 1)}
              aria-label="Página anterior"
            >
              ← <span>Anterior</span>
            </button>
            <span className="page-position" aria-live="polite">
              {totalPages ? `${page + 1} / ${totalPages}` : '0 / 0'}
            </span>
            <button
              className="button button-secondary"
              type="button"
              disabled={page + 1 >= totalPages || movies.loading || !!movies.error || !validYear}
              onClick={() => setPage((value) => value + 1)}
              aria-label="Próxima página"
            >
              <span>Próxima</span> →
            </button>
          </nav>
        </div>
      </section>
    </>
  );
}
