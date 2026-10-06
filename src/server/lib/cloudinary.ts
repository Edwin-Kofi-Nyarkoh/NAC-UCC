import { createHash } from "node:crypto"
import { HERO_VIDEO_VERSIONS } from "@/lib/hero-media"

// The server's side of Cloudinary: the only place the API secret is used.

const API_URL = "https://api.cloudinary.com/v1_1"

/** Folder in the Cloudinary account that dashboard uploads go into */
export const UPLOAD_FOLDER = "nac-ucc"

interface Credentials {
  cloudName: string
  apiKey: string
  apiSecret: string
}

/** The account details from .env, or null if uploads have not been set up. */
export function cloudinaryCredentials(): Credentials | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null
}

/**
 * Signs a request the way Cloudinary expects: the parameters in alphabetical
 * order as "a=1&b=2", followed by the API secret, hashed with SHA-1.
 */
export function sign(params: Record<string, string | number>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&")
  return createHash("sha1").update(sorted + apiSecret).digest("hex")
}

/**
 * Asks Cloudinary to make the two small versions of a hero video now, in the
 * background, rather than when the first visitor asks for them.
 *
 * This matters for more than speed: Cloudinary refuses to convert a large video
 * while a visitor waits, so without this a big upload would never play.
 *
 * Failing here is not fatal. The slide is still saved and visitors see its
 * still picture, so problems are logged rather than thrown.
 */
export async function prepareHeroVideo(publicId: string): Promise<void> {
  const credentials = cloudinaryCredentials()
  if (!credentials) return

  const params = {
    public_id: publicId,
    type: "upload",
    eager: Object.values(HERO_VIDEO_VERSIONS)
      .map((version) => `${version}/mp4`)
      .join("|"),
    eager_async: "true",
    timestamp: Math.floor(Date.now() / 1000),
  }

  try {
    const res = await fetch(`${API_URL}/${credentials.cloudName}/video/explicit`, {
      method: "POST",
      body: new URLSearchParams({
        ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
        api_key: credentials.apiKey,
        signature: sign(params, credentials.apiSecret),
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
      console.error(`Could not prepare hero video "${publicId}":`, res.status, body?.error?.message)
    }
  } catch (error) {
    console.error(`Could not prepare hero video "${publicId}":`, error)
  }
}
