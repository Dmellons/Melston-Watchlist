'use client'

import { useState } from 'react'
import {
    QueryClient,
    QueryClientProvider,
    isServer,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 min default; per-query staleTime overrides
                gcTime: 60 * 60 * 1000, // keep cache 1h
                refetchOnWindowFocus: false, // matches the app's fetch-once behavior
                retry: 1,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
    if (isServer) {
        // Server: always make a fresh client (no cross-request sharing).
        return makeQueryClient()
    }
    // Browser: reuse a singleton so Fast Refresh / re-mounts keep the cache.
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
}

export function Providers({ children }: { children: React.ReactNode }) {
    // useState keeps the client reference stable across re-renders.
    const [queryClient] = useState(getQueryClient)

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV !== 'production' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    )
}
