'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var queryCore = require('@tanstack/query-core');
var useBaseQuery = require('./useBaseQuery.js');

function useSuspenseInfiniteQuery(options) {
  return useBaseQuery.useBaseQuery({ ...options,
    enabled: true,
    suspense: true,
    useErrorBoundary: true,
    networkMode: 'always'
  }, queryCore.InfiniteQueryObserver);
}

exports.useSuspenseInfiniteQuery = useSuspenseInfiniteQuery;
//# sourceMappingURL=useSuspenseInfiniteQuery.js.map
