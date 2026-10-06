"use client"

import { useEffect } from "react"
import { Logo } from "@/components/layout/logo"

// Shown in place of a page that could not be drawn.
//
// The usual cause is a script file that did not arrive: the connection dropped
// for a moment, or the site was updated while this tab was open. The browser
// remembers that failure, so only a fresh copy of the page puts it right. That
// is why this page reloads by itself, and why "Try again" reloads too.

const LAST_RELOAD = "nac-error-reload"

/** A script file the page needs could not be fetched. */
function isMissingScript(error: Error) {
  return error.name === "ChunkLoadError" || /failed to load chunk|loading chunk/i.test(error.message)
}

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    if (!isMissingScript(error)) return
    try {
      // Not twice in a row: a page that keeps failing must not reload for ever
      const last = Number(sessionStorage.getItem(LAST_RELOAD) ?? 0)
      if (Date.now() - last < 10_000) return
      sessionStorage.setItem(LAST_RELOAD, String(Date.now()))
    } catch {
      return // no session storage (private browsing): leave it to the button
    }
    window.location.reload()
  }, [error])

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-sm">
        <Logo size={56} className="gap-2.5 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-3">This page could not be loaded</h1>
        <p className="text-silver-400 text-sm leading-relaxed mb-8">
          Something went wrong on our side, or the connection dropped for a moment. Please try again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
