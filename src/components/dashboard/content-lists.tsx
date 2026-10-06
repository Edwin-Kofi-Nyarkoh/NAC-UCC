"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ContentTable, type ContentRow } from "@/components/dashboard/content-table"
import { ErrorBanner } from "@/components/dashboard/form-fields"
import { api } from "@/lib/api"
import type { Event, Post, Sermon } from "@/types"

// The "all posts / events / sermons" screens. Admins, editors and the medical
// minister each get their own URL for these, so every page passes the path it
// lives at and the lists link to the right create and edit pages.

interface ListPageProps {
  /** Where this list lives, e.g. "/admin/posts" */
  basePath: string
  description: string
}

interface ContentListProps<T> extends ListPageProps {
  heading: string
  tableTitle: string
  /** e.g. "Post", for the "New Post" button */
  noun: string
  queryKey: string
  resource: {
    all: () => Promise<T[]>
    update: (id: string, input: Partial<T>) => Promise<unknown>
    remove: (id: string) => Promise<unknown>
  }
  toRow: (item: T) => ContentRow
}

function ContentList<T extends { published: boolean }>(props: ContentListProps<T>) {
  const { basePath, description, heading, tableTitle, noun, queryKey, resource, toRow } = props
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: items = [], isLoading, error } = useQuery({ queryKey: [queryKey], queryFn: resource.all })
  const refresh = () => queryClient.invalidateQueries({ queryKey: [queryKey] })

  const remove = useMutation({ mutationFn: resource.remove, onSuccess: refresh })
  const setPublished = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      resource.update(id, { published } as Partial<T>),
    onSuccess: refresh,
  })

  const problem = error ?? remove.error ?? setPublished.error

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{heading}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>

      <ErrorBanner message={problem?.message} className="mb-6" />

      <ContentTable
        title={tableTitle}
        rows={items.map(toRow)}
        loading={isLoading}
        createHref={`${basePath}/new`}
        createLabel={`New ${noun}`}
        onEdit={(id) => router.push(`${basePath}/${id}`)}
        // A failed delete is reported in the banner above
        onDelete={(id) => remove.mutateAsync(id).catch(() => undefined)}
        onTogglePublish={(id, published) => setPublished.mutate({ id, published })}
      />
    </div>
  )
}

const postRow = (post: Post): ContentRow => ({
  id: post.id,
  title: post.title,
  category: post.category,
  published: post.published,
  author: post.author?.name,
  date: post.createdAt,
})

export function PostsList(props: ListPageProps) {
  return (
    <ContentList<Post>
      {...props}
      heading="Posts & News"
      tableTitle="All Posts"
      noun="Post"
      queryKey="posts"
      resource={api.posts}
      toRow={postRow}
    />
  )
}

export function MedicalPostsList(props: ListPageProps) {
  return (
    <ContentList<Post>
      {...props}
      heading="Medical Posts"
      tableTitle="All Medical Posts"
      noun="Post"
      queryKey="medical-posts"
      resource={api.medical}
      toRow={postRow}
    />
  )
}

export function EventsList(props: ListPageProps) {
  return (
    <ContentList<Event>
      {...props}
      heading="Events"
      tableTitle="All Events"
      noun="Event"
      queryKey="events"
      resource={api.events}
      toRow={(event) => ({
        id: event.id,
        title: event.title,
        category: event.category,
        published: event.published,
        date: event.date,
        extra: [event.time, event.location].filter(Boolean).join(" · "),
      })}
    />
  )
}

export function SermonsList(props: ListPageProps) {
  return (
    <ContentList<Sermon>
      {...props}
      heading="Sermons"
      tableTitle="All Sermons"
      noun="Sermon"
      queryKey="sermons"
      resource={api.sermons}
      toRow={(sermon) => ({
        id: sermon.id,
        title: sermon.title,
        published: sermon.published,
        date: sermon.date,
        extra: [sermon.preacher, sermon.scripture].filter(Boolean).join(" · "),
      })}
    />
  )
}
