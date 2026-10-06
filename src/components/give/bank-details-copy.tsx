"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function BankDetailsCopy({ accountNo }: { accountNo: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(accountNo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt("Copy account number:", accountNo)
    }
  }

  return (
    <button
      onClick={copy}
      className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-xs font-medium transition-colors"
    >
      {copied ? (
        <><Check className="w-3.5 h-3.5 text-emerald-400" /> Account number copied!</>
      ) : (
        <><Copy className="w-3.5 h-3.5" /> Copy account number</>
      )}
    </button>
  )
}
