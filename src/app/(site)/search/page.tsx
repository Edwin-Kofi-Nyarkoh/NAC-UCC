"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Search, Loader2, FileText, Calendar, Play, Heart, X } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { useDebounce } from "@/lib/use-debounce"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { SectionLabel } from "@/components/layout/section-label"

const TABS = [
  { key: "all", label: "All" },
  { key: "posts", label: "News", icon: FileText },
  { key: "events", label: "Events", icon: Calendar },
  { key: "sermons", label: "Sermons", icon: Play },
  { key: "medical", label: "Medical", icon: Heart },
] as const

type Tab = (typeof TABS)[number]["key"]

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const debouncedQuery = useDebounce(query, 350)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => api.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  const results = data?.results
  const total = data?.total ?? 0

  const allItems = results
    ? [
        ...results.posts.map((p) => ({ ...p, href: `/news/${p.slug}`, type: "News" as const })),
        ...results.events.map((e) => ({ ...e, href: `/events/${e.slug}`, type: "Event" as const })),
        ...results.sermons.map((s) => ({ ...s, href: `/sermons/${s.slug}`, type: "Sermon" as const })),
        ...results.medical.map((m) => ({ ...m, href: `/medical-ministry/news/${m.slug}`, type: "Medical" as const })),
      ]
    : []

  const filtered =
    activeTab === "all"
      ? allItems
      : allItems.filter(
          (r) =>
            (activeTab === "posts" && r._type === "post") ||
            (activeTab === "events" && r._type === "event") ||
            (activeTab === "sermons" && r._type === "sermon") ||
            (activeTab === "medical" && r._type === "medical")
        )

  function getIcon(type: string) {
    if (type === "News") return <FileText className="w-4 h-4 text-primary" />
    if (type === "Event") return <Calendar className="w-4 h-4 text-emerald-500" />
    if (type === "Sermon") return <Play className="w-4 h-4 text-gold" />
    return <Heart className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero search */}
      <section className="py-16 bg-navy-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Search</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold mb-8">Find Anything</h1>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver-500" />
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news, events, sermons, medical…"
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-silver-500 focus:outline-none focus:ring-2 focus:ring-primary text-base"
            />
            {(isLoading || isFetching) && query.length >= 2 ? (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver-500 animate-spin" />
            ) : query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        {results && total > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map(({ key, label }) => {
              const count =
                key === "all"
                  ? total
                  : key === "posts"
                  ? results.posts.length
                  : key === "events"
                  ? results.events.length
                  : key === "sermons"
                  ? results.sermons.length
                  : results.medical.length

              if (key !== "all" && count === 0) return null

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    activeTab === key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Empty / prompt states */}
        {query.length < 2 && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Type at least 2 characters to search.</p>
          </div>
        )}

        {debouncedQuery.length >= 2 && !isLoading && total === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium text-foreground mb-2">No results for &ldquo;{debouncedQuery}&rdquo;</p>
            <p className="text-sm">Try different keywords or check your spelling.</p>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <Link
              key={`${item._type}-${item.id}`}
              href={item.href}
              onMouseDown={() => inputRef.current?.blur()}
              onTouchStart={() => inputRef.current?.blur()}
              className="group flex gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.type}</span>
                  {"createdAt" in item && (
                    <span className="text-xs text-muted-foreground">· {formatDate(item.createdAt)}</span>
                  )}
                  {"date" in item && (
                    <span className="text-xs text-muted-foreground">· {formatDate(item.date)}</span>
                  )}
                </div>
                <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                  {item.title}
                </p>
                {"excerpt" in item && item.excerpt && (
                  <p className="text-muted-foreground text-sm line-clamp-1">{item.excerpt}</p>
                )}
                {"preacher" in item && (
                  <p className="text-muted-foreground text-sm">{item.preacher} · {item.scripture}</p>
                )}
                {"location" in item && (
                  <p className="text-muted-foreground text-sm">{item.location}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
