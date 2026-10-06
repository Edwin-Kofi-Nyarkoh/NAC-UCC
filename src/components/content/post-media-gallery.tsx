"use client"

import Image from "next/image"
import { useState } from "react"
import { Play } from "lucide-react"
import { MediaLightbox } from "@/components/content/media-lightbox"
import { cloudinaryUrl, cloudinaryVideoPoster } from "@/lib/cloudinary"
import { cn } from "@/lib/utils"
import type { MediaItem } from "@/types"

interface PostMediaGalleryProps {
  imagePublicId?: string | null
  mediaItems?: MediaItem[] | null
  title: string
}

/** The photos and videos at the top of an article: up to three, the first one largest. */
export function PostMediaGallery({ imagePublicId, mediaItems, title }: PostMediaGalleryProps) {
  const [open, setOpen] = useState<MediaItem | null>(null)

  // Older posts only have a single featured image
  const items: MediaItem[] =
    mediaItems && mediaItems.length > 0
      ? mediaItems.slice(0, 3)
      : imagePublicId
        ? [{ type: "image", publicId: imagePublicId }]
        : []

  if (items.length === 0) return null

  return (
    <>
      {open && <MediaLightbox item={open} alt={title} onClose={() => setOpen(null)} />}

      <div
        className={cn(
          "mb-10 gap-2 grid rounded-3xl overflow-hidden",
          items.length === 2 && "grid-cols-2",
          items.length === 3 && "grid-cols-3"
        )}
      >
        {items.map((item, i) => {
          const isFirst = i === 0
          return (
            <button
              key={`${item.publicId}-${i}`}
              type="button"
              aria-label={`Open ${item.type} ${i + 1} of ${items.length}`}
              onClick={() => setOpen(item)}
              className={cn(
                "relative group",
                isFirst && items.length === 1 ? "aspect-video" : "aspect-square",
                isFirst && items.length === 3 && "col-span-2"
              )}
            >
              <Image
                // A video is shown by its first frame until it is opened
                src={
                  item.type === "image"
                    ? cloudinaryUrl(item.publicId, { width: isFirst ? 800 : 400, height: isFirst ? 500 : 400 })
                    : cloudinaryVideoPoster(item.publicId, { width: 800 })
                }
                alt={items.length === 1 ? title : `${title} ${i + 1}`}
                fill
                sizes={isFirst ? "(max-width: 768px) 100vw, 768px" : "(max-width: 768px) 50vw, 256px"}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
