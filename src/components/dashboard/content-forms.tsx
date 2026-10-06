"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ErrorBanner, LoadingState, TextField } from "@/components/dashboard/form-fields"
import { PostEditor } from "@/components/dashboard/post-editor"
import { api } from "@/lib/api"
import type { Event, MediaItem, Post, Sermon } from "@/types"

// The create and edit screens for posts, medical posts, events and sermons.
// Each dashboard page is a thin wrapper: pass `id` to edit an existing record,
// leave it out to create a new one.

interface FormProps {
  /** The record to edit. Leave out to create a new one. */
  id?: string
  /** The list to return to, e.g. "/admin/posts" */
  backHref: string
}

/** Loads the record being edited. Does nothing when creating. */
function useRecord<T>(key: string, id: string | undefined, load: (id: string) => Promise<T>) {
  return useQuery({
    queryKey: ["dashboard", key, id],
    queryFn: () => load(id!),
    enabled: Boolean(id),
    // Always start an edit from what is in the database, never a cached copy
    staleTime: 0,
    gcTime: 0,
  })
}

/** What to show in place of the form while an edit is loading, or if it could not be loaded. */
function Pending({ loading, error }: { loading: boolean; error: Error | null }) {
  if (loading) return <LoadingState />
  return (
    <ErrorBanner message={error?.message ?? "Could not load this item."} className="max-w-4xl mx-auto" />
  )
}

/** The first image attached is the one shown in listings. */
function featuredImage(items: MediaItem[]): string {
  return items.find((item) => item.type === "image")?.publicId ?? ""
}

function imageAsMedia(imagePublicId?: string | null): MediaItem[] {
  return imagePublicId ? [{ type: "image", publicId: imagePublicId }] : []
}

/** "2026-10-03T00:00:00.000Z" → "2026-10-03", the form a date input wants. */
function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : ""
}

function toIsoDate(dateInput: string, what: string): string {
  if (!dateInput) throw new Error(`Please choose the ${what}.`)
  return new Date(dateInput).toISOString()
}

function Card({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h2 className="font-semibold text-foreground text-sm">{heading}</h2>
      {children}
    </div>
  )
}

// Posts and medical posts

interface PostFormProps extends FormProps {
  kind: "posts" | "medical"
  categories: string[]
  /** "Post" gives the headings "New Post" and "Edit Post" */
  noun: string
}

export function PostForm({ id, backHref, kind, categories, noun }: PostFormProps) {
  const resource = api[kind]
  const { data: post, isLoading, error } = useRecord<Post>(kind, id, resource.byId)

  if (id && !post) return <Pending loading={isLoading} error={error} />

  return (
    <PostEditor
      title={id ? `Edit ${noun}` : `New ${noun}`}
      backHref={backHref}
      categories={categories}
      initialData={
        post && {
          title: post.title,
          content: post.content,
          excerpt: post.excerpt ?? "",
          category: post.category,
          // Older posts only have a single featured image
          mediaItems: post.mediaItems?.length ? post.mediaItems : imageAsMedia(post.imagePublicId),
          published: post.published,
        }
      }
      onSave={async (form) => {
        const input = {
          title: form.title.trim(),
          content: form.content,
          excerpt: form.excerpt.trim(),
          // With no category chosen, the server applies its default
          category: form.category || undefined,
          mediaItems: form.mediaItems,
          imagePublicId: featuredImage(form.mediaItems),
          published: form.published,
        }
        if (id) await resource.update(id, input)
        else await resource.create(input)
      }}
    />
  )
}

// Events

const EVENT_CATEGORIES = ["service", "fellowship", "outreach", "youth", "other"]

export function EventForm({ id, backHref }: FormProps) {
  const { data: event, isLoading, error } = useRecord("events", id, api.events.byId)
  if (id && !event) return <Pending loading={isLoading} error={error} />
  return <EventEditor id={id} backHref={backHref} event={event} />
}

