import type { Metadata } from "next"
import { QueryProvider } from "@/components/query-provider"

export const metadata: Metadata = {
  title: "Search",
  description: "Search the news, events, sermons and health news of NAC UCC Campus Congregation.",
}

// The search page asks the API as the visitor types, so it needs the query provider
export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>
}
