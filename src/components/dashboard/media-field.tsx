"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Trash2, Upload } from "lucide-react"
import { inputClass } from "@/components/dashboard/form-fields"
import { api, type MediaInfo } from "@/lib/api"
import { cloudinaryUrl, cloudinaryVideoPoster } from "@/lib/cloudinary"
import { uploadMedia } from "@/lib/upload"
import { cn } from "@/lib/utils"

// Choosing photos and videos in the dashboard. Staff can upload from their
// device, or paste the Cloudinary ID of something already uploaded there.
//
//   MediaField      one photo or video
//   MediaListField  several at once, up to a limit

interface MediaFieldProps {
  label: string
  /** The chosen photo or video, or null if none */
  value: MediaInfo | null
  onChange: (value: MediaInfo | null) => void
  /** Whether videos may be chosen as well as images */
  allowVideo?: boolean
  hint?: string
}

export function MediaField({ label, value, onChange, allowVideo = false, hint }: MediaFieldProps) {
  return (
    <div>
      <span className="block text-sm font-semibold text-foreground mb-1.5">{label}</span>
      {value ? (
        <Chosen item={value} removeLabel={`Remove ${label.toLowerCase()}`} onRemove={() => onChange(null)} />
      ) : (
        <Chooser label={label} allowVideo={allowVideo} room={1} hint={hint} onChosen={([item]) => onChange(item)} />
      )}
    </div>
  )
}

interface MediaListFieldProps {
  label: string
  value: MediaInfo[]
  onChange: (value: MediaInfo[]) => void
  /** The most that may be chosen */
  max: number
  allowVideo?: boolean
  hint?: string
}

export function MediaListField({ label, value, onChange, max, allowVideo = false, hint }: MediaListFieldProps) {
  const room = max - value.length

  return (
    <div>
      <span className="block text-sm font-semibold text-foreground mb-1.5">
        {label}
        {value.length > 0 && <span className="font-normal text-muted-foreground"> · {value.length} of {max}</span>}
      </span>

      <div className="space-y-2">
        {value.map((item, index) => (
          <Chosen
            key={item.publicId}
            item={item}
            removeLabel={`Remove ${item.type} ${index + 1}`}
            onRemove={() => onChange(value.filter((other) => other !== item))}
          />
        ))}

        {room > 0 ? (
          <Chooser
            label={label}
            allowVideo={allowVideo}
            room={room}
            hint={hint}
            // The same file chosen twice is kept once
            onChosen={(items) => onChange([...value, ...items.filter((item) => !value.some((had) => had.publicId === item.publicId))])}
          />
        ) : (
          <p className="text-muted-foreground text-xs">That is the most that can be added in one go. Save these, then add more.</p>
        )}
      </div>
    </div>
  )
}

/** A photo or video that has been chosen: its thumbnail, what it is, and a bin to take it off again. */
function Chosen({ item, removeLabel, onRemove }: { item: MediaInfo; removeLabel: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
      <Image
        src={
          item.type === "image"
            ? cloudinaryUrl(item.publicId, { width: 160, height: 120 })
            : cloudinaryVideoPoster(item.publicId, { width: 160 })
        }
        alt=""
        width={80}
        height={60}
        className="w-20 h-15 rounded-lg object-cover bg-muted shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground capitalize">{item.type}</p>
        <p className="text-xs text-muted-foreground font-mono truncate">{item.publicId}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

interface ChooserProps {
  label: string
  allowVideo: boolean
  /** How many more may be chosen. More than 1 lets several files be picked in one go. */
  room: number
  hint?: string
  onChosen: (items: MediaInfo[]) => void
}

/** The upload button and the "paste a Cloudinary ID" box. */
function Chooser({ label, allowVideo, room, hint, onChosen }: ChooserProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pastedId, setPastedId] = useState("")
  const [pastedType, setPastedType] = useState<"image" | "video">("image")
  // What is going up right now, e.g. "2 of 4… 60%"; null when nothing is
  const [progress, setProgress] = useState<string | null>(null)
  const [looking, setLooking] = useState(false)
  const [error, setError] = useState("")

  const several = room > 1
  const busy = progress !== null || looking
  const things = allowVideo ? (several ? "photos or videos" : "a photo or video") : several ? "photos" : "a photo"

  /** Uploads the files one after another. Whatever goes up is kept, even if another fails. */
  async function upload(picked: File[]) {
    const problems: string[] = []
    let files = allowVideo ? picked : picked.filter((file) => file.type.startsWith("image/"))
    if (files.length < picked.length) problems.push("Only image files can be added here.")
    if (files.length > room) {
      problems.push(`Only ${room} more can be added, so the first ${room} of the ${files.length} were taken.`)
      files = files.slice(0, room)
    }

    const uploaded: MediaInfo[] = []
    for (const [index, file] of files.entries()) {
      const which = files.length > 1 ? ` ${index + 1} of ${files.length}` : ""
      try {
        setProgress(`Uploading${which}… 0%`)
        uploaded.push(
          await uploadMedia(file, (percent) => setProgress(percent < 100 ? `Uploading${which}… ${percent}%` : `Finishing${which}…`))
        )
      } catch (e) {
        const reason = e instanceof Error ? e.message : "Something went wrong"
        problems.push(files.length > 1 ? `${file.name}: ${reason}` : reason)
      }
    }
    setProgress(null)
    setError(problems.join(" "))
    if (uploaded.length) onChosen(uploaded)
  }

  /** Checks a pasted Cloudinary ID exists, and takes it. */
  async function takePasted() {
    setError("")
    setLooking(true)
    try {
      onChosen([await api.uploads.info(pastedId.trim(), allowVideo ? pastedType : "image")])
      setPastedId("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLooking(false)
    }
  }

  return (
    <div>
      <div className="space-y-2">
        <input
          ref={fileInput}
          type="file"
          accept={allowVideo ? "image/*,video/*" : "image/*"}
          multiple={several}
          className="hidden"
          onChange={(e) => {
            const picked = [...(e.target.files ?? [])]
            e.target.value = "" // allow choosing the same file again
            if (picked.length) {
              setError("")
              upload(picked)
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {progress ?? (looking ? "Working…" : `Upload ${things}`)}
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
            onClick={takePasted}
            className="px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
          >
            Use
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-red-500 text-xs mt-1.5">{error}</p>}
      {hint && !error && <p className="text-muted-foreground text-xs mt-1.5">{hint}</p>}
    </div>
  )
}
