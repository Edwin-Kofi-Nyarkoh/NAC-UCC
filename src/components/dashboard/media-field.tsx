"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Trash2, Upload } from "lucide-react"
import { inputClass } from "@/components/dashboard/form-fields"
import { api, type MediaInfo } from "@/lib/api"
import { cloudinaryUrl, cloudinaryVideoPoster } from "@/lib/cloudinary"
import { uploadMedia } from "@/lib/upload"
import { cn } from "@/lib/utils"

interface MediaFieldProps {
  label: string
  /** The chosen photo or video, or null if none */
  value: MediaInfo | null
  onChange: (value: MediaInfo | null) => void
  /** Whether videos may be chosen as well as images */
  allowVideo?: boolean
  hint?: string
}

/**
 * Chooses one photo or video. Staff can upload a file from their device, or
 * paste the Cloudinary ID of something already uploaded there.
 */
export function MediaField({ label, value, onChange, allowVideo = false, hint }: MediaFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pastedId, setPastedId] = useState("")
  const [pastedType, setPastedType] = useState<"image" | "video">("image")
  const [busy, setBusy] = useState(false)
  // 0–100 while a file is going up; null when nothing is uploading
  const [uploaded, setUploaded] = useState<number | null>(null)
  const [error, setError] = useState("")

  /** Runs an upload or lookup, showing a spinner and any error. */
  async function choose(find: () => Promise<MediaInfo>) {
    setError("")
    setBusy(true)
    try {
      onChange(await find())
      setPastedId("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setBusy(false)
      setUploaded(null)
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!allowVideo && !file.type.startsWith("image/")) {
      setError("Please choose an image file.")
      return
    }
    choose(() => uploadMedia(file, setUploaded))
  }

  return (
    <div>
      <span className="block text-sm font-semibold text-foreground mb-1.5">{label}</span>

      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
          <Image
            src={
              value.type === "image"
                ? cloudinaryUrl(value.publicId, { width: 160, height: 120 })
                : cloudinaryVideoPoster(value.publicId, { width: 160 })
            }
            alt=""
            width={80}
            height={60}
            className="w-20 h-15 rounded-lg object-cover bg-muted shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground capitalize">{value.type}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{value.publicId}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileInput}
            type="file"
            accept={allowVideo ? "image/*,video/*" : "image/*"}
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0])
              e.target.value = "" // allow choosing the same file again
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploaded !== null
              ? uploaded < 100
                ? `Uploading… ${uploaded}%`
                : "Finishing…"
              : busy
                ? "Working…"
                : allowVideo
                  ? "Upload a photo or video"
                  : "Upload a photo"}
          </button>

          <div className="flex gap-2">
            {allowVideo && (
              <select
                value={pastedType}
                onChange={(e) => setPastedType(e.target.value as "image" | "video")}
                aria-label="Type of the pasted file"
                className={cn(inputClass, "w-auto shrink-0 px-2")}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            )}
            <input
              type="text"
              value={pastedId}
              onChange={(e) => setPastedId(e.target.value)}
              placeholder="…or paste a Cloudinary ID"
              aria-label={`${label}: Cloudinary ID`}
              className={cn(inputClass, "font-mono min-w-0")}
            />
            <button
              type="button"
              disabled={busy || !pastedId.trim()}
              onClick={() => choose(() => api.uploads.info(pastedId.trim(), allowVideo ? pastedType : "image"))}
              className="px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
            >
              Use
            </button>
          </div>
        </div>
      )}

      {error && <p role="alert" className="text-red-500 text-xs mt-1.5">{error}</p>}
      {hint && !error && <p className="text-muted-foreground text-xs mt-1.5">{hint}</p>}
    </div>
  )
}
