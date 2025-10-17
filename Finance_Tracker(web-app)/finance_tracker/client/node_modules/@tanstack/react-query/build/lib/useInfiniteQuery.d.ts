import type { InfiniteData, NonUndefinedGuard, QueryFunction, QueryKey } from '@tanstack/query-core';
import type { DefinedUseInfiniteQueryResult, UseInfiniteQueryOptions, UseInfiniteQueryResult } from './types';
export declare function useInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey> & {
    initialData: NonUndefinedGuard<InfiniteData<TQueryFnData>> | (() => NonUndefinedGuard<InfiniteData<TQueryFnData>>) | undefined;
}): DefinedUseInfiniteQueryResult<TData, TError>;
export declare function useInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>): UseInfiniteQueryResult<TData, TError>;
/** @deprecated This function overload will be removed in the next major version. */
export declare function useInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(queryKey: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>, 'queryKey'>): UseInfiniteQueryResult<TData, TError>;
/** @deprecated This function overload will be removed in the next major version. */
export declare function useInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(queryKey: TQueryKey, queryFn: QueryFunction<TQueryFnData, TQueryKey>, options?: Omit<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>, 'queryKey' | 'queryFn'>): UseInfiniteQueryResult<TData, TError>;
//# sourceMappingURL=useInfiniteQuery.d.ts.map