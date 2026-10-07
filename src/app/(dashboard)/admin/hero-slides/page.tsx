"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check } from "lucide-react"
import { CollectionManager } from "@/components/dashboard/collection-manager"
import { ErrorBanner, PrimaryButton, TextField } from "@/components/dashboard/form-fields"
import { MediaField } from "@/components/dashboard/media-field"
import { api } from "@/lib/api"
import { HERO_VIDEO_SECONDS } from "@/lib/hero-media"
import type { HeroSettings } from "@/lib/site-settings"
import type { HeroSlide } from "@/types"

// The banner at the top of the home page: its fallback picture and words, and
// the photos and videos that play over it.
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
          hint: "Optional. Without one, the banner's own words are shown over this slide.",
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
      <Fallback />
    </CollectionManager>
  )
}

type Words = Pick<HeroSettings, "title" | "subtitle" | "ctaLabel" | "ctaHref">

/**
 * What the banner shows of its own: the picture visitors see first, while a
 * slide is still downloading, and the words over it.
 */
function Fallback() {
  const queryClient = useQueryClient()
  const { data: settings, error: loadError } = useQuery({ queryKey: ["settings"], queryFn: api.settings.get })
  // What the last save did, to say so beside the part that was saved
  const [saved, setSaved] = useState<"picture" | "words" | null>(null)

  const save = useMutation({
    mutationFn: (hero: HeroSettings) => api.settings.save("hero", hero),
    onSuccess: (all) => queryClient.setQueryData(["settings"], all),
  })

  const hero = settings?.hero

  /** Saves one part of the banner's settings, leaving the rest as they are. */
  function change(part: Partial<HeroSettings>, what: "picture" | "words") {
    if (!hero) return
    setSaved(null)
    save.mutate({ ...hero, ...part }, { onSuccess: () => setSaved(what) })
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6 mb-8">
      <h2 className="font-bold text-foreground">Fallback picture</h2>
      <p className="text-muted-foreground text-sm mt-1 mb-4">
        Shown at once, softly, while a slide&apos;s photo or video is still loading — and on its own if there are no
        slides. Choose one good landscape photo of the congregation or the chapel.
      </p>

      <ErrorBanner message={loadError?.message ?? save.error?.message} className="mb-4" />

      {hero && (
        // The picture is saved as soon as it is chosen or removed
        <MediaField
          label="Picture"
          value={hero.fallbackImage ? { publicId: hero.fallbackImage, type: "image", width: 0, height: 0 } : null}
          onChange={(picture) => change({ fallbackImage: picture?.publicId ?? "" }, "picture")}
        />
      )}
      {save.isPending && <p className="text-sm text-muted-foreground mt-3">Saving…</p>}
      {saved === "picture" && <SavedNote className="mt-3">{hero?.fallbackImage ? "Saved" : "Removed"}</SavedNote>}

      {hero && (
        <FallbackWords
          // Start again from what is stored whenever that changes
          key={[hero.title, hero.subtitle, hero.ctaLabel, hero.ctaHref].join("\n")}
          stored={hero}
          busy={save.isPending}
          saved={saved === "words"}
          onSave={(words) => change(words, "words")}
        />
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

function SavedNote({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 ${className}`}>
      <Check className="w-4 h-4" /> {children}
    </p>
  )
}

interface FallbackWordsProps {
  stored: Words
  busy: boolean
  saved: boolean
  onSave: (words: Words) => void
}

/** The banner's own headline, line and button: the same four boxes a slide has. */
function FallbackWords({ stored, busy, saved, onSave }: FallbackWordsProps) {
  const [words, setWords] = useState<Words>({
    title: stored.title,
    subtitle: stored.subtitle,
    ctaLabel: stored.ctaLabel,
    ctaHref: stored.ctaHref,
  })
  const set = (field: keyof Words) => (value: string) => setWords((current) => ({ ...current, [field]: value }))
  const changed = (Object.keys(words) as (keyof Words)[]).some((field) => words[field] !== stored[field])

  return (
    <div className="mt-8 space-y-4">
      <div>
        <h2 className="font-bold text-foreground">Words on the banner</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Shown over the fallback picture, and over any slide that has no headline of its own. Leave a box empty to
          keep the standard wording.
        </p>
      </div>
      <TextField label="Banner headline" value={words.title} onChange={set("title")} placeholder="Welcome to NAC UCC" />
      <TextField
        label="Banner supporting line"
        value={words.subtitle}
        onChange={set("subtitle")}
        placeholder="New Apostolic Church — University of Cape Coast Campus Congregation"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField label="Banner button text" value={words.ctaLabel} onChange={set("ctaLabel")} placeholder="Upcoming Events" />
        <TextField
          label="Banner button link"
          value={words.ctaHref}
          onChange={set("ctaHref")}
          placeholder="/events"
          hint="A page on this site, starting with /."
        />
      </div>
      <div className="flex items-center gap-3">
        <PrimaryButton onClick={() => onSave(words)} busy={busy} disabled={!changed}>
          Save words
        </PrimaryButton>
        {saved && !changed && <SavedNote>Words saved</SavedNote>}
      </div>
    </div>
  )
}
