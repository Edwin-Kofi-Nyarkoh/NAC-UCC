import type { Metadata } from "next"
import Link from "next/link"
import { Stethoscope } from "lucide-react"
import { serverFetch } from "@/lib/server-api"
import type { MedicalPost } from "@/types"
import { MedicalFilter } from "./medical-filter"
import { SectionLabel } from "@/components/layout/section-label"

export const metadata: Metadata = {
  title: "Health News & Alerts",
  description: "Health tips, screenings, updates, and emergency alerts from the NAC UCC Medical Ministry.",
}

export default async function MedicalNewsPage() {
  const data = await serverFetch<{ posts: MedicalPost[] }>("/medical")
  const posts = data?.posts ?? []

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Health Ministry</SectionLabel>
          <Link href="/medical-ministry" className="text-silver-400 text-sm hover:text-white transition-colors mb-3 inline-block">
            ← Medical Ministry
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Health News & Alerts</h1>
          <p className="text-silver-300 text-lg max-w-2xl">
            Stay informed with health updates, emergency alerts, and wellness tips from our Medical Ministry team.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MedicalFilter posts={posts} />

          {posts.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No health news published yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
