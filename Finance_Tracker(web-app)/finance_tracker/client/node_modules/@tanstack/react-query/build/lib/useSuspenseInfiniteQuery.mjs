import { InfiniteQueryObserver } from '@tanstack/query-core';
import { useBaseQuery } from './useBaseQuery.mjs';

function useSuspenseInfiniteQuery(options) {
  return useBaseQuery({ ...options,
    enabled: true,
    suspense: true,
    useErrorBoundary: true,
    networkMode: 'always'
  }, InfiniteQueryObserver);
}

export { useSuspenseInfiniteQuery };
//# sourceMappingURL=useSuspenseInfiniteQuery.mjs.map
