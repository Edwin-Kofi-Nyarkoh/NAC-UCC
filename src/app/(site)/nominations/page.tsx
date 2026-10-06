import type { Metadata } from "next"
import { serverFetch } from "@/lib/server-api"
import { NominationForm } from "./nomination-form"
import { SectionLabel } from "@/components/layout/section-label"

export const metadata: Metadata = {
  title: "Student Leadership Nominations",
  description: "Nominate members for student leadership positions in the NAC UCC Campus Congregation.",
}

interface Position {
  id: string
  title: string
  description: string | null
}

export default async function NominationsPage() {
  const data = await serverFetch<{ positions: Position[] }>("/nominations/positions")
  const positions = data?.positions ?? []

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Leadership</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Student Leadership<br />Nominations</h1>
          <p className="text-silver-300 text-lg leading-relaxed max-w-2xl">
            Nominate a fellow member for a leadership position. Each member may nominate one person per role.
            Your submission is identified by your student index number to ensure fairness.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {positions.length === 0 ? (
            <div className="text-center py-20 border border-border rounded-3xl bg-card">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">🗳️</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Nominations are not open yet</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Check back when the nomination period begins. Positions will appear here once available.
              </p>
            </div>
          ) : (
            <NominationForm positions={positions} />
          )}
        </div>
      </section>
    </div>
  )
}
