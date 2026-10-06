"use client"

import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    // Dev bundles are not content-hashed, so a cache-first worker would keep
    // serving old code. Only run it in production, and remove any worker and
    // cache a previous dev session left behind.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {})
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => keys.filter((k) => k.startsWith("nac-ucc-")).forEach((k) => caches.delete(k)))
          .catch(() => {})
      }
      return
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {})
  }, [])

  return null
}
