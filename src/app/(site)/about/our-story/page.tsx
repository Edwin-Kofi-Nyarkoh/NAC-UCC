import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { ArticleBody } from "@/components/content/article-body"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { SectionLabel } from "@/components/layout/section-label"
import { ShareButton } from "@/components/ui/share-button"
import { getSiteSettings } from "@/lib/server-api"

export const metadata: Metadata = {
  title: "Our Story",
  description: "How the New Apostolic Church UCC Campus Congregation was established, and how it has grown.",
}

// A page for reading: the long account of how the congregation began. It is
// written under Admin → Site Settings → About Page ("Our full story"), and the
// About page links here once it is. Until then this page does not exist.
export default async function OurStoryPage() {
  const { story } = (await getSiteSettings()).about
  if (!story) notFound()

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb className="mb-6" />
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-silver-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> About NAC UCC
          </Link>
          <SectionLabel>Our Story</SectionLabel>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">How NAC UCC Began</h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ArticleBody text={story} />
          <div className="mt-10 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to About
            </Link>
            <ShareButton title="How NAC UCC Began" />
          </div>
        </div>
      </section>
    </div>
  )
}
