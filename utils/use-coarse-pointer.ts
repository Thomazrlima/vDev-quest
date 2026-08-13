'use client';

import { useEffect, useState } from 'react';

/**
 * `true` quando o ponteiro principal é um dedo. Começa em `false` para o HTML do
 * servidor bater com o do cliente; o ajuste acontece logo após a hidratação.
 */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    setCoarse(query.matches);

    const update = (event: MediaQueryListEvent) => setCoarse(event.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return coarse;
}
