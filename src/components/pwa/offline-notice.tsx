"use client"

import { WifiOff } from "lucide-react"
import { useOnline } from "@/lib/browser-conditions"

/**
 * Tells the visitor, on whatever page they have open, that the connection has
 * gone. The page stays readable; anything that needs the network will not work
 * until it is back. (Opening a new page while offline shows public/offline.html,
 * which the service worker serves.)
 */
export function OfflineNotice() {
  const online = useOnline()
  if (online) return null

  return (
    // Sits above the phone's tab bar on the public site
    <div
      role="status"
      className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] lg:bottom-6 z-70 flex justify-center px-4 pointer-events-none"
    >
      <p className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-navy-950 text-white text-sm font-medium px-4 py-2.5 shadow-lg ring-1 ring-white/15 animate-in fade-in-0 slide-in-from-bottom-2 duration-200 motion-reduce:animate-none">
        <WifiOff className="w-4 h-4 text-gold shrink-0" />
        You&apos;re offline. Check your internet connection.
      </p>
    </div>
  )
}
