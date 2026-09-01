import { useSyncExternalStore } from 'react';

export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return useSyncExternalStore(
    () => () => {},
    () => client as S | C,
    () => server as S | C,
  );
}
