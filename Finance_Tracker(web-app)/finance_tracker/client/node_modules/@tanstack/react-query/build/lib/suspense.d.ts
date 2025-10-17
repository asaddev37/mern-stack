import type { DefaultedQueryObserverOptions } from '@tanstack/query-core';
import type { QueryObserver } from '@tanstack/query-core';
import type { QueryErrorResetBoundaryValue } from './QueryErrorResetBoundary';
import type { QueryObserverResult } from '@tanstack/query-core';
import type { QueryKey } from '@tanstack/query-core';
/**
 * Ensures minimum staleTime and cacheTime values when suspense is enabled.
 * Despite the name, this function guards both staleTime and cacheTime to prevent
 * infinite re-render loops with synchronous queries.
 *
 * @deprecated in v5 - replaced by ensureSuspenseTimers
 */
export declare const ensureStaleTime: (defaultedOptions: DefaultedQueryObserverOptions<any, any, any, any, any>) => void;
export declare const willFetch: (result: QueryObserverResult<any, any>, isRestoring: boolean) => boolean;
export declare const shouldSuspend: (defaultedOptions: DefaultedQueryObserverOptions<any, any, any, any, any> | undefined, result: QueryObserverResult<any, any>, isRestoring: boolean) => boolean | undefined;
export declare const fetchOptimistic: <TQueryFnData, TError, TData, TQueryData, TQueryKey extends QueryKey>(defaultedOptions: DefaultedQueryObserverOptions<TQueryFnData, TError, TData, TQueryData, TQueryKey>, observer: QueryObserver<TQueryFnData, TError, TData, TQueryData, TQueryKey>, errorResetBoundary: QueryErrorResetBoundaryValue) => Promise<void>;
//# sourceMappingURL=suspense.d.ts.map