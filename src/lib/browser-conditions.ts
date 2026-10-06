import { useEffect, useState, useSyncExternalStore, type RefObject } from "react"

// What we can tell about the visitor's device and connection. Each hook takes
// (or has) an answer to assume on the server and while the page is starting up,
// before the browser can be asked.

/** Whether a CSS media query matches, kept up to date. */
export function useMediaQuery(query: string, beforeKnown = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => beforeKnown
  )
}

/** The visitor has asked their device to keep animation to a minimum. */
export function usePrefersReducedMotion(): boolean {
  // Assumed until known, so nothing starts moving and then has to stop
  return useMediaQuery("(prefers-reduced-motion: reduce)", true)
}

// Chrome, Edge and Android browsers report the connection; Safari and Firefox do not.
interface Connection extends EventTarget {
  saveData?: boolean
  effectiveType?: string
}
// Too slow for video to be worth starting. 3G is deliberately not here: it is
// slow, but the fallback picture covers the wait and the video still arrives.
const VERY_SLOW_CONNECTIONS = ["slow-2g", "2g"]

function connection(): Connection | undefined {
  return (navigator as Navigator & { connection?: Connection }).connection
}

/**
 * True when the visitor has switched on their browser's data saver, or is on a
 * 2G-class connection. Assumed until known, so nothing heavy starts
 * downloading before we have checked.
 */
export function useSaveData(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      connection()?.addEventListener("change", onChange)
      return () => connection()?.removeEventListener("change", onChange)
    },
    () => Boolean(connection()?.saveData) || VERY_SLOW_CONNECTIONS.includes(connection()?.effectiveType ?? ""),
    () => true
  )
}

/** False while the browser tab is in the background. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener("visibilitychange", onChange)
      return () => document.removeEventListener("visibilitychange", onChange)
    },
    () => document.visibilityState === "visible",
    () => true
  )
}

/** Whether any part of an element is on screen. */
export function useInView(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return inView
}
