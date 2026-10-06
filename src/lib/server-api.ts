import { cache } from "react"
import { connection } from "next/server"
import { app } from "@/server/app"
import { emptySettings, type SiteSettings } from "@/lib/site-settings"

// For server components only. Reads from the API in-process, with no HTTP
// round trip, so it works whatever host or port the site is served on.

/**
 * Returns null when the record does not exist or the database cannot be
 * reached, so a page can show an empty state rather than crash.
 *
 * Results are shared within one page render: the layout and the page can ask
 * for the same path and the database is only queried once.
 */
export const serverFetch = cache(async <T>(path: string): Promise<T | null> => {
  // Wait for a real visitor. Without this, Next.js would run the query once
  // while building and serve that snapshot for ever; with it, every page that
  // reads from the database shows what staff have published right now.
  await connection()

  try {
    const res = await app.request(`/api${path}`)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
})

/** The site settings, or empty ones if nothing has been saved yet. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await serverFetch<{ settings: SiteSettings }>("/settings")
  return data?.settings ?? emptySettings
}
