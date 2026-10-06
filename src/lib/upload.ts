import { api, type MediaInfo } from "@/lib/api"

// Cloudinary's limits on the free plan. Checking here saves a long upload that
// would only be refused at the end.
const MB = 1024 * 1024
const MAX_IMAGE_BYTES = 10 * MB
const MAX_VIDEO_BYTES = 100 * MB

/**
 * Uploads a photo or video from the browser straight to Cloudinary and returns
 * its Cloudinary ID and dimensions. The server only signs the request, so large
 * files never pass through it.
 *
 * `onProgress` is called with a number from 0 to 100 as the file goes up.
 */
export async function uploadMedia(file: File, onProgress?: (percent: number) => void): Promise<MediaInfo> {
  const isVideo = file.type.startsWith("video/")
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (file.size > limit) {
    const size = Math.round(file.size / MB)
    throw new Error(
      `This ${isVideo ? "video" : "photo"} is ${size} MB. The most that can be uploaded is ${limit / MB} MB — ` +
        (isVideo ? "trim it to a shorter clip, or export it at a lower quality." : "save a smaller copy and try again.")
    )
  }

  const { cloudName, apiKey, folder, timestamp, signature } = await api.uploads.signature()

  const form = new FormData()
  form.append("file", file)
  form.append("api_key", apiKey)
  form.append("folder", folder)
  form.append("timestamp", String(timestamp))
  form.append("signature", signature)

  // "auto" lets Cloudinary work out whether the file is an image or a video
  const { status, body } = await send(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, form, onProgress)

  if (status === 401) {
    throw new Error(
      "Cloudinary rejected the upload. Check that CLOUDINARY_API_SECRET in .env is the API secret from your Cloudinary dashboard."
    )
  }
  if (status < 200 || status >= 300 || !body?.public_id) {
    throw new Error(body?.error?.message ?? "The upload failed. Please check your connection and try again.")
  }

  return {
    publicId: body.public_id,
    type: body.resource_type === "video" ? "video" : "image",
    width: body.width,
    height: body.height,
  }
}

interface CloudinaryReply {
  public_id?: string
  resource_type?: string
  width: number
  height: number
  error?: { message?: string }
}

/** Posts a form and reports progress. (fetch cannot report how much has been sent; XMLHttpRequest can.) */
function send(url: string, form: FormData, onProgress?: (percent: number) => void) {
  return new Promise<{ status: number; body: CloudinaryReply | null }>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open("POST", url)
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () => {
      let body: CloudinaryReply | null = null
      try {
        body = JSON.parse(request.responseText)
      } catch {
        // Not JSON: treated as a failed upload by the caller
      }
      resolve({ status: request.status, body })
    }
    request.onerror = () => reject(new Error("The upload failed. Please check your connection and try again."))
    request.send(form)
  })
}
