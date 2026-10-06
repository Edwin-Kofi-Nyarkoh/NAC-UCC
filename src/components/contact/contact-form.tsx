"use client"

import { useState } from "react"
import { Loader2, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"

const EMPTY = { name: "", email: "", subject: "", message: "" }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-foreground mb-1.5">{label}</span>
      {children}
    </label>
  )
}

/** The message form on the Contact page. Messages land in Admin → Contact Messages. */
export function ContactForm() {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSending(true)
    try {
      await api.messages.send(form)
      setSent(true)
      setForm(EMPTY)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <CheckCircle className="w-14 h-14 text-emerald-500" />
        <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p
          role="alert"
          className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Your Name">
          <input type="text" required minLength={2} value={form.name} onChange={set("name")} className={inputClass} />
        </Field>
        <Field label="Email Address">
          <input type="email" required value={form.email} onChange={set("email")} className={inputClass} />
        </Field>
      </div>

      <Field label="Subject">
        <input
          type="text"
          required
          minLength={3}
          value={form.subject}
          onChange={set("subject")}
          placeholder="How can we help?"
          className={inputClass}
        />
      </Field>

      <Field label="Message">
        <textarea
          required
          minLength={10}
          rows={6}
          value={form.message}
          onChange={set("message")}
          placeholder="Write your message here..."
          className={`${inputClass} resize-none`}
        />
      </Field>

      <button
        type="submit"
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {sending && <Loader2 className="w-4 h-4 animate-spin" />}
        {sending ? "Sending…" : "Send Message"}
      </button>
    </form>
  )
}
