import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, ArrowRight, Heart, Stethoscope, Users } from "lucide-react"
import { serverFetch } from "@/lib/server-api"
import type { MedicalPost } from "@/types"
import { formatDate, categoryLabel } from "@/lib/utils"
import { SectionLabel } from "@/components/layout/section-label"

export const metadata: Metadata = {
  title: "Medical Ministry",
  description: "NAC UCC Medical Ministry — promoting holistic health and wellbeing for the congregation and UCC community.",
}

const pillars = [
  { icon: Heart, title: "Holistic Care", desc: "We believe in caring for the whole person — body, mind, and spirit — as an expression of God's love." },
  { icon: Stethoscope, title: "Free Screenings", desc: "Regular free health screenings open to all students, staff, and congregation members on campus." },
  { icon: Users, title: "Health Education", desc: "Practical health talks, seminars, and resources to empower the community with medical knowledge." },
]

export default async function MedicalMinistryPage() {
  const data = await serverFetch<{ posts: MedicalPost[] }>("/medical")
  const posts = data?.posts ?? []

  const emergency = posts.filter((p) => p.category === "EMERGENCY")
  const recent = posts.filter((p) => p.category !== "EMERGENCY").slice(0, 3)

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 bg-navy-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Health & Wellbeing</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 max-w-2xl">Medical Ministry</h1>
          <p className="text-silver-300 text-lg max-w-2xl leading-relaxed">
            Caring for the congregation and UCC community through free health screenings, medical education, and emergency response — because a healthy body serves God better.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href="/medical-ministry/news"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Health News & Alerts <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              Contact the Team
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency alerts */}
      {emergency.length > 0 && (
        <section className="bg-red-600 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm uppercase tracking-wide mb-2">Emergency Health Alert</p>
                <div className="space-y-2">
                  {emergency.map((p) => (
                    <Link
                      key={p.id}
                      href={`/medical-ministry/news/${p.slug}`}
                      className="block text-white/90 text-sm hover:text-white hover:underline transition-colors"
                    >
                      → {p.title} <span className="text-white/60 text-xs">({formatDate(p.createdAt)})</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pillars */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-border bg-muted/30 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* About the Ministry */}
          <div className="max-w-3xl mb-16">
            <div>
              <SectionLabel>About Us</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-5">
                Serving Body & Soul
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The NAC UCC Medical Ministry is a team of dedicated healthcare professionals and volunteers within the congregation committed to providing health services to our community.
                </p>
                <p>
                  We partner with the UCC Health Centre and local hospitals to organise free screenings for blood pressure, blood sugar, malaria, and more. We also provide first-aid support during church programmes and campus events.
                </p>
                <p>
                  Our ministry operates under the guidance of the Medical Minister, appointed by the congregation leadership, and welcomes all medical and healthcare students and professionals.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-6 text-primary font-semibold text-sm hover:gap-3 transition-all"
              >
                Join the Medical Ministry <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recent health news */}
          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Latest Health News</h2>
                <Link href="/medical-ministry/news" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {recent.map((post) => (
                  <Link
                    key={post.id}
                    href={`/medical-ministry/news/${post.slug}`}
                    className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                  >
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full mb-3 capitalize">
                      {categoryLabel(post.category)}
                    </span>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs mt-3">{formatDate(post.createdAt)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {posts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Health news and updates will appear here once published by the Medical Ministry.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
