import { useEffect, useState } from 'react';
import { Dashboard } from './screens/Dashboard';
import { MovieList } from './screens/MovieList';

const currentScreen = () => (window.location.hash === '#movies' ? 'movies' : 'dashboard');

export default function App() {
  const [screen, setScreen] = useState(currentScreen);
  useEffect(() => {
    const onHashChange = () => setScreen(currentScreen());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => {
    document.title = `${screen === 'movies' ? 'Lista de filmes' : 'Visão geral'} · Golden Raspberry`;
  }, [screen]);

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <header className="topbar">
        <a className="brand" href="#dashboard">
          <span className="brand-mark" aria-hidden="true">
            G<span>R</span>
          </span>
          <span>
            Golden Raspberry<small>EXPLORADOR DE FILMES</small>
          </span>
        </a>
        <span className="header-note">Cinema. Dados. Perspectivas.</span>
      </header>
      <div className="app-body">
        <aside className="sidebar">
          <p className="navigation-label">EXPLORAR</p>
          <nav aria-label="Navegação principal">
            <a href="#dashboard" aria-current={screen === 'dashboard' ? 'page' : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Visão geral
            </a>
            <a href="#movies" aria-current={screen === 'movies' ? 'page' : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 9h18M8 4v5M16 4v5" />
              </svg>
              Lista de filmes
            </a>
          </nav>
          <div className="sidebar-note">
            <span className="sidebar-dot" />
            Categoria<strong>Pior filme</strong>
            <small>Golden Raspberry Awards</small>
          </div>
        </aside>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {screen === 'movies' ? <MovieList /> : <Dashboard />}
          <footer className="footer">
            Golden Raspberry Awards<span>Dados da categoria Pior Filme</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
