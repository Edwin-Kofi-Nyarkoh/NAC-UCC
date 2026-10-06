import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { ShareButton } from "@/components/ui/share-button"
import { cloudinaryUrl } from "@/lib/cloudinary"
import { serverFetch } from "@/lib/server-api"
import { formatDate, truncate } from "@/lib/utils"
import type { Event } from "@/types"

interface Props {
  params: Promise<{ slug: string }>
}

// Nothing is built ahead of time. Each of these pages is built the first time
// someone opens it and then served from the cache, like the rest of the site.
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await serverFetch<{ event: Event }>(`/events/${slug}`)
  if (!data) return {}
  return { title: data.event.title, description: truncate(data.event.description, 160) }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const data = await serverFetch<{ event: Event }>(`/events/${slug}`)
  if (!data) notFound()

  const event = data.event

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb currentLabel={event.title} className="mb-6" />
          <Link href="/events" className="inline-flex items-center gap-2 text-silver-400 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Events
          </Link>
          <span className="bg-primary/20 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full capitalize mb-5 inline-block">
            {event.category}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">{event.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6 text-silver-300 text-sm">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(event.date)}</span>
              {event.time && (
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {event.time}</span>
              )}
              {event.location && (
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location}</span>
              )}
            </div>
            <ShareButton title={event.title} text={truncate(event.description, 160)} variant="icon" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {event.imagePublicId && (
            <Image
              src={cloudinaryUrl(event.imagePublicId, { width: 1200, height: 675 })}
              alt={event.title}
              width={1200}
              height={675}
              className="w-full h-auto rounded-3xl mb-10"
            />
          )}
          <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">{event.description}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/contact" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
              Get in Touch
            </Link>
            <Link href="/events" className="px-6 py-3 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors">
              All Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
