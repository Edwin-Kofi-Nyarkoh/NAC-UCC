"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { MediaLightbox } from "@/components/content/media-lightbox"
import { cloudinaryUrl, cloudinaryVideoPoster } from "@/lib/cloudinary"
import { cn } from "@/lib/utils"
import type { GalleryItem } from "@/types"

const ALL = "All"

/** The gallery's photo wall, with a filter per category and a full-screen view. */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [category, setCategory] = useState(ALL)
  const [open, setOpen] = useState<GalleryItem | null>(null)

  const categories = [ALL, ...new Set(items.flatMap((item) => (item.category ? [item.category] : [])))]
  const visible = category === ALL ? items : items.filter((item) => item.category === category)

  return (
    <>
      {open && (
        <MediaLightbox item={open} alt={open.caption ?? "Gallery photo"} onClose={() => setOpen(null)} />
      )}

      {/* The filter is only worth showing when there is more than one category */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((name) => (
            <button
              key={name}
              onClick={() => setCategory(name)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                category === name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpen(item)}
            aria-label={`Open ${item.caption ?? item.type}`}
            className="block w-full break-inside-avoid group relative overflow-hidden rounded-2xl bg-muted border border-border hover:shadow-xl transition-all duration-300 text-left"
          >
            <Image
              // A video is shown by its first frame until it is opened
              src={
                item.type === "image"
                  ? cloudinaryUrl(item.publicId, { width: 600, crop: "scale" })
                  : cloudinaryVideoPoster(item.publicId, { width: 600 })
              }
              alt={item.caption ?? "Gallery photo"}
              width={item.width}
              height={item.height}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {item.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
            )}
            {(item.caption || item.category) && (
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                {item.caption && <p className="text-white font-semibold text-sm">{item.caption}</p>}
                {item.category && <span className="text-white/60 text-xs">{item.category}</span>}
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  )
}
