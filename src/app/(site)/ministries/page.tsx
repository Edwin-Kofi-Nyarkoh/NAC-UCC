import type { Metadata } from "next"
import Link from "next/link"
import { Clock, Users, ArrowRight, Calendar } from "lucide-react"
import { SectionLabel } from "@/components/layout/section-label"
import { serverFetch } from "@/lib/server-api"
import type { Ministry } from "@/types"

export const metadata: Metadata = {
  title: "Ministries",
  description: "Explore the active ministries of NAC UCC Campus Congregation.",
}

// Ministries are added under Admin → Ministries.
export default async function MinistriesPage() {
  const data = await serverFetch<{ ministries: Ministry[] }>("/ministries")
  const ministries = data?.ministries ?? []

  return (
    <div className="pt-20">
      <section className="py-20 lg:py-28 bg-navy-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 70% 40%, oklch(0.52 0.17 253) 0%, transparent 50%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Serving Together</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Ministries</h1>
          <p className="text-silver-300 text-lg max-w-2xl">
            At NAC UCC, every member has a place to grow, serve, and belong. Discover the ministry made for you.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {ministries.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg">Our ministries will be listed here soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ministries.map((ministry) => (
                <Link
                  key={ministry.id}
                  href={`/ministries/${ministry.slug}`}
                  className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  <div className="h-2 bg-linear-to-r from-primary via-navy-500 to-primary/60" />
                  <div className="p-7">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {ministry.name}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4">
                      {ministry.description}
                    </p>

                    {(ministry.meetingDay || ministry.leader) && (
                      <div className="space-y-2 mb-6 pt-4 border-t border-border">
                        {ministry.leader && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-medium">{ministry.leader}</span>
                          </div>
                        )}
                        {ministry.meetingDay && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>{ministry.meetingDay}</span>
                            {ministry.meetingTime && (
                              <>
                                <Clock className="w-3.5 h-3.5 shrink-0 ml-2" />
                                <span className="font-mono">{ministry.meetingTime}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold group-hover:gap-2.5 transition-all">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
