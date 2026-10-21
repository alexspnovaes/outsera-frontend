import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useResource } from '../hooks/useResource';

describe('requisições concorrentes', () => {
  it('cancela o filtro anterior e ignora sua resposta tardia', async () => {
    let resolveOld!: (value: string) => void;
    let resolveNew!: (value: string) => void;
    const oldLoader = vi.fn(
      (_signal: AbortSignal) =>
        new Promise<string>((resolve) => {
          resolveOld = resolve;
        }),
    );
    const newLoader = vi.fn(
      (_signal: AbortSignal) =>
        new Promise<string>((resolve) => {
          resolveNew = resolve;
        }),
    );
    const { result, rerender } = renderHook(({ loader }) => useResource(loader), {
      initialProps: { loader: oldLoader },
    });
    rerender({ loader: newLoader });
    expect(oldLoader.mock.calls[0][0].aborted).toBe(true);
    await act(async () => {
      resolveNew('filtro atual');
    });
    await waitFor(() => expect(result.current.data).toBe('filtro atual'));
    await act(async () => {
      resolveOld('filtro antigo');
    });
    expect(result.current.data).toBe('filtro atual');
    expect(result.current.error).toBeNull();
  });
});
