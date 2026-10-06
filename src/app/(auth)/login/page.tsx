"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { api } from "@/lib/api"
import { dashboardHome, saveSession, useSession } from "@/lib/session"

// The form reads ?next= from the URL, so it has to be rendered inside <Suspense>
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Already signed in: skip the form
  const session = useSession()
  useEffect(() => {
    if (session) router.replace(dashboardHome(session.role))
  }, [session, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { token, user } = await api.auth.login(email, password)
      saveSession(token, user)
      // Go back to the page they were sent here from, if it was one of ours
      router.push(next?.startsWith("/") ? next : dashboardHome(user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-1">Sign In</h2>
      <p className="text-silver-400 text-sm mb-8">
        No self-registration. Contact the administrator if you need an account.
      </p>

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-silver-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@nacucc.org"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-silver-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-silver-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-silver-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-500 hover:text-white transition-colors"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  )
}

// The page: branding around the form
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size={64} className="gap-2.5 mb-4" />
          <h1 className="text-2xl font-bold text-white">NAC UCC</h1>
          <p className="text-silver-400 text-sm mt-1">Staff Portal</p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl flex items-center justify-center min-h-70">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="text-center text-silver-600 text-xs mt-6">
          {/* Staff signing in are not about to read the home page: do not preload it */}
          <Link href="/" prefetch={false} className="hover:text-silver-300 transition-colors">
            ← Return to church website
          </Link>
        </p>
      </div>
    </div>
  )
}
