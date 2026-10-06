"use client"

import { useState } from "react"
import Link from "next/link"
import { Pencil, Trash2, Eye, EyeOff, Plus, Search, Loader2 } from "lucide-react"
import { categoryLabel, cn } from "@/lib/utils"

export interface ContentRow {
  id: string
  title: string
  category?: string
  published: boolean
  author?: string
  date: string
  extra?: string // preacher, time, etc.
}

interface ContentTableProps {
  rows: ContentRow[]
  loading?: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => Promise<unknown> | void
  onTogglePublish: (id: string, published: boolean) => void
  createHref?: string
  createLabel?: string
  title: string
}

export function ContentTable({
  rows,
  loading,
  onEdit,
  onDelete,
  onTogglePublish,
  createHref,
  createLabel = "New",
  title,
}: ContentTableProps) {
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return
    setDeleting(id)
    try {
      await onDelete(id)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-border">
        <h2 className="font-bold text-foreground text-lg">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-48"
            />
          </div>
          {createHref && (
            <Link
              href={createHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> {createLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          {search ? "No results match your search." : "No items yet. Create one to get started."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Author</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">{row.title}</p>
                      {row.extra && <p className="text-muted-foreground text-xs mt-0.5">{row.extra}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    {row.category && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground capitalize">
                        {categoryLabel(row.category)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                    {row.author ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => onTogglePublish(row.id, !row.published)}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors",
                        row.published
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                      title={row.published ? "Click to unpublish" : "Click to publish"}
                    >
                      {row.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {row.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs hidden lg:table-cell">
                    {new Date(row.date).toLocaleDateString("en-GH", { dateStyle: "medium" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => onEdit(row.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={deleting === row.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === row.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
