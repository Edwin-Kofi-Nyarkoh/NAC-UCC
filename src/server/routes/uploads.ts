import { Hono } from "hono"
import { UPLOAD_FOLDER, cloudinaryCredentials, sign } from "../lib/cloudinary"
import { authenticate } from "../middleware/auth"

// Media lives on Cloudinary. The dashboard uploads files straight to Cloudinary
// from the browser; this router only hands out the signature that authorises it,
// so the API secret never leaves the server.
export const uploadsRouter = new Hono()

// Any signed-in member of staff may upload
uploadsRouter.use("*", authenticate)

const UNREACHABLE = "Could not reach Cloudinary just now. Check the internet connection and try again."

/** Asks Cloudinary, trying twice. Returns null if it could not be reached at all. */
async function askCloudinary(url: string, method: "GET" | "HEAD" = "GET"): Promise<Response | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await fetch(url, { method, signal: AbortSignal.timeout(15000) })
    } catch {
      // Could not connect, or no answer in time
    }
  }
  return null
}

// POST /uploads/signature — authorises one upload
uploadsRouter.post("/signature", (c) => {
  const credentials = cloudinaryCredentials()
  if (!credentials) {
    return c.json({ error: "Uploads are not set up yet. Add the Cloudinary keys to .env." }, 503)
  }

  const params = { folder: UPLOAD_FOLDER, timestamp: Math.floor(Date.now() / 1000) }

  return c.json({
    cloudName: credentials.cloudName,
    apiKey: credentials.apiKey,
    ...params,
    signature: sign(params, credentials.apiSecret),
  })
})

// GET /uploads/info?publicId=…&type=image|video
// Confirms a pasted Cloudinary ID exists and returns its dimensions.
uploadsRouter.get("/info", async (c) => {
  const publicId = c.req.query("publicId")?.trim()
  const type = c.req.query("type") === "video" ? "video" : "image"
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!publicId || !cloudName) return c.json({ error: "publicId is required" }, 400)

  const base = `https://res.cloudinary.com/${cloudName}/${type}/upload`
  const notFound = () => c.json({ error: `No ${type} with that ID was found on Cloudinary` }, 404)

  if (type === "video") {
    // Cloudinary reports dimensions for images only; for a video it is enough
    // to know the file exists (its first frame can be fetched as a picture).
    const still = await askCloudinary(`${base}/so_0/${publicId}.jpg`, "HEAD")
    if (!still) return c.json({ error: UNREACHABLE }, 502)
    return still.ok ? c.json({ publicId, type, width: 1280, height: 720 }) : notFound()
  }

  const res = await askCloudinary(`${base}/fl_getinfo/${publicId}`)
  if (!res) return c.json({ error: UNREACHABLE }, 502)
  if (!res.ok) return notFound()
  const info = (await res.json().catch(() => null)) as {
    input?: { width?: number; height?: number }
  } | null
  if (!info?.input?.width || !info.input.height) return notFound()

  return c.json({ publicId, type, width: info.input.width, height: info.input.height })
})
