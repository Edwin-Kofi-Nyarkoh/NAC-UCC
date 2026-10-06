"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Trash2, MessageCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/utils"

export default function AdminCommentsPage() {
  const qc = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: api.comments.all,
  })

  const deleteMutation = useMutation({
    mutationFn: api.comments.remove,
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-comments"] }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading comments…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sermon Comments</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {comments.length} comment{comments.length !== 1 ? "s" : ""} across all sermons.
        </p>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No comments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground">{c.authorName}</span>
                  {c.authorEmail && (
                    <span className="text-xs text-muted-foreground">{c.authorEmail}</span>
                  )}
                  <span className="text-xs text-muted-foreground">· {formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90 mb-2 leading-relaxed">{c.content}</p>
                <Link
                  href={`/sermons/${c.sermon.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {c.sermon.title}
                </Link>
              </div>

              <button
                onClick={() => deleteMutation.mutate(c.id)}
                disabled={deletingId === c.id}
                title="Delete comment"
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
              >
                {deletingId === c.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
