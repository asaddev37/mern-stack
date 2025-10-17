import { InfiniteQueryObserver } from '@tanstack/query-core';
import { useBaseQuery } from './useBaseQuery.esm.js';

function useSuspenseInfiniteQuery(options) {
  return useBaseQuery({ ...options,
    enabled: true,
    suspense: true,
    useErrorBoundary: true,
    networkMode: 'always'
  }, InfiniteQueryObserver);
}

export { useSuspenseInfiniteQuery };
//# sourceMappingURL=useSuspenseInfiniteQuery.esm.js.map
