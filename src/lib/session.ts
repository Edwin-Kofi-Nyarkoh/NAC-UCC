import { useMemo, useSyncExternalStore } from "react"
import type { AuthUser, Role } from "@/types"

// A signed-in session is kept in two places:
//  - localStorage, so the browser can send the token with every API call
//  - a cookie, so the route guard (src/proxy.ts) can check it before a
//    dashboard page is served
// Everything that reads or writes the session goes through this file.

const TOKEN_KEY = "nac_token"
const USER_KEY = "nac_user"
const CHANGE_EVENT = "nac-session-change"

// Matches the token lifetime set in src/server/lib/jwt.ts
const SESSION_SECONDS = 8 * 60 * 60

const isBrowser = () => typeof window !== "undefined"

function setCookie(value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; secure" : ""
  document.cookie = `${TOKEN_KEY}=${value}; path=/; max-age=${maxAge}; samesite=strict${secure}`
}

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  setCookie(token, SESSION_SECONDS)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  setCookie("", 0)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getToken(): string | null {
  return isBrowser() ? localStorage.getItem(TOKEN_KEY) : null
}

function parseUser(raw: string | null): AuthUser | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

/** Where each role lands after signing in. */
export function dashboardHome(role: Role): string {
  if (role === "ADMIN") return "/admin"
  if (role === "CHURCH_EDITOR") return "/editor"
  return "/medical"
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onChange) // signed in or out in another tab
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/**
 * The signed-in user, or null. Re-renders when the session changes.
 * Always null on the server and during hydration, so the first client render
 * matches the server's.
 */
export function useSession(): AuthUser | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(USER_KEY),
    () => null
  )
  return useMemo(() => parseUser(raw), [raw])
}
