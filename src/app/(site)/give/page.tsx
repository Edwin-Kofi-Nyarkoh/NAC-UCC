import type { Metadata } from "next"
import { Heart, Shield, Repeat, CreditCard, Building2 } from "lucide-react"
import { GiveForm } from "@/components/give/give-form"
import { BankDetailsCopy } from "@/components/give/bank-details-copy"
import { getSiteSettings } from "@/lib/server-api"

export const metadata: Metadata = {
  title: "Give",
  description: "Support the ministry of NAC UCC Campus Congregation through your generous giving.",
}

const givingReasons = [
  { icon: Heart, title: "Support Our Ministries", desc: "Fund youth programmes, outreach, and discipleship initiatives on campus." },
  { icon: Shield, title: "Building Maintenance", desc: "Help maintain and improve our chapel and ministry facilities." },
  { icon: Repeat, title: "Community Impact", desc: "Enable mercy and relief activities serving students and families in need." },
  { icon: CreditCard, title: "Safe & Secure", desc: "All online transactions are processed securely through Paystack." },
]

export default async function GivePage() {
  const { bank } = await getSiteSettings()

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-gold text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Heart className="w-3.5 h-3.5" /> Partner with Us
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Give & Support</h1>
          <p className="text-silver-300 text-lg max-w-2xl mx-auto">
            Your generous giving fuels the mission of NAC UCC. Every contribution, big or small, makes a lasting difference.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* After checkout Paystack returns to /give?reference=…; the form reads that itself */}
            <GiveForm />

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Why Your Gift Matters</h2>
              <p className="text-muted-foreground leading-relaxed">
                <em className="font-medium text-foreground not-italic">&ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;</em>
                {" "}— 2 Corinthians 9:7
              </p>
              <div className="space-y-4 mt-6">
                {givingReasons.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shown once the account is entered under Admin → Site Settings */}
              {bank && (
                <div className="bg-navy-950 text-white rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Building2 className="w-4 h-4 text-gold" />
                    <h3 className="font-bold text-sm text-gold uppercase tracking-wide">Bank Transfer Details</h3>
                  </div>
                  <dl className="space-y-3 text-sm">
                    {[
                      { label: "Bank", value: bank.bankName },
                      { label: "Account Name", value: bank.accountName },
                      { label: "Account No.", value: bank.accountNo, mono: true },
                      { label: "Branch", value: bank.branch },
                    ].map(({ label, value, mono }) => (
                      <div key={label} className="flex items-center justify-between gap-4">
                        <dt className="text-silver-400 shrink-0">{label}:</dt>
                        <dd className={mono ? "font-mono font-semibold tracking-wider" : "font-medium text-right"}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <BankDetailsCopy accountNo={bank.accountNo} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
