"use client"

import { useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { cloudinaryUrl, cloudinaryVideoUrl, cloudinaryVideoPoster } from "@/lib/cloudinary"
import type { MediaItem } from "@/types"

interface MediaLightboxProps {
  item: MediaItem
  /** Describes the photo for screen readers */
  alt: string
  onClose: () => void
}

/** Shows one photo or video full-screen. Closes on Escape or a click outside it. */
export function MediaLightbox({ item, alt, onClose }: MediaLightboxProps) {
  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        aria-label="Close"
        className="absolute top-4 right-4 text-white/70 hover:text-white"
        onClick={onClose}
      >
        <X className="w-7 h-7" />
      </button>

      {item.type === "image" ? (
        <div
          className="relative max-w-4xl w-full max-h-[85vh] aspect-video"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={cloudinaryUrl(item.publicId, { width: 1600, crop: "fit" })}
            alt={alt}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-contain rounded-xl"
          />
        </div>
      ) : (
        <video
          src={cloudinaryVideoUrl(item.publicId)}
          poster={cloudinaryVideoPoster(item.publicId)}
          controls
          autoPlay
          className="max-w-4xl w-full max-h-[85vh] rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  )
}
