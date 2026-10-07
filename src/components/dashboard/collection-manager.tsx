"use client"

import { useState } from "react"
import Image from "next/image"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  ErrorBanner,
  LoadingState,
  PrimaryButton,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/dashboard/form-fields"
import { MediaField, MediaListField } from "@/components/dashboard/media-field"
import type { MediaInfo } from "@/lib/api"
import { cloudinaryUrl, cloudinaryVideoPoster } from "@/lib/cloudinary"

// One screen for managing a simple list of things: add, edit, remove and
// (optionally) reorder. The hero slides, leaders, ministries and gallery pages
// are each this component with a different set of fields.

export interface CollectionField {
  /** The record's property this input edits */
  name: string
  label: string
  kind?: "text" | "textarea" | "select"
  /** For a select: what can be chosen. The placeholder names the "none" choice. */
  options?: readonly string[]
  placeholder?: string
  hint?: string
}

interface CollectionManagerProps<T extends { id: string }> {
  title: string
  description: string
  /** What one item is called, e.g. "leader". Used in buttons and messages. */
  noun: string
  resource: {
    list: () => Promise<T[]>
    create: (input: Partial<T>) => Promise<unknown>
    update: (id: string, input: Partial<T>) => Promise<unknown>
    remove: (id: string) => Promise<unknown>
    /** Leave out for lists that are not ordered by hand */
    reorder?: (ids: string[]) => Promise<unknown>
  }
  fields: CollectionField[]
  /**
   * Set when each item has a photo (or video). With `addUpTo`, several can be
   * chosen when adding, and each one becomes an item of its own; `hint` then
   * explains that, and is left out when editing an item, which has the one.
   */
  media?: { label: string; allowVideo?: boolean; required?: boolean; hint?: string; addUpTo?: number }
  /** The photo or video an existing item has, if any */
  mediaOf?: (item: T) => MediaInfo | null
  /** Turns the form's values into what the API expects */
  toInput: (values: Record<string, string>, media: MediaInfo | null) => Partial<T>
  /** How an item appears in the list */
  summarise: (item: T) => { title: string; subtitle?: string | null }
  /** Shown between the heading and the list, e.g. a setting that belongs with these items */
  children?: React.ReactNode
}

type Editing<T> = { item: T | null } | null // { item: null } means "adding a new one"

