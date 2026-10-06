import { WifiOff } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-9 h-9 text-silver-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">You&apos;re offline</h1>
        <p className="text-silver-400 text-sm leading-relaxed mb-8">
          It looks like you don&apos;t have an internet connection right now. Some pages you visited recently are available offline.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Try Home Page
        </Link>
      </div>
    </div>
  )
}