function EventEditor({ id, backHref, event }: FormProps & { event?: Event }) {
  const [date, setDate] = useState(toDateInput(event?.date))
  const [time, setTime] = useState(event?.time ?? "")
  const [location, setLocation] = useState(event?.location ?? "")

  return (
    <PostEditor
      title={id ? "Edit Event" : "New Event"}
      backHref={backHref}
      categories={EVENT_CATEGORIES}
      contentLabel="Description"
      showExcerpt={false}
      maxMedia={1}
      allowVideo={false}
      initialData={
        event && {
          title: event.title,
          content: event.description,
          category: event.category,
          mediaItems: imageAsMedia(event.imagePublicId),
          published: event.published,
        }
      }
      extraFields={
        <Card heading="Event Details">
          <TextField label="Date" type="date" value={date} onChange={setDate} />
          <TextField label="Time" value={time} onChange={setTime} placeholder="e.g. 9:00 AM" />
          <TextField label="Location" value={location} onChange={setLocation} placeholder="Where it takes place" />
        </Card>
      }
      onSave={async (form) => {
        const input = {
          title: form.title.trim(),
          description: form.content,
          imagePublicId: featuredImage(form.mediaItems),
          category: form.category || undefined,
          published: form.published,
          date: toIsoDate(date, "event date"),
          time: time.trim(),
          location: location.trim(),
        }
        if (id) await api.events.update(id, input)
        else await api.events.create(input)
      }}
    />
  )
}

// Sermons

export function SermonForm({ id, backHref }: FormProps) {
  const { data: sermon, isLoading, error } = useRecord("sermons", id, api.sermons.byId)
  if (id && !sermon) return <Pending loading={isLoading} error={error} />
  return <SermonEditor id={id} backHref={backHref} sermon={sermon} />
}

function SermonEditor({ id, backHref, sermon }: FormProps & { sermon?: Sermon }) {
  const [preacher, setPreacher] = useState(sermon?.preacher ?? "")
  const [scripture, setScripture] = useState(sermon?.scripture ?? "")
  const [date, setDate] = useState(toDateInput(sermon?.date))
  const [duration, setDuration] = useState(sermon?.duration ?? "")
  const [videoPublicId, setVideoPublicId] = useState(sermon?.videoPublicId ?? "")

  return (
    <PostEditor
      title={id ? "Edit Sermon" : "New Sermon"}
      backHref={backHref}
      categories={[]}
      contentLabel="Description"
      showExcerpt={false}
      maxMedia={1}
      allowVideo={false}
      initialData={
        sermon && {
          title: sermon.title,
          content: sermon.description,
          mediaItems: imageAsMedia(sermon.imagePublicId),
          published: sermon.published,
        }
      }
      extraFields={
        <Card heading="Sermon Details">
          <TextField label="Preacher" value={preacher} onChange={setPreacher} placeholder="Who preached" />
          <TextField label="Scripture reference" value={scripture} onChange={setScripture} placeholder="e.g. John 3:16" />
          <TextField label="Sermon date" type="date" value={date} onChange={setDate} />
          <TextField label="Duration" value={duration} onChange={setDuration} placeholder="e.g. 45 min" />
          <TextField
            label="Video (Cloudinary ID)"
            value={videoPublicId}
            onChange={setVideoPublicId}
            mono
            hint="Optional. The ID of the sermon recording on Cloudinary."
          />
        </Card>
      }
      onSave={async (form) => {
        if (!preacher.trim()) throw new Error("Please enter the preacher's name.")
        const input = {
          title: form.title.trim(),
          description: form.content,
          imagePublicId: featuredImage(form.mediaItems),
          published: form.published,
          preacher: preacher.trim(),
          scripture: scripture.trim(),
          date: toIsoDate(date, "sermon date"),
          duration: duration.trim(),
          videoPublicId: videoPublicId.trim(),
        }
        if (id) await api.sermons.update(id, input)
        else await api.sermons.create(input)
      }}
    />
  )
}
