"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"

const GIVING_TYPES = ["Tithe", "Offering", "Alumni", "Other"]

// "unconfirmed": we could not ask Paystack, so we do not know either way
type Outcome = "paid" | "unpaid" | "unconfirmed"

/**
 * The transaction reference Paystack adds to the address when it sends the
 * giver back here (/give?reference=…). It is read in the browser rather than
 * on the server, so the page itself can be served from the cache.
 */
function usePaymentReference(): string | null {
  return useSyncExternalStore(
    () => () => {}, // nothing to listen for: it is read again on every render
    () => new URLSearchParams(window.location.search).get("reference"),
    () => null
  )
}

export function GiveForm() {
  const reference = usePaymentReference()
  const [amount, setAmount] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  // Counts the times the giver has asked us to check with Paystack again
  const [checks, setChecks] = useState(0)
  const [paidAmount, setPaidAmount] = useState<number | null>(null)

  const numAmount = amount ? Number(amount) : 0

  // Back from Paystack — confirm the payment with the server before thanking anyone.
  useEffect(() => {
    if (!reference) return
    let cancelled = false
    api.give
      .verify(reference)
      .then((res) => {
        if (cancelled) return
        setPaidAmount(res.amount ?? null)
        setOutcome(res.paid ? "paid" : "unpaid")
      })
      .catch(() => {
        // The check itself failed (no connection, or Paystack unreachable).
        // That is not a failed payment, and must not be reported as one.
        if (!cancelled) setOutcome("unconfirmed")
      })
    return () => {
      cancelled = true
    }
  }, [reference, checks])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!numAmount || numAmount < 1) { setError("Please enter a valid amount."); return }
    if (!selectedType) { setError("Please select a giving type."); return }
    if (!email) { setError("Please enter your email address."); return }

    setLoading(true)
    try {
      const { authorizationUrl } = await api.give.start({
        email,
        amount: numAmount,
        type: selectedType,
        name: `${firstName} ${lastName}`.trim() || undefined,
      })
      // Hand over to Paystack's hosted checkout; it returns to /give?reference=…
      window.location.assign(authorizationUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed to initialise. Please try again.")
      setLoading(false)
    }
  }

  function reset() {
    setOutcome(null)
    setAmount("")
    setSelectedType(null)
    // Drop ?reference=… so a refresh does not re-verify the old payment
    window.history.replaceState(null, "", "/give")
  }

  // Back from Paystack, and the server has not answered yet
  if (reference && !outcome) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
        <p className="text-sm">Confirming your payment…</p>
      </div>
    )
  }

  if (outcome === "paid") {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
        <p className="text-muted-foreground text-sm">
          {paidAmount
            ? `Your gift of GH₵${paidAmount.toFixed(2)} has been received. God bless you!`
            : "Your gift has been received. God bless you!"}
        </p>
        <button
          onClick={reset}
          className="mt-6 px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Give Again
        </button>
      </div>
    )
  }

  if (outcome === "unconfirmed") {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">We Could Not Confirm Your Payment Yet</h3>
        <p className="text-muted-foreground text-sm">
          This does not mean it failed. If you completed the payment, Paystack has it and will email you a receipt.
          Check your connection, then check again.
        </p>
        <button
          onClick={() => {
            setOutcome(null)
            setChecks((count) => count + 1)
          }}
          className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Check Again
        </button>
      </div>
    )
  }

  if (outcome === "unpaid") {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">Payment Not Completed</h3>
        <p className="text-muted-foreground text-sm">
          We could not confirm this payment, so you have not been charged by us. You can try again or use the bank transfer details.
        </p>
        <button
          onClick={reset}
          className="mt-6 px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Make a Gift</h2>

      {error && (
        <p className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
          {error}
        </p>
      )}

      {/* Amount */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Amount (GH₵)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">GH₵</span>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-14 pr-4 py-3.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-lg font-semibold"
          />
        </div>
      </div>

      {/* Giving type */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-foreground mb-2">Giving Type</label>
        <div className="grid grid-cols-2 gap-2">
          {GIVING_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                "px-4 py-3 rounded-xl border text-sm font-medium transition-colors",
                selectedType === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Personal info */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              placeholder="Kwame"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              placeholder="Mensah"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            placeholder="kwame@example.com"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Opening payment…" : "Proceed to Payment"}
      </button>
      <p className="text-center text-muted-foreground text-xs mt-3">
        Secured by Paystack · All amounts in Ghana Cedis (GH₵)
      </p>
    </form>
  )
}
