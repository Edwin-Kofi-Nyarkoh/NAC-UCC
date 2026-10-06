"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Mail, MailOpen, Reply, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { cn, formatDate } from "@/lib/utils"

export default function AdminMessagesPage() {
  const qc = useQueryClient()

  const { data: messages = [], isLoading, isError } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: api.messages.list,
  })

  const readMutation = useMutation({
    mutationFn: api.messages.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  })

  const deleteMutation = useMutation({
    mutationFn: api.messages.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  })

  function handleDelete(id: string) {
    if (!confirm("Delete this message? This cannot be undone.")) return
    deleteMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading messages…
      </div>
    )
  }

  const unread = messages.filter((m) => !m.read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {messages.length} message{messages.length !== 1 ? "s" : ""} from the contact form
          {unread > 0 && ` · ${unread} unread`}.
        </p>
      </div>

      {isError ? (
        <p className="text-red-500 text-sm">Failed to load messages. Please try again.</p>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "bg-card border rounded-2xl p-5",
                m.read ? "border-border" : "border-primary/40"
              )}
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {!m.read && <span className="w-2 h-2 rounded-full bg-primary" aria-label="Unread" />}
                <span className="font-semibold text-sm text-foreground">{m.name}</span>
                <span className="text-xs text-muted-foreground">{m.email}</span>
                <span className="text-xs text-muted-foreground">· {formatDate(m.createdAt)}</span>
              </div>
              <p className="font-medium text-sm text-foreground mb-1">{m.subject}</p>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{m.message}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Reply className="w-3 h-3" /> Reply by email
                </a>
                {!m.read && (
                  <button
                    onClick={() => readMutation.mutate(m.id)}
                    disabled={readMutation.isPending}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                  >
                    <MailOpen className="w-3 h-3" /> Mark as read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40 ml-auto"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
