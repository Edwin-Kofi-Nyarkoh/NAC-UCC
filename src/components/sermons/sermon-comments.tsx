"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MessageCircle, Loader2, User, Send } from "lucide-react"
import { api } from "@/lib/api"
import { cn, formatDate } from "@/lib/utils"

export function SermonComments({ sermonId }: { sermonId: string }) {
  const qc = useQueryClient()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [content, setContent] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["sermon-comments", sermonId],
    queryFn: () => api.comments.forSermon(sermonId),
  })

  const mutation = useMutation({
    mutationFn: () =>
      api.comments.add(sermonId, {
        authorName: name.trim(),
        authorEmail: email.trim() || undefined,
        content: content.trim(),
      }),
    onSuccess: () => {
      setSubmitted(true)
      setContent("")
      qc.invalidateQueries({ queryKey: ["sermon-comments", sermonId] })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return
    mutation.mutate()
  }

  return (
    <div className="mt-12 pt-10 border-t border-border">
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">
          Comments {comments.length > 0 && <span className="text-muted-foreground font-normal">({comments.length})</span>}
        </h2>
      </div>

      {/* Comment list */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading comments…
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-sm mb-8">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-5 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 bg-muted/50 rounded-2xl p-4 rounded-tl-none">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground">{c.authorName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      {submitted ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
          <p className="font-semibold mb-1">Comment posted!</p>
          <p>Your comment is now visible below.</p>
          <button onClick={() => setSubmitted(false)} className="mt-3 text-xs underline">
            Write another comment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-muted/30 rounded-2xl p-5 border border-border">
          <p className="font-semibold text-sm">Leave a comment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <textarea
            placeholder="Share your thoughts on this sermon…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          {mutation.isError && (
            <p className="text-red-500 text-sm">{mutation.error?.message ?? "Something went wrong."}</p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending || !name.trim() || !content.trim()}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Comment
          </button>
          <p className="text-xs text-muted-foreground">Be respectful and kind. Comments may be removed by an admin.</p>
        </form>
      )}
    </div>
  )
}
