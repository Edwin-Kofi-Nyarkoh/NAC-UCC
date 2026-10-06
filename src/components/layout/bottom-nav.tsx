"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Play, Heart, MoreHorizontal, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const PRIMARY_TABS = [
  { label: "Home", href: "/", icon: Home, match: (p: string) => p === "/" },
  { label: "Events", href: "/events", icon: Calendar, match: (p: string) => p.startsWith("/events") },
  { label: "Sermons", href: "/sermons", icon: Play, match: (p: string) => p.startsWith("/sermons") },
  { label: "News", href: "/news", icon: Newspaper, match: (p: string) => p.startsWith("/news") },
  { label: "Medical", href: "/medical-ministry", icon: Heart, match: (p: string) => p.startsWith("/medical-ministry") },
]

const MORE_LINKS = [
  { label: "About", href: "/about" },
  { label: "Ministries", href: "/ministries" },
  { label: "Gallery", href: "/gallery" },
  { label: "Give", href: "/give" },
  { label: "Contact", href: "/contact" },
]

export function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      {/* The "More" sheet sits above the tab bar (z-50) */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-[calc(56px+env(safe-area-inset-bottom))] left-0 right-0 bg-background border-t border-border rounded-t-3xl p-6 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-1 bg-border rounded-full mx-auto mb-6" />
            <div className="grid grid-cols-3 gap-3">
              {MORE_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-center"
                >
                  <span className="text-xs font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab bar: phones and tablets only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-14">
          {PRIMARY_TABS.map(({ label, href, icon: Icon, match }) => {
            const active = match(pathname)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "w-9 h-6 rounded-full flex items-center justify-center transition-colors",
                  active && "bg-primary/10"
                )}>
                  <Icon className={cn("w-5 h-5", active && "text-primary")} />
                </div>
                <span className="leading-none">{label}</span>
              </Link>
            )
          })}

          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs font-medium transition-colors",
              moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn("w-9 h-6 rounded-full flex items-center justify-center", moreOpen && "bg-primary/10")}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="leading-none">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
