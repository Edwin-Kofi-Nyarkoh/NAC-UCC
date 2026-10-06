"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Loader2, Save } from "lucide-react"
import { ErrorBanner, inputClass } from "@/components/dashboard/form-fields"
import { MediaField } from "@/components/dashboard/media-field"
import { categoryLabel, cn } from "@/lib/utils"
import type { MediaItem } from "@/types"

export interface PostFormData {
  title: string
  content: string
  excerpt: string
  category: string
  mediaItems: MediaItem[]
  published: boolean
}

interface PostEditorProps {
  /** Page heading, e.g. "New Post" */
  title: string
  /** The list to return to after saving */
  backHref: string
  /** Leave empty for content without categories */
  categories: string[]
  initialData?: Partial<PostFormData>
  onSave: (data: PostFormData) => Promise<void>
  /** Extra inputs shown under the main text, e.g. an event's date and location */
  extraFields?: React.ReactNode
  /** What the main text box is called. Defaults to "Content". */
  contentLabel?: string
  /** Events and sermons have no summary line */
  showExcerpt?: boolean
  /** How many photos/videos can be attached. Defaults to 3. */
  maxMedia?: number
  allowVideo?: boolean
}

const EMPTY: PostFormData = {
  title: "",
  content: "",
  excerpt: "",
  category: "",
  mediaItems: [],
  published: false,
}

/** The writing screen shared by posts, medical posts, events and sermons. */
export function PostEditor({
  title,
  backHref,
  categories,
  initialData,
  onSave,
  extraFields,
  contentLabel = "Content",
  showExcerpt = true,
  maxMedia = 3,
  allowVideo = true,
}: PostEditorProps) {
  const router = useRouter()
  const [form, setForm] = useState<PostFormData>({ ...EMPTY, ...initialData })
  // Which button is busy, so only that one shows a spinner
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null)
  const [error, setError] = useState("")

  function set<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function save(published: boolean) {
    setError("")
    setSaving(published ? "publish" : "draft")
    try {
      await onSave({ ...form, published })
      router.push(backHref)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Please try again.")
      setSaving(null)
    }
  }

  function setMedia(index: number, item: MediaItem | null) {
    const next = [...form.mediaItems]
    if (item) next[index] = item
    else next.splice(index, 1)
    set("mediaItems", next)
  }

  const mediaNoun = allowVideo ? "photo or video" : "photo"

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push(backHref)}
            aria-label="Back to the list"
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save(false)}
            disabled={saving !== null}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {saving === "draft" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving !== null}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving === "publish" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
            Publish
          </button>
        </div>
      </div>

      <ErrorBanner message={error} className="mb-6" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <label className="block">
              <span className="block text-sm font-semibold text-foreground mb-1.5">Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Enter a title…"
                className={cn(inputClass, "py-3")}
              />
            </label>

            {showExcerpt && (
              <label className="block">
                <span className="block text-sm font-semibold text-foreground mb-1.5">Summary</span>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="One or two sentences shown in listings…"
                  className={cn(inputClass, "py-3 resize-none")}
                />
              </label>
            )}

            <label className="block">
              <span className="block text-sm font-semibold text-foreground mb-1.5">{contentLabel}</span>
              <textarea
                rows={16}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder="Write here… Leave a blank line between paragraphs."
                className={cn(inputClass, "py-3 resize-y leading-relaxed")}
              />
            </label>
          </div>
          {extraFields}
        </div>

        <div className="space-y-5">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold text-foreground text-sm mb-3">Status</h2>
            <p
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border",
                form.published
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                  : "bg-muted border-border text-muted-foreground"
              )}
            >
              {form.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {form.published ? "Published" : "Draft — not visible on the site"}
            </p>
          </div>

          {categories.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-semibold text-foreground text-sm mb-4">Category</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => set("category", category)}
                    aria-pressed={form.category === category}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors capitalize",
                      form.category === category
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {categoryLabel(category)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground text-sm">
                {maxMedia === 1 ? "Photo" : "Photos & videos"}
              </h2>
              {maxMedia > 1 && (
                <span className="text-xs text-muted-foreground">
                  {form.mediaItems.length}/{maxMedia}
                </span>
              )}
            </div>

            {form.mediaItems.map((item, index) => (
              <MediaField
                key={`${item.publicId}-${index}`}
                label={index === 0 && maxMedia > 1 ? "Featured" : `Item ${index + 1}`}
                value={{ ...item, width: 0, height: 0 }}
                onChange={(media) => setMedia(index, media && { type: media.type, publicId: media.publicId })}
                allowVideo={allowVideo}
              />
            ))}

            {form.mediaItems.length < maxMedia && (
              <MediaField
                label={form.mediaItems.length === 0 ? `Add a ${mediaNoun}` : `Add another ${mediaNoun}`}
                value={null}
                onChange={(media) =>
                  media && setMedia(form.mediaItems.length, { type: media.type, publicId: media.publicId })
                }
                allowVideo={allowVideo}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
