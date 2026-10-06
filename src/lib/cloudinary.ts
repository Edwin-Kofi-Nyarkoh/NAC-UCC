// Builds delivery URLs for media stored on Cloudinary.
// A "public ID" is Cloudinary's name for a file, e.g. "nac-ucc/harvest-2025".
//
// Visitors never download an original upload. Every picture is asked for at the
// size it will be shown, in the best format the browser accepts, at Cloudinary's
// economy quality, and browsers fetch it straight from Cloudinary.
// (The home page banner has its own, stricter rules in hero-media.ts.)

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`

type Crop = "fill" | "fit" | "thumb" | "scale" | "pad"

// Cloudinary only accepts a focal point ("gravity") with crops that cut the image
const CROPS_WITH_GRAVITY: Crop[] = ["fill", "thumb"]

interface ImageOptions {
  width?: number
  height?: number
  /** How to fit the image into width × height. Defaults to "fill". */
  crop?: Crop
  /** What to keep in frame when cropping. Defaults to "auto". */
  gravity?: "auto" | "face" | "center"
}

export function cloudinaryUrl(publicId: string, options: ImageOptions = {}) {
  const { width, height, crop = "fill", gravity = "auto" } = options

  const transforms = [
    "f_auto",
    "q_auto:eco",
    `c_${crop}`,
    CROPS_WITH_GRAVITY.includes(crop) && `g_${gravity}`,
    width && `w_${width}`,
    height && `h_${height}`,
  ]
    .filter(Boolean)
    .join(",")

  return `${BASE_URL}/image/upload/${transforms}/${publicId}`
}

export function cloudinaryVideoUrl(publicId: string) {
  return `${BASE_URL}/video/upload/f_auto,q_auto/${publicId}`
}

/** The first frame of a video, as a picture. */
export function cloudinaryVideoPoster(publicId: string, options: { width?: number } = {}) {
  const { width = 1920 } = options
  return `${BASE_URL}/video/upload/f_jpg,q_auto:eco,w_${width},so_0/${publicId}`
}
