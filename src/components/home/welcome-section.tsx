import Link from "next/link"
import { BookOpen, Heart, Users } from "lucide-react"
import { SectionLabel } from "@/components/layout/section-label"

const pillars = [
  {
    icon: BookOpen,
    title: "The Word",
    description: "Grounded in Scripture, we preach and teach the uncompromised Word of God every week.",
  },
  {
    icon: Heart,
    title: "Worship",
    description: "We gather to honour God in spirit and in truth through anointed praise and heartfelt prayer.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Belonging matters. From students to families, everyone has a home in NAC UCC.",
  },
]

export function WelcomeSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <SectionLabel>Welcome Home</SectionLabel>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              You Are Welcome to{" "}
              <span className="text-primary">NAC UCC</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              The New Apostolic Church — University of Cape Coast Campus Congregation is a
              Spirit-filled community dedicated to glorifying God, nurturing believers, and
              reaching the lost on and around the UCC campus.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Whether you are a student, staff member, or a family nearby, our doors are always
              open. Come as you are — grow as God intends.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Our Story
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
              >
                Find Us
              </Link>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid gap-6">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-5 p-6 rounded-2xl bg-muted/50 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
