import type { Movie, MoviePage } from '../types';

export const movie = (id: number, title = `Filme ${id}`, winner = false): Movie => ({
  id,
  title,
  year: 1990,
  studios: ['Estúdio'],
  producers: ['Produtor'],
  winner,
});

export const moviePage = (page = 0): MoviePage => ({
  content: [movie(page * 15 + 1)],
  number: page,
  size: 15,
  totalElements: 31,
  totalPages: 3,
  first: page === 0,
  last: page === 2,
});

export const yearData = { years: [{ year: 1990, winnerCount: 2 }] };
export const studioData = {
  studios: [
    { name: 'Quarto estúdio', winCount: 1 },
    { name: 'Segundo estúdio', winCount: 8 },
    { name: 'Primeiro estúdio', winCount: 10 },
    { name: 'Terceiro estúdio', winCount: 3 },
  ],
};
export const intervalData = {
  min: [
    { producer: 'Produtor A', interval: 1, previousWin: 1980, followingWin: 1981 },
    { producer: 'Produtor B', interval: 1, previousWin: 1990, followingWin: 1991 },
  ],
  max: [
    { producer: 'Produtor C', interval: 20, previousWin: 1980, followingWin: 2000 },
    { producer: 'Produtor D', interval: 20, previousWin: 1990, followingWin: 2010 },
  ],
};