export function CollectionManager<T extends { id: string }>(props: CollectionManagerProps<T>) {
  const { title, description, noun, resource, mediaOf, summarise, children } = props
  const queryClient = useQueryClient()
  const queryKey = ["collection", title]
  const [editing, setEditing] = useState<Editing<T>>(null)
  const [error, setError] = useState("")

  const { data: items = [], isLoading, error: loadError } = useQuery({ queryKey, queryFn: resource.list })

  const refresh = () => queryClient.invalidateQueries({ queryKey })
  const showError = (e: Error) => setError(e.message)

  const remove = useMutation({ mutationFn: resource.remove, onSuccess: refresh, onError: showError })
  const reorder = useMutation({
    mutationFn: (ids: string[]) => resource.reorder!(ids),
    onSuccess: refresh,
    onError: showError,
  })

  function move(index: number, by: -1 | 1) {
    const ids = items.map((item) => item.id)
    const target = index + by
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorder.mutate(ids)
  }

  function confirmRemove(item: T) {
    if (confirm(`Delete "${summarise(item).title}"? This cannot be undone.`)) {
      setError("")
      remove.mutate(item.id)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        <PrimaryButton onClick={() => setEditing({ item: null })}>
          <Plus className="w-4 h-4" /> Add {noun}
        </PrimaryButton>
      </div>

      <ErrorBanner message={error || loadError?.message} className="mb-6" />

      {children}

      {isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
          Nothing here yet. Add your first {noun} to show it on the website.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const summary = summarise(item)
            const media = mediaOf?.(item)
            return (
              <li key={item.id} className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4">
                {/* When the order matters, say where each item comes */}
                {resource.reorder && (
                  <span className="w-6 text-center text-sm font-bold text-muted-foreground shrink-0" aria-label={`Position ${index + 1}`}>
                    {index + 1}
                  </span>
                )}
                {media && (
                  <Image
                    src={
                      media.type === "image"
                        ? cloudinaryUrl(media.publicId, { width: 128, height: 96 })
                        : cloudinaryVideoPoster(media.publicId, { width: 128 })
                    }
                    alt=""
                    width={64}
                    height={48}
                    className="w-16 h-12 rounded-lg object-cover bg-muted shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm truncate">{summary.title}</p>
                  {summary.subtitle && (
                    <p className="text-muted-foreground text-xs truncate mt-0.5">{summary.subtitle}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {resource.reorder && (
                    <>
                      <IconButton label="Move up" disabled={index === 0 || reorder.isPending} onClick={() => move(index, -1)}>
                        <ArrowUp className="w-3.5 h-3.5" />
                      </IconButton>
                      <IconButton
                        label="Move down"
                        disabled={index === items.length - 1 || reorder.isPending}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </IconButton>
                    </>
                  )}
                  <IconButton label={`Edit ${summary.title}`} onClick={() => setEditing({ item })}>
                    <Pencil className="w-3.5 h-3.5" />
                  </IconButton>
                  <IconButton label={`Delete ${summary.title}`} danger disabled={remove.isPending} onClick={() => confirmRemove(item)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </IconButton>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editing && (
        <ItemForm
          {...props}
          item={editing.item}
          onClose={() => setEditing(null)}
          onSomeSaved={refresh}
          onSaved={() => {
            setEditing(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

interface IconButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}

function IconButton({ label, onClick, disabled, danger, children }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={
        "w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none " +
        (danger ? "hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : "hover:text-foreground hover:bg-muted")
      }
    >
      {children}
    </button>
  )
}

interface ItemFormProps<T extends { id: string }> extends CollectionManagerProps<T> {
  /** The item being edited, or null when adding a new one */
  item: T | null
  onClose: () => void
  onSaved: () => void
  /** When adding several, some were saved before one failed */
  onSomeSaved: () => void
}

function ItemForm<T extends { id: string }>(props: ItemFormProps<T>) {
  const { noun, resource, fields, media, mediaOf, toInput, item, onClose, onSaved, onSomeSaved } = props
  // Several can be chosen only when adding; an existing item has the one
  const addUpTo = item ? 1 : (media?.addUpTo ?? 1)

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [field.name, String((item as Record<string, unknown> | null)?.[field.name] ?? "")])
    )
  )
  const [chosenMedia, setChosenMedia] = useState<MediaInfo[]>(() => {
    const existing = item && mediaOf ? mediaOf(item) : null
    return existing ? [existing] : []
  })
  const [error, setError] = useState("")

  /** Choosing or removing a photo answers "please add a photo first", so that message goes. */
  function changeMedia(chosen: MediaInfo[]) {
    setError("")
    setChosenMedia(chosen)
  }

  const save = useMutation({
    mutationFn: async () => {
      if (item) return resource.update(item.id, toInput(values, chosenMedia[0] ?? null))

      // One new item for each photo or video chosen (or a single one without)
      const each = chosenMedia.length > 0 ? chosenMedia : [null]
      for (const [done, picked] of each.entries()) {
        try {
          await resource.create(toInput(values, picked))
        } catch (e) {
          if (done === 0) throw e
          // Those already saved come off the list, so pressing Save again adds only the rest
          setChosenMedia(chosenMedia.slice(done))
          onSomeSaved()
          const reason = e instanceof Error ? e.message : "Something went wrong"
          throw new Error(`${done} of ${each.length} were added. The next one was not: ${reason}`)
        }
      }
    },
    onSuccess: onSaved,
    onError: (e: Error) => setError(e.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (media?.required && chosenMedia.length === 0) {
      setError(`Please add ${media.allowVideo ? "a photo or video" : "a photo"} first.`)
      return
    }
    save.mutate()
  }

  return (
    <Dialog title={item ? `Edit ${noun}` : `Add ${noun}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner message={error} />

        {media &&
          (addUpTo > 1 ? (
            <MediaListField
              label={media.label}
              value={chosenMedia}
              onChange={changeMedia}
              max={addUpTo}
              allowVideo={media.allowVideo}
              hint={media.hint}
            />
          ) : (
            <MediaField
              label={media.label}
              value={chosenMedia[0] ?? null}
              onChange={(chosen) => changeMedia(chosen ? [chosen] : [])}
              allowVideo={media.allowVideo}
              hint={(media.addUpTo ?? 1) > 1 ? undefined : media.hint}
            />
          ))}

        {fields.map((field) => {
          const shared = {
            label: field.label,
            value: values[field.name],
            onChange: (value: string) => setValues((current) => ({ ...current, [field.name]: value })),
            placeholder: field.placeholder,
            hint: field.hint,
          }
          if (field.kind === "textarea") return <TextAreaField key={field.name} {...shared} rows={4} />
          if (field.kind === "select") {
            // A value saved before the list existed stays choosable, so editing does not lose it
            const choices = [...new Set([...(field.options ?? []), ...(shared.value ? [shared.value] : [])])]
            return (
              <SelectField
                key={field.name}
                label={shared.label}
                value={shared.value}
                onChange={shared.onChange}
                hint={shared.hint}
                options={[{ value: "", label: field.placeholder ?? "None" }, ...choices.map((choice) => ({ value: choice, label: choice }))]}
              />
            )
          }
          return <TextField key={field.name} {...shared} />
        })}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" busy={save.isPending} className="flex-1">
            Save
          </PrimaryButton>
        </div>
      </form>
    </Dialog>
  )
}
