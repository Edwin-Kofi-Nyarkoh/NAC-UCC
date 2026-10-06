"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check } from "lucide-react"
import { CollectionManager } from "@/components/dashboard/collection-manager"
import { ErrorBanner } from "@/components/dashboard/form-fields"
import { MediaField } from "@/components/dashboard/media-field"
import { api, type MediaInfo } from "@/lib/api"
import { HERO_VIDEO_SECONDS } from "@/lib/hero-media"
import type { HeroSlide } from "@/types"

// The banner at the top of the home page: its fallback picture, and the photos
// and videos that play over it.
export default function AdminHeroSlidesPage() {
  return (
    <CollectionManager<HeroSlide>
      title="Home Page Banner"
      description="The photos and videos behind the welcome at the top of the home page. They play in the order shown here."
      noun="slide"
      resource={api.heroSlides}
      media={{
        label: "Photo or video",
        allowVideo: true,
        required: true,
        hint: `Landscape works best. Of a video, the first ${HERO_VIDEO_SECONDS} seconds are played, without sound.`,
      }}
      mediaOf={(slide) => ({ publicId: slide.publicId, type: slide.type, width: 0, height: 0 })}
      fields={[
        {
          name: "title",
          label: "Headline",
          placeholder: "e.g. Harvest Thanksgiving this Sunday",
          hint: "Optional. Without one, the standard welcome is shown over this slide.",
        },
        { name: "subtitle", label: "Supporting line", hint: "Optional" },
        { name: "ctaLabel", label: "Button text", placeholder: "e.g. Join Us This Sunday", hint: "Optional" },
        {
          name: "ctaHref",
          label: "Button link",
          placeholder: "/events",
          hint: "A page on this site, starting with /. Needed if there is button text.",
        },
      ]}
      toInput={(values, media) => ({
        title: values.title,
        subtitle: values.subtitle,
        ctaLabel: values.ctaLabel,
        ctaHref: values.ctaHref,
        publicId: media?.publicId,
        type: media?.type,
      })}
      summarise={(slide) => ({
        title: slide.title || (slide.type === "video" ? "Video (standard welcome)" : "Photo (standard welcome)"),
        subtitle: slide.type === "video" ? `Video${slide.subtitle ? ` · ${slide.subtitle}` : ""}` : slide.subtitle,
      })}
    >
      <FallbackPicture />
    </CollectionManager>
  )
}

/**
 * The picture visitors see first, while the slide itself is still downloading.
 * It is saved as soon as it is chosen or removed.
 */
function FallbackPicture() {
  const queryClient = useQueryClient()
  const { data: settings, error: loadError } = useQuery({ queryKey: ["settings"], queryFn: api.settings.get })

  const save = useMutation({
    mutationFn: (picture: MediaInfo | null) => api.settings.save("hero", { fallbackImage: picture?.publicId ?? "" }),
    onSuccess: (saved) => queryClient.setQueryData(["settings"], saved),
  })

  const publicId = settings?.hero.fallbackImage

  return (
    <section className="bg-card border border-border rounded-2xl p-6 mb-8">
      <h2 className="font-bold text-foreground">Fallback picture</h2>
      <p className="text-muted-foreground text-sm mt-1 mb-4">
        Shown at once, softly, while a slide&apos;s photo or video is still loading — and on its own if there are no
        slides. Choose one good landscape photo of the congregation or the chapel.
      </p>

      <ErrorBanner message={loadError?.message ?? save.error?.message} className="mb-4" />

      {settings && (
        <MediaField
          label="Picture"
          value={publicId ? { publicId, type: "image", width: 0, height: 0 } : null}
          onChange={(picture) => save.mutate(picture)}
        />
      )}

      {save.isPending && <p className="text-sm text-muted-foreground mt-3">Saving…</p>}
      {save.isSuccess && (
        <p className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 mt-3">
          <Check className="w-4 h-4" /> {publicId ? "Saved" : "Removed"}
        </p>
      )}

      <h2 className="font-bold text-foreground mt-8">Slides</h2>
      <p className="text-muted-foreground text-sm mt-1">
        Number 1 is shown first. A photo stays up for a few seconds; a video plays through, then the next slide
        follows. Visitors who have asked their phone to save data, or are on a very slow connection, see still
        pictures instead of video.
      </p>
    </section>
  )
}
