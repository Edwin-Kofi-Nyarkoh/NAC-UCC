"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import type { MedicalPost } from "@/types"
import { formatDate, cn } from "@/lib/utils"

const FILTERS = ["All", "Emergency", "General"] as const
type Filter = (typeof FILTERS)[number]

function isEmergency(post: MedicalPost) {
  return post.category === "EMERGENCY"
}

export function MedicalFilter({ posts }: { posts: MedicalPost[] }) {
  const [active, setActive] = useState<Filter>("All")

  const filtered = posts.filter((p) => {
    if (active === "All") return true
    if (active === "Emergency") return isEmergency(p)
    return !isEmergency(p)
  })

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
              active === f
                ? f === "Emergency"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {f === "Emergency" && <AlertTriangle className="w-3.5 h-3.5" />}
            {f}
            <span className="opacity-60">
              ({f === "All" ? posts.length : f === "Emergency" ? posts.filter(isEmergency).length : posts.filter((p) => !isEmergency(p)).length})
            </span>
          </button>
        ))}
      </div>

      {/* Post grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => {
          const emergency = isEmergency(post)
          return (
            <Link
              key={post.id}
              href={`/medical-ministry/news/${post.slug}`}
              className={cn(
                "group bg-card border rounded-2xl p-6 hover:shadow-xl transition-all duration-200",
                emergency
                  ? "border-red-200 hover:border-red-400 dark:border-red-900/50 dark:hover:border-red-700"
                  : "border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
                    emergency
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {emergency && <AlertTriangle className="w-3 h-3" />}
                  {emergency ? "Emergency" : "General"}
                </span>
                <span className="text-muted-foreground text-xs shrink-0">{formatDate(post.createdAt)}</span>
              </div>

              <h2
                className={cn(
                  "font-bold mb-2 leading-tight transition-colors",
                  emergency
                    ? "text-red-700 dark:text-red-400 group-hover:text-red-600"
                    : "text-foreground group-hover:text-primary"
                )}
              >
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <p className="text-xs font-semibold text-primary/70 mt-4 group-hover:underline">
                Read more →
              </p>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && posts.length > 0 && (
        <p className="text-center text-muted-foreground py-16">
          No {active.toLowerCase()} posts at this time.
        </p>
      )}
    </>
  )
}
