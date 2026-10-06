// The sizes and quality of the photos and videos in the banner at the top of
// the home page ("the hero").
//
// The hero is the heaviest thing on the site, and most visitors are on phones
// with metered data. So every file is asked for at the shape and size of the
// screen it will fill, at Cloudinary's economy quality, and a video is cut to
// its first seconds with the sound removed (it plays muted anyway).
//
// Measured in a browser with a detailed 2600px photo and a 27 MB video:
//   fallback picture    ~10 KB       photo slide   ~90 KB phone, ~200 KB desktop
//   still from a video  ~13 KB       video slide   ~0.9 MB phone, ~1.3 MB desktop

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`

/** A phone held upright. Every other screen gets the wide (16:9) version. */
export const TALL_SCREEN = "(max-width: 767px) and (orientation: portrait)"

/** Only this much of a background video is ever sent. */
export const HERO_VIDEO_SECONDS = 20

// The hero's shape on each kind of screen, and the widths offered for it. The
// browser picks the smallest width that fills the screen it is on.
const TALL = { ratio: "2:3", photoWidths: [480, 640], fallbackWidth: 320, stillWidths: [480, 640] }
const WIDE = { ratio: "16:9", photoWidths: [960, 1280, 1600], fallbackWidth: 640, stillWidths: [960, 1280] }

/** What a <picture> needs: one list of files for upright phones, one for everything else. */
export interface PictureSources {
  tall: string
  wide: string
  /** A single file for browsers that do not choose from a list */
  src: string
}

/** "url 480w, url 640w": the list a browser chooses from. */
function srcSet(widths: number[], url: (width: number) => string) {
  return widths.map((width) => `${url(width)} ${width}w`).join(", ")
}

function sources(url: (shape: typeof TALL, width: number) => string, widths: "photoWidths" | "stillWidths"): PictureSources {
  return {
    tall: srcSet(TALL[widths], (width) => url(TALL, width)),
    wide: srcSet(WIDE[widths], (width) => url(WIDE, width)),
    src: url(WIDE, WIDE[widths][0]),
  }
}

/** A photo slide, cropped to the hero's shape. */
export function heroPhoto(publicId: string): PictureSources {
  return sources(
    (shape, width) =>
      `${BASE_URL}/image/upload/f_auto,q_auto:eco,c_fill,g_auto,ar_${shape.ratio},w_${width}/${publicId}`,
    "photoWidths"
  )
}

/**
 * The fallback picture as a placeholder: small and softened, so it arrives
 * almost at once and costs almost nothing. It is only on screen until the real
 * slide has loaded over it.
 */
export function heroFallback(publicId: string): PictureSources {
  const url = (shape: typeof TALL) =>
    `${BASE_URL}/image/upload/f_auto,q_auto:low,c_fill,g_auto,ar_${shape.ratio},w_${shape.fallbackWidth},e_blur:120/${publicId}`
  return { tall: url(TALL), wide: url(WIDE), src: url(WIDE) }
}

/** The first frame of a video, as a picture. Shown before the video plays, and instead of it on slow connections. */
export function heroVideoStill(publicId: string): PictureSources {
  return sources(
    (shape, width) =>
      `${BASE_URL}/video/upload/f_auto,q_auto:eco,c_fill,ar_${shape.ratio},w_${width},so_0/${publicId}.jpg`,
    "stillWidths"
  )
}

// The two versions of a background video. Cloudinary is asked to prepare exactly
// these when a video slide is saved (see src/server/lib/cloudinary.ts), so the
// strings here must stay the single definition of them.
export const HERO_VIDEO_VERSIONS = {
  tall: `q_auto:eco,c_fill,ar_${TALL.ratio},w_540,du_${HERO_VIDEO_SECONDS},ac_none`,
  wide: `q_auto:eco,c_limit,w_1280,du_${HERO_VIDEO_SECONDS},ac_none`,
}

/** A background video, sized for the screen. MP4 plays in every browser. */
export function heroVideo(publicId: string, shape: keyof typeof HERO_VIDEO_VERSIONS) {
  return `${BASE_URL}/video/upload/${HERO_VIDEO_VERSIONS[shape]}/${publicId}.mp4`
}
