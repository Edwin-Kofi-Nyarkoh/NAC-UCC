"use client"

import { useEffect } from "react"
import { Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

// The inputs, banners and dialog used by every dashboard form, so they all
// look and behave the same.

export const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"

interface FieldProps {
  label: string
  /** A line of guidance under the input */
  hint?: string
  children: React.ReactNode
}

/** A label wrapped around its input, so clicking the label focuses the input. */
export function Field({ label, hint, children }: FieldProps) {
  return (
    <div>
      <label className="block">
        <span className="block text-sm font-semibold text-foreground mb-1.5">{label}</span>
        {children}
      </label>
      {hint && <p className="text-muted-foreground text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: "text" | "email" | "password" | "date" | "url" | "number"
  placeholder?: string
  hint?: string
  /** Fixed-width text, for IDs and account numbers */
  mono?: boolean
}

export function TextField({ label, value, onChange, type = "text", placeholder, hint, mono }: TextFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={type === "number" ? "any" : undefined}
        className={cn(inputClass, mono && "font-mono")}
      />
    </Field>
  )
}

interface TextAreaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  hint?: string
}

export function TextAreaField({ label, value, onChange, rows = 3, placeholder, hint }: TextAreaFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, "resize-y")}
      />
    </Field>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  hint?: string
}

export function SelectField({ label, value, onChange, options, hint }: SelectFieldProps) {
  return (
    <Field label={label} hint={hint}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

/** A red box for a message the user needs to act on. Renders nothing without a message. */
export function ErrorBanner({ message, className }: { message?: string | null; className?: string }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={cn(
        "p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm",
        className
      )}
    >
      {message}
    </div>
  )
}

/** The centred spinner shown while a page's data loads. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> {label}
    </div>
  )
}

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  /** Shows a spinner and blocks further clicks */
  busy?: boolean
  disabled?: boolean
  className?: string
}

export function PrimaryButton({ children, onClick, type = "button", busy, disabled, className }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

interface DialogProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

/** A modal dialog. Closes on Escape, on the × button, or by clicking outside it. */
export function Dialog({ title, onClose, children }: DialogProps) {
  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="font-bold text-foreground text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
