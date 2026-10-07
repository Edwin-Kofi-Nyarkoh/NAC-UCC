"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { useInView, usePageVisible, usePrefersReducedMotion, useSaveData } from "@/lib/browser-conditions"
import {
  TALL_SCREEN,
  heroFallback,
  heroPhoto,
  heroVideo,
  heroVideoStill,
  type PictureSources,
} from "@/lib/hero-media"
import type { HeroSettings } from "@/lib/site-settings"
import { cn } from "@/lib/utils"
import type { HeroSlide } from "@/types"

// The banner at the top of the home page.
//
// It is built in layers, cheapest first, so there is always something to look at:
//   1. a plain navy background (no download at all)
//   2. the fallback picture set by the admin: tiny, so it appears almost at once
//   3. the slide's photo, or the first frame of its video
//   4. the video itself, once enough of it has arrived to play
//
// To keep data use down, a slide's files are only fetched when it is that
// slide's turn, the slideshow stops while nobody is looking at it, and visitors
// who have asked to save data (or are on a 2G-class connection) get still
// pictures only.

/** How long a photo stays up. A video stays up until it has played through. */
const PHOTO_SECONDS = 6

// What the banner says when a slide has no headline of its own, or there are no
// slides, unless the admin has written their own words for it
const STANDARD_WELCOME = {
  title: "Welcome to NAC UCC",
  subtitle: "New Apostolic Church — University of Cape Coast Campus Congregation",
  buttons: [
    { label: "Upcoming Events", href: "/events" },
    { label: "About Our Church", href: "/about" },
  ],
}

/** The standard welcome, with whichever parts the admin has replaced. */
function welcomeText({ title, subtitle, ctaLabel, ctaHref }: HeroSettings) {
  const [first, second] = STANDARD_WELCOME.buttons
  return {
    title: title || STANDARD_WELCOME.title,
    subtitle: subtitle || STANDARD_WELCOME.subtitle,
    // A button needs both its text and its link
    buttons: [ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : first, second],
  }
}

interface HeroProps {
  /** In the order the admin has put them. May be empty. */
  slides: HeroSlide[]
  /** The fallback picture (its Cloudinary ID, or "" for none) and the banner's own words */
  fallback: HeroSettings
}

