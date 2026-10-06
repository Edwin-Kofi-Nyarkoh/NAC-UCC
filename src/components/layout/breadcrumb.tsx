"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const LABELS: Record<string, string> = {
  about: "About",
  events: "Events",
  sermons: "Sermons",
  news: "News",
  gallery: "Gallery",
  give: "Give",
  contact: "Contact",
  ministries: "Ministries",
  "medical-ministry": "Medical Ministry",
  admin: "Admin",
  editor: "Editor",
  medical: "Medical",
  posts: "Posts",
  users: "Users",
  new: "New",
  login: "Login",
  search: "Search",
  offline: "Offline",
  nominations: "Nominations",
  nominate: "Nominate",
}

function prettify(segment: string): string {
  return LABELS[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface BreadcrumbProps {
  /** Override the last segment label (e.g. the post title) */
  currentLabel?: string
  className?: string
}

export function Breadcrumb({ currentLabel, className }: BreadcrumbProps) {
  const pathname = usePathname()

  // Don't show on home page
  if (pathname === "/") return null

  const segments = pathname.split("/").filter(Boolean)

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    const isLast = i === segments.length - 1
    const label = isLast && currentLabel ? currentLabel : prettify(seg)
    return { href, label, isLast }
  })

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-xs text-silver-400 flex-wrap", className)}
    >
      <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors shrink-0">
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {crumbs.map(({ href, label, isLast }) => (
        <span key={href} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
          {isLast ? (
            <span className="text-white/80 font-medium truncate max-w-40 sm:max-w-xs" aria-current="page">
              {label}
            </span>
          ) : (
            <Link href={href} className="hover:text-white transition-colors truncate max-w-25 sm:max-w-40">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
