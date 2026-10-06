import { revalidateTag } from "next/cache"

// Public pages are not rebuilt from the database on every visit. Next.js keeps
// each page it has built and serves that copy, which is what makes the site
// fast. Two things keep the copies honest:
//
//   1. Whenever staff save anything in the dashboard, every copy is dropped
//      (publicContentChanged, called from src/server/app.ts), so the change is
//      on the site the next time someone opens a page.
//   2. A copy is never trusted for longer than REFRESH_SECONDS. That covers
//      changes nobody "saves": an event passing its date, or an edit made from
//      another copy of the app that shares this database (a developer's
//      computer, say), which cannot reach this cache.

/** Everything the public pages read is filed under this name. */
export const PUBLIC_CONTENT = "public-content"

/** How long a copy may be served before it is rebuilt in the background. */
export const REFRESH_SECONDS = 300

/** Staff have changed something visitors can see: rebuild pages on their next visit. */
export function publicContentChanged() {
  try {
    revalidateTag(PUBLIC_CONTENT, { expire: 0 })
  } catch {
    // Outside a Next.js request (a script, a test) there is no cache to clear
  }
}
