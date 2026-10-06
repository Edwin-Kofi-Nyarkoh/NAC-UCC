"use client"

import { useState } from "react"
import { CheckCircle, Loader2, ChevronRight, User, Hash, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { NominationReceipt } from "@/types"

interface Position {
  id: string
  title: string
  description: string | null
}

interface NomineeEntry {
  nomineeName: string
  nomineeInfo: string
}

type Step = "identity" | "nominations" | "review" | "done"

export function NominationForm({ positions }: { positions: Position[] }) {
  const [step, setStep] = useState<Step>("identity")
  const [nominatorName, setNominatorName] = useState("")
  const [nominatorId, setNominatorId] = useState("")
  const [entries, setEntries] = useState<Record<string, NomineeEntry>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<NominationReceipt | null>(null)

  function setEntry(positionId: string, field: keyof NomineeEntry, value: string) {
    setEntries((prev) => ({
      ...prev,
      [positionId]: { ...prev[positionId] ?? { nomineeName: "", nomineeInfo: "" }, [field]: value },
    }))
  }

  const filledEntries = Object.entries(entries).filter(([, e]) => e.nomineeName.trim().length >= 2)

  async function handleSubmit() {
    setError("")
    setSubmitting(true)
    try {
      const receipt = await api.nominations.submit({
        nominatorName: nominatorName.trim(),
        nominatorId: nominatorId.trim().toUpperCase(),
        nominations: filledEntries.map(([positionId, entry]) => ({
          positionId,
          nomineeName: entry.nomineeName.trim(),
          nomineeInfo: entry.nomineeInfo.trim() || undefined,
        })),
      })
      setResult(receipt)
      setStep("done")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  // Done state
  if (step === "done" && result) {
    const alreadyVotedTitles = result.alreadyVoted
      .map((id) => positions.find((p) => p.id === id)?.title)
      .filter(Boolean)

    return (
      <div className="text-center py-12 border border-emerald-200 dark:border-emerald-800 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 px-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">Nomination Submitted!</h2>
        <p className="text-emerald-600 dark:text-emerald-400 text-sm mb-4">
          {result.submitted} nomination{result.submitted !== 1 ? "s" : ""} recorded for <strong>{nominatorName}</strong>.
        </p>
        {alreadyVotedTitles.length > 0 && (
          <p className="text-amber-600 dark:text-amber-400 text-xs mt-2">
            Skipped (already voted): {alreadyVotedTitles.join(", ")}
          </p>
        )}
        <p className="text-muted-foreground text-xs mt-4">
          Thank you for participating in the leadership election. May God guide our choices.
        </p>
      </div>
    )
  }

  // Step 1: Identity
  if (step === "identity") {
    const canContinue = nominatorName.trim().length >= 2 && nominatorId.trim().length >= 2

    return (
      <div className="bg-card border border-border rounded-3xl p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Your Details</h2>
          <p className="text-muted-foreground text-sm">
            Enter your name and student index number. Your index number ensures you can only nominate once per position.
          </p>
        </div>

        <div className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name *</span>
            </label>
            <input
              type="text"
              autoFocus
              value={nominatorName}
              onChange={(e) => setNominatorName(e.target.value)}
              placeholder="e.g. Kwame Asante"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Student Index Number *</span>
            </label>
            <input
              type="text"
              value={nominatorId}
              onChange={(e) => setNominatorId(e.target.value)}
              placeholder="e.g. UCC/CS/2022/001"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-muted-foreground text-xs mt-1.5">Used to prevent duplicate submissions. Not shared publicly.</p>
          </div>
        </div>

        <button
          disabled={!canContinue}
          onClick={() => setStep("nominations")}
          className={cn(
            "mt-8 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors",
            canContinue
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Continue to Nominations <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Step 2: Fill nominations
  if (step === "nominations") {
    return (
      <div>
        <div className="mb-6 p-4 rounded-2xl bg-muted/50 border border-border text-sm flex items-start gap-3">
          <User className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">{nominatorName}</p>
            <p className="text-muted-foreground text-xs">{nominatorId.toUpperCase()}</p>
          </div>
          <button
            onClick={() => setStep("identity")}
            className="ml-auto text-xs text-primary underline shrink-0"
          >
            Change
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <div className="text-sm text-muted-foreground mb-2">
            For each position, enter the name of the member you wish to nominate. You may skip any position.
          </div>

          {/* Table header — desktop */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1.2fr] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
            <span>Position</span>
            <span>Nominee Name *</span>
            <span>Extra Info (optional)</span>
          </div>

          {positions.map((pos, i) => {
            const entry = entries[pos.id] ?? { nomineeName: "", nomineeInfo: "" }
            const filled = entry.nomineeName.trim().length >= 2

            return (
              <div
                key={pos.id}
                className={cn(
                  "rounded-2xl border p-4 sm:p-0 sm:rounded-none sm:border-0 sm:border-b sm:grid sm:grid-cols-[1fr_1fr_1.2fr] sm:gap-4 sm:py-4 sm:px-4 transition-colors",
                  filled ? "border-primary/30 bg-primary/5 sm:bg-transparent sm:border-border" : "border-border"
                )}
              >
                {/* Position label */}
                <div className="flex items-start gap-3 mb-3 sm:mb-0 sm:flex-row sm:items-center">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    filled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{pos.title}</p>
                    {pos.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{pos.description}</p>
                    )}
                  </div>
                </div>

                {/* Nominee name */}
                <div>
                  <label className="sm:hidden block text-xs font-semibold text-muted-foreground mb-1">Nominee Name</label>
                  <input
                    type="text"
                    value={entry.nomineeName}
                    onChange={(e) => setEntry(pos.id, "nomineeName", e.target.value)}
                    placeholder="Full name…"
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Nominee info */}
                <div>
                  <label className="sm:hidden block text-xs font-semibold text-muted-foreground mb-1">Department / Year (optional)</label>
                  <input
                    type="text"
                    value={entry.nomineeInfo}
                    onChange={(e) => setEntry(pos.id, "nomineeInfo", e.target.value)}
                    placeholder="Department, year level…"
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {filledEntries.length === 0 && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm mb-5 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Fill in at least one nominee name to proceed.
          </div>
        )}

        <button
          disabled={filledEntries.length === 0}
          onClick={() => setStep("review")}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors",
            filledEntries.length > 0
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Review ({filledEntries.length}) <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Step 3: Review & confirm
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Review Your Nominations</h2>
        <p className="text-muted-foreground text-sm">Please confirm before submitting. This cannot be changed after submission.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-primary" />
          <span className="font-semibold">{nominatorName}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground font-mono text-xs">{nominatorId.toUpperCase()}</span>
        </div>

        <div className="divide-y divide-border">
          {filledEntries.map(([positionId, entry]) => {
            const position = positions.find((p) => p.id === positionId)
            return (
              <div key={positionId} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{position?.title}</p>
                  <p className="font-bold text-foreground">{entry.nomineeName}</p>
                  {entry.nomineeInfo && <p className="text-muted-foreground text-xs">{entry.nomineeInfo}</p>}
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm mb-5 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setStep("nominations")}
          disabled={submitting}
          className="px-5 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          Back & Edit
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Confirm & Submit
        </button>
      </div>
    </div>
  )
}
