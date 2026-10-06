import type { Metadata } from "next"
import { ImageIcon } from "lucide-react"
import { GalleryGrid } from "@/components/gallery/gallery-grid"
import { SectionLabel } from "@/components/layout/section-label"
import { serverFetch } from "@/lib/server-api"
import type { GalleryItem } from "@/types"

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos from services, outreach and fellowship at NAC UCC Campus Congregation.",
}

// Photos and videos are added under Admin → Gallery.
export default async function GalleryPage() {
  const data = await serverFetch<{ items: GalleryItem[] }>("/gallery")
  const items = data?.items ?? []

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Moments</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-silver-300 text-lg max-w-2xl">
            Snapshots of God&apos;s faithfulness in our community — services, outreach, fellowship, and more.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg">Photos will appear here soon.</p>
            </div>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </section>
    </div>
  )
}
