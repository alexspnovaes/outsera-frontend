import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { moviesApi } from '../api';
import { DataState } from '../components/DataState';
import { MovieTable } from '../components/MovieTable';
import { useResource } from '../hooks/useResource';
import type { ProducerInterval } from '../types';

const isYear = (value: string) => /^[1-9]\d{3}$/.test(value);

function IntervalTable({ title, rows }: { title: string; rows: ProducerInterval[] }) {
  return (
    <section className="interval-section" aria-label={title}>
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="empty-inline">Nenhum produtor com duas vitórias.</p>
      ) : (
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label={`Tabela: ${title.toLowerCase()}`}
        >
          <table>
            <caption className="sr-only">
              {title} entre vitórias consecutivas, incluindo empates
            </caption>
            <thead>
              <tr>
                <th scope="col">Produtor</th>
                <th scope="col">Intervalo</th>
                <th scope="col">Anterior</th>
                <th scope="col">Seguinte</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.producer}-${row.previousWin}-${row.followingWin}-${index}`}>
                  <td className="movie-title">{row.producer}</td>
                  <td className="numeric">
                    {row.interval} {row.interval === 1 ? 'ano' : 'anos'}
                  </td>
                  <td className="numeric">{row.previousWin}</td>
                  <td className="numeric">{row.followingWin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function Dashboard() {
  const years = useResource(moviesApi.years);
  const studios = useResource(moviesApi.studios);
  const intervals = useResource(moviesApi.intervals);
  const [yearInput, setYearInput] = useState('');
  const [searchedYear, setSearchedYear] = useState('');
  const [yearError, setYearError] = useState('');
  const [searchCount, setSearchCount] = useState(0);
  const loadWinners = useCallback(
    (signal: AbortSignal) => {
      // searchCount permite repetir a mesma consulta com o botão de busca.
      void searchCount;
      return moviesApi.winners(searchedYear, signal);
    },
    [searchedYear, searchCount],
  );
  const winners = useResource(loadWinners, !!searchedYear);
  const topStudios = [...(studios.data?.studios || [])]
    .sort((a, b) => b.winCount - a.winCount || a.name.localeCompare(b.name))
    .slice(0, 3);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isYear(yearInput.trim())) {
      setYearError('Informe um ano com quatro dígitos.');
      return;
    }
    setYearError('');
    setSearchedYear(yearInput.trim());
    setSearchCount((count) => count + 1);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">GOLDEN RASPBERRY AWARDS</p>
          <h1>Visão geral</h1>
          <p className="page-description">
            Os anos, estúdios e produtores que marcaram a premiação.
          </p>
        </div>
        <span className="page-tag">Pior filme</span>
      </div>
      <div className="dashboard-grid">
        <section className="card" aria-labelledby="years-title">
          <div className="card-heading">
            <span className="card-icon" aria-hidden="true">
              01
            </span>
            <div>
              <h2 id="years-title">Anos com múltiplos vencedores</h2>
              <p>Mais de um filme premiado na mesma edição.</p>
            </div>
          </div>
          <DataState
            resource={years}
            empty={!years.data?.years.length}
            emptyMessage="Nenhum ano teve múltiplos vencedores."
          >
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Tabela de anos com múltiplos vencedores"
            >
              <table>
                <caption className="sr-only">Anos com mais de um vencedor</caption>
                <thead>
                  <tr>
                    <th scope="col">Ano</th>
                    <th scope="col">Vitórias</th>
                  </tr>
                </thead>
                <tbody>
                  {years.data?.years.map((row) => (
                    <tr key={row.year}>
                      <td className="numeric movie-title">{row.year}</td>
                      <td className="numeric">{row.winnerCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataState>
        </section>
        <section className="card" aria-labelledby="studios-title">
          <div className="card-heading">
            <span className="card-icon" aria-hidden="true">
              02
            </span>
            <div>
              <h2 id="studios-title">Estúdios com mais vitórias</h2>
              <p>Os três primeiros no total de filmes vencedores.</p>
            </div>
          </div>
          <DataState
            resource={studios}
            empty={topStudios.length === 0}
            emptyMessage="Nenhum estúdio com vitórias encontrado."
          >
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Tabela de estúdios com mais vitórias"
            >
              <table>
                <caption className="sr-only">Três estúdios com mais vitórias</caption>
                <thead>
                  <tr>
                    <th scope="col">Estúdio</th>
                    <th scope="col">Vitórias</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudios.map((row, index) => (
                    <tr key={row.name}>
                      <td className="movie-title">
                        <span className="ranking" aria-label={`${index + 1}º lugar`}>
                          {index + 1}
                        </span>
                        {row.name}
                      </td>
                      <td className="numeric">{row.winCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataState>
        </section>
        <section className="card" aria-labelledby="intervals-title">
          <div className="card-heading">
            <span className="card-icon" aria-hidden="true">
              03
            </span>
            <div>
              <h2 id="intervals-title">Intervalos entre vitórias</h2>
              <p>Produtores com o maior e o menor intervalo.</p>
            </div>
          </div>
          <DataState
            resource={intervals}
            empty={!intervals.data?.max.length && !intervals.data?.min.length}
            emptyMessage="Nenhum produtor com duas vitórias encontrado."
          >
            <IntervalTable title="Maior intervalo" rows={intervals.data?.max || []} />
            <IntervalTable title="Menor intervalo" rows={intervals.data?.min || []} />
          </DataState>
        </section>
        <section className="card" aria-labelledby="winners-title">
          <div className="card-heading">
            <span className="card-icon" aria-hidden="true">
              04
            </span>
            <div>
              <h2 id="winners-title">Vencedores por ano</h2>
              <p>Consulte os filmes premiados em uma edição.</p>
            </div>
          </div>
          <form className="year-search" onSubmit={search} noValidate>
            <div className="field">
              <label htmlFor="search-year">Ano da premiação</label>
              <input
                id="search-year"
                type="text"
                inputMode="numeric"
                placeholder="Ex.: 1990"
                value={yearInput}
                onChange={(event) => {
                  setYearInput(event.target.value);
                  setYearError('');
                }}
                aria-invalid={!!yearError}
                aria-describedby={yearError ? 'search-year-error' : undefined}
              />
            </div>
            <button className="button" type="submit">
              Buscar
            </button>
          </form>
          {yearError && (
            <p className="field-error" id="search-year-error" role="alert">
              {yearError}
            </p>
          )}
          {!searchedYear ? (
            <div className="search-placeholder">
              <span aria-hidden="true">⌕</span>
              <p>Qual edição você quer explorar?</p>
              <small>Digite um ano para ver seus vencedores.</small>
            </div>
          ) : (
            <>
              <p className="results-label">Resultados de {searchedYear}</p>
              <DataState
                resource={winners}
                empty={!winners.data?.length}
                emptyMessage={`Nenhum vencedor encontrado em ${searchedYear}.`}
              >
                <MovieTable movies={winners.data || []} />
              </DataState>
            </>
          )}
        </section>
      </div>
    </>
  );
}
