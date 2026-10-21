import type { Movie } from '../types';

export function MovieTable({
  movies,
  includeWinner = false,
}: {
  movies: Movie[];
  includeWinner?: boolean;
}) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Tabela de filmes">
      <table>
        <caption className="sr-only">
          {includeWinner ? 'Filmes e suas indicações' : 'Filmes vencedores do ano pesquisado'}
        </caption>
        <thead>
          <tr>
            <th scope="col" className="id-column">
              ID
            </th>
            <th scope="col">Ano</th>
            <th scope="col">Título</th>
            {includeWinner && <th scope="col">Vencedor?</th>}
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id}>
              <td className="muted">{movie.id}</td>
              <td className="numeric">{movie.year}</td>
              <td className="movie-title">{movie.title}</td>
              {includeWinner && (
                <td>
                  <span className={`badge ${movie.winner ? 'badge-winner' : 'badge-neutral'}`}>
                    {movie.winner ? 'Sim' : 'Não'}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
