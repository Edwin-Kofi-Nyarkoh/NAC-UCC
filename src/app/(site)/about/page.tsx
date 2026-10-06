import type { Metadata } from "next"
import Image from "next/image"
import { Target, Eye, Heart, Users, BookOpen, Globe } from "lucide-react"
import { Initials } from "@/components/ui/initials"
import { SectionLabel } from "@/components/layout/section-label"
import { cloudinaryUrl } from "@/lib/cloudinary"
import { getSiteSettings, serverFetch } from "@/lib/server-api"
import { cn } from "@/lib/utils"
import type { Leader } from "@/types"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the New Apostolic Church UCC Campus Congregation — our history, vision, mission, and leadership.",
}

const values = [
  { icon: BookOpen, title: "Scripture", desc: "We are a Word-centred church, rooted in the truth of the Bible." },
  { icon: Heart, title: "Love", desc: "We love God with all our hearts and our neighbours as ourselves." },
  { icon: Users, title: "Community", desc: "We build authentic relationships and care for one another." },
  { icon: Globe, title: "Mission", desc: "We are called to reach the lost and make disciples of all nations." },
]

// The history, vision, mission and timeline are written under Admin → Site
// Settings, and the leaders under Admin → Leaders. A section only appears once
// it has content.
export default async function AboutPage() {
  const [settings, leaderData] = await Promise.all([
    getSiteSettings(),
    serverFetch<{ leaders: Leader[] }>("/leaders"),
  ])
  const { history, vision, mission, timeline } = settings.about
  const leaders = leaderData?.leaders ?? []

  const statements = [
    { icon: Eye, title: "Our Vision", text: vision },
    { icon: Target, title: "Our Mission", text: mission },
  ].filter((statement) => statement.text)

  return (
    <div className="pt-20">
      <section className="py-20 lg:py-28 bg-navy-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-navy-900 to-navy-950 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 30% 60%, oklch(0.52 0.17 253) 0%, transparent 50%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <SectionLabel>Our Story</SectionLabel>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">About NAC UCC</h1>
            <p className="text-silver-300 text-lg leading-relaxed max-w-2xl">
              A vibrant, Spirit-filled congregation planted on the University of Cape Coast campus,
              committed to worshipping God, growing in His Word, and serving the campus community.
            </p>
          </div>
        </div>
      </section>

      {(history || timeline.length > 0) && (
        <>
          <section id="history" className="py-20 lg:py-28 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={cn("grid gap-16 items-start", history && timeline.length > 0 && "lg:grid-cols-2")}>
                {history && (
                  <div>
                    <SectionLabel>Our History</SectionLabel>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">A Church Born on Campus</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{history}</p>
                  </div>
                )}

                {timeline.length > 0 && (
                  <ol className="space-y-6">
                    {timeline.map(({ year, event }, i) => (
                      <li key={`${year}-${i}`} className="flex gap-5">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {i + 1}
                          </div>
                          {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                        </div>
                        <div className="pb-6">
                          <span className="text-primary font-bold text-sm">{year}</span>
                          <p className="text-foreground mt-1 leading-relaxed text-sm">{event}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </section>
          <div className="h-px w-full bg-border" />
        </>
      )}

      <section id="vision" className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionLabel centered>Purpose</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {statements.length > 0 ? "Vision & Mission" : "What We Value"}
            </h2>
          </div>

          {statements.length > 0 && (
            <div className={cn("grid gap-8 max-w-4xl mx-auto mb-20", statements.length > 1 && "md:grid-cols-2")}>
              {statements.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-card border border-border rounded-3xl p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {leaders.length > 0 && (
        <section id="leadership" className="py-20 lg:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <SectionLabel centered>Leadership</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Meet Our Leaders</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Servants of God called to shepherd the NAC UCC congregation with wisdom, humility, and love.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {leaders.map((leader) => (
                <div
                  key={leader.id}
                  className="group text-center p-6 bg-card border border-border rounded-3xl hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  {leader.imagePublicId ? (
                    <Image
                      src={cloudinaryUrl(leader.imagePublicId, { width: 160, height: 160, gravity: "face" })}
                      alt={leader.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all"
                    />
                  ) : (
                    <Initials
                      name={leader.name}
                      className="w-20 h-20 mx-auto mb-4 font-bold text-lg ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all"
                    />
                  )}
                  <h3 className="font-bold text-foreground mb-1">{leader.name}</h3>
                  <p className="text-primary text-sm font-medium mb-3">{leader.title}</p>
                  {leader.bio && <p className="text-muted-foreground text-xs leading-relaxed">{leader.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