export function Hero({ slides, fallback }: HeroProps) {
  const fallbackImage = fallback.fallbackImage
  const welcome = welcomeText(fallback)
  const section = useRef<HTMLElement>(null)
  const touchStartX = useRef<number | null>(null)
  const [current, setCurrent] = useState(0)
  // Slides that have had their turn. Their files stay loaded; the rest are not fetched yet.
  const [shown, setShown] = useState(() => new Set(slides.slice(0, 1).map((slide) => slide.id)))
  const [pausedByVisitor, setPausedByVisitor] = useState(false)

  const saveData = useSaveData()
  const reducedMotion = usePrefersReducedMotion()
  const inView = useInView(section)
  const pageVisible = usePageVisible()

  // Still pictures only, and no moving on by itself: every new slide is a new download
  const stillsOnly = saveData || reducedMotion
  const watched = inView && pageVisible && !pausedByVisitor
  const advancing = slides.length > 1 && !stillsOnly && watched

  const slide: HeroSlide | undefined = slides[current]
  const hasPicture = slides.length > 0 || Boolean(fallbackImage)

  function goTo(index: number) {
    const next = (index + slides.length) % slides.length
    setCurrent(next)
    setShown((ids) => new Set(ids).add(slides[next].id))
  }

  // A slide without a headline is just a background for the standard welcome
  const text = slide?.title
    ? {
        title: slide.title,
        subtitle: slide.subtitle,
        buttons: slide.ctaLabel && slide.ctaHref
          ? [{ label: slide.ctaLabel, href: slide.ctaHref }, { label: "Learn More", href: "/about" }]
          : [],
      }
    : { ...welcome, subtitle: slide?.subtitle || welcome.subtitle }

  return (
    <section
      ref={section}
      aria-label={slides.length > 0 ? "Hero carousel" : "Welcome"}
      aria-roledescription={slides.length > 1 ? "carousel" : undefined}
      className="relative h-[78vh] min-h-115 lg:h-screen lg:min-h-150 lg:max-h-250 overflow-hidden bg-navy-950 text-white"
      onKeyDown={(e) => {
        if (slides.length < 2) return
        if (e.key === "ArrowLeft") goTo(current - 1)
        if (e.key === "ArrowRight") goTo(current + 1)
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null || slides.length < 2) return
        const moved = e.changedTouches[0].clientX - touchStartX.current
        if (moved < -50) goTo(current + 1)
        else if (moved > 50) goTo(current - 1)
        touchStartX.current = null
      }}
    >
      {/* 1. Always there */}
      <div className="absolute inset-0 bg-linear-to-br from-navy-900 to-navy-950" />
      {!hasPicture && (
        <>
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        </>
      )}

      {/* 2. The fallback picture. With no slides it is the banner's picture, so it is shown at full quality. */}
      {fallbackImage && (
        <HeroPicture sources={slides.length > 0 ? heroFallback(fallbackImage) : heroPhoto(fallbackImage)} priority />
      )}

      {/* 3 and 4. The slides */}
      {slides.map(
        (item, index) =>
          shown.has(item.id) && (
            <SlideLayer
              key={item.id}
              slide={item}
              isCurrent={index === current}
              priority={index === 0}
              playVideo={!stillsOnly}
              watched={watched}
              advancing={advancing}
              loopVideo={slides.length === 1}
              onDone={() => goTo(index + 1)}
            />
          )
      )}

      {/* Darkens the picture where the words sit */}
      {hasPicture && (
        <>
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/20 to-black/70" />
          <div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-transparent" />
        </>
      )}

      <div
        key={slide?.id ?? "welcome"}
        aria-live={advancing ? "off" : "polite"}
        className="absolute bottom-20 sm:bottom-24 left-0 right-0 px-4 sm:px-8 lg:px-16 max-w-3xl animate-in fade-in-0 slide-in-from-bottom-2 duration-500 motion-reduce:animate-none"
      >
        <div className="w-12 h-1 bg-gold mb-4 rounded-full" />
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-3 drop-shadow-md">
          {text.title}
        </h1>
        {text.subtitle && (
          <p className="text-white/80 text-sm sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-xl leading-relaxed">
            {text.subtitle}
          </p>
        )}
        {text.buttons.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {text.buttons.map(({ label, href }, index) => (
              <Link
                key={`${label} ${href}`}
                href={href}
                className={cn(
                  "inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-white font-semibold text-sm transition-colors",
                  index === 0
                    ? "bg-primary hover:bg-primary/90 shadow-lg"
                    : "bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20"
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <ArrowButton side="left" label="Previous slide" onClick={() => goTo(current - 1)} />
          <ArrowButton side="right" label="Next slide" onClick={() => goTo(current + 1)} />

          <div className="absolute bottom-7 left-0 right-0 flex items-center justify-center gap-3">
            {slides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === current}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-white",
                  index === current ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
            {/* Nothing to pause when the slides only change by hand */}
            {!stillsOnly && (
              <button
                onClick={() => setPausedByVisitor((paused) => !paused)}
                aria-label={pausedByVisitor ? "Resume slideshow" : "Pause slideshow"}
                className="ml-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {pausedByVisitor ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
            )}
          </div>

          <div className="absolute top-20 right-4 sm:right-8 text-white/60 text-xs font-mono tabular-nums">
            {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>
        </>
      )}
    </section>
  )
}

interface SlideLayerProps {
  slide: HeroSlide
  isCurrent: boolean
  /** The first slide is in the page from the start, so the browser should fetch it early */
  priority: boolean
  /** False for visitors who get still pictures only */
  playVideo: boolean
  /** Someone is looking at the banner and has not pressed pause */
  watched: boolean
  /** The slideshow is moving on by itself */
  advancing: boolean
  loopVideo: boolean
  /** This slide has had its time */
  onDone: () => void
}

/** One slide's picture and, for a video slide, the video over it. */
function SlideLayer(props: SlideLayerProps) {
  const { slide, isCurrent, priority, playVideo, watched, advancing, loopVideo, onDone } = props
  const [picture, setPicture] = useState<"loading" | "ready" | "failed">("loading")
  const [video, setVideo] = useState<"loading" | "ready" | "failed">("loading")
  const done = useEffectEvent(onDone)

  const isVideo = slide.type === "video"
  const showVideo = isVideo && playVideo && video !== "failed"

  // A photo (or a video's still) stays up for a fixed time once it has loaded.
  // A playing video moves the slideshow on when it ends instead.
  useEffect(() => {
    if (!isCurrent || !advancing || showVideo || picture === "loading") return
    const timer = setTimeout(done, PHOTO_SECONDS * 1000)
    return () => clearTimeout(timer)
  }, [isCurrent, advancing, showVideo, picture])

  // Until one of them has arrived the layer is see-through, and the fallback shows
  const visible = isCurrent && (picture === "ready" || video === "ready")

  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <HeroPicture
        sources={isVideo ? heroVideoStill(slide.publicId) : heroPhoto(slide.publicId)}
        priority={priority}
        onLoad={() => setPicture("ready")}
        onError={() => setPicture("failed")}
      />
      {showVideo && (
        <BackgroundVideo
          publicId={slide.publicId}
          play={isCurrent && watched}
          loop={loopVideo}
          onReady={() => setVideo("ready")}
          onFailed={() => setVideo("failed")}
          onEnded={onDone}
        />
      )}
    </div>
  )
}

interface BackgroundVideoProps {
  publicId: string
  play: boolean
  loop: boolean
  onReady: () => void
  onFailed: () => void
  onEnded: () => void
}

/** A silent video filling the banner. Only ever rendered in the browser. */
function BackgroundVideo({ publicId, play, loop, onReady, onFailed, onEnded }: BackgroundVideoProps) {
  const element = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  // Chosen once: swapping files when a phone is turned would download the video twice
  const [shape] = useState<"tall" | "wide">(() => (window.matchMedia(TALL_SCREEN).matches ? "tall" : "wide"))
  const failed = useEffectEvent(onFailed)

  useEffect(() => {
    const video = element.current
    if (!video) return
    if (!play) {
      video.pause()
      return
    }
    video.play().catch((error: DOMException) => {
      // "NotAllowedError" means the browser refuses to autoplay (a phone in
      // low-power mode, say); the still picture is shown instead. Other errors
      // are just a pause() arriving before play() had started.
      if (error.name === "NotAllowedError") failed()
    })
  }, [play])

  return (
    <video
      ref={element}
      src={heroVideo(publicId, shape)}
      muted
      playsInline
      loop={loop}
      preload="auto"
      onCanPlay={() => {
        setReady(true)
        onReady()
      }}
      onEnded={onEnded}
      onError={onFailed}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none",
        ready ? "opacity-100" : "opacity-0"
      )}
    />
  )
}

interface HeroPictureProps {
  sources: PictureSources
  /** Ask the browser to fetch this ahead of other pictures */
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

/**
 * A picture filling the banner. An upright phone gets a tall crop and every
 * other screen a wide one, so nobody downloads parts of the photo that would be
 * cut off. (next/image cannot serve a different crop per screen shape, which is
 * why this is a plain <picture>.)
 */
function HeroPicture({ sources, priority = false, onLoad, onError }: HeroPictureProps) {
  const image = useRef<HTMLImageElement>(null)
  const loaded = useEffectEvent(() => onLoad?.())

  // A picture that was already in the page can finish loading before React is
  // listening, in which case onLoad never fires
  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth > 0) loaded()
  }, [])

  return (
    <picture>
      <source media={TALL_SCREEN} srcSet={sources.tall} sizes="100vw" />
      <img
        ref={image}
        src={sources.src}
        srcSet={sources.wide}
        sizes="100vw"
        alt=""
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={onLoad}
        onError={onError}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  )
}

function ArrowButton({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/50 transition-colors focus-visible:outline-2 focus-visible:outline-white",
        side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6"
      )}
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}
