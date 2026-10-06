"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

/**
 * Data fetched in the browser (TanStack Query). Only the dashboard and the two
 * public screens that load data after the page has opened are wrapped in this.
 * It lives in its own file so that every other public page is spared the download.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Refetching when the tab regains focus could surprise someone mid-edit.
            // Data is still refetched every time a page that uses it is opened.
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
