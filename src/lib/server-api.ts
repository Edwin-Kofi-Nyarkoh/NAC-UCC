import { cache } from "react"
import { unstable_cache } from "next/cache"
import { app } from "@/server/app"
import { PUBLIC_CONTENT, REFRESH_SECONDS } from "@/server/lib/public-cache"
import { emptySettings, type SiteSettings } from "@/lib/site-settings"

// For server components only. Reads from the API in-process, with no HTTP
// round trip, so it works whatever host or port the site is served on.

/** Asks the API. A record that does not exist is null; any other failure is an error. */
async function readFromApi(path: string): Promise<unknown> {
  const res = await app.request(`/api${path}`)
  if (res.status === 404) return null
  // Thrown, so that "could not be read just now" is never kept as the answer
  if (!res.ok) throw new Error(`Could not read ${path} from the database (status ${res.status})`)
  return res.json()
}

// Answers are kept and reused, so most visits never touch the database.
// src/server/lib/public-cache.ts explains when a kept answer is thrown away.
const readCached = unstable_cache(readFromApi, ["public-api"], {
  tags: [PUBLIC_CONTENT],
  revalidate: REFRESH_SECONDS,
})

// A page built while something could not be read is missing that content, and
// must not stay as the page's copy for the usual five minutes. Reading this
// (it holds nothing) while such a page is being built tells Next.js to build
// the page again after one second instead.
const buildAgainSoon = unstable_cache(async () => null, ["build-again-soon"], { revalidate: 1 })

/**
 * Reads public content for a page. Returns null when the record does not exist,
 * and also when the database cannot be reached: the page is then drawn without
 * that content rather than not at all, and rebuilt a moment later.
 *
 * Within one page render the layout and the page can ask for the same path and
 * it is only looked up once.
 */
export const serverFetch = cache(async <T>(path: string): Promise<T | null> => {
  try {
    return (await readCached(path)) as T | null
  } catch (error) {
    console.error(error)
    await buildAgainSoon()
    return null
  }
})

/** The site settings, or empty ones if nothing has been saved yet. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await serverFetch<{ settings: SiteSettings }>("/settings")
  return data?.settings ?? emptySettings
}
