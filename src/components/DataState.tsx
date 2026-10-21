import type { ReactNode } from 'react';
import type { Resource } from '../hooks/useResource';

interface Props<T> {
  resource: Resource<T>;
  empty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

export function DataState<T>({ resource, empty, emptyMessage, children }: Props<T>) {
  if (resource.loading) {
    return (
      <div className="state" role="status">
        <span className="spinner" aria-hidden="true" />
        Carregando dados…
      </div>
    );
  }
  if (resource.error) {
    return (
      <div className="state state-error" role="alert">
        <p>{resource.error}</p>
        <button className="button button-secondary" type="button" onClick={resource.retry}>
          Tentar novamente
        </button>
      </div>
    );
  }
  if (empty)
    return (
      <p className="state" role="status">
        {emptyMessage || 'Nenhum resultado encontrado.'}
      </p>
    );
  return children;
}
