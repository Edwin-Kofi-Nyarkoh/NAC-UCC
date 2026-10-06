import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BookOpen, User, Clock, Calendar } from "lucide-react"
import { Initials } from "@/components/ui/initials"
import { serverFetch } from "@/lib/server-api"
import type { Sermon } from "@/types"
import { formatDate } from "@/lib/utils"
import { cloudinaryUrl, cloudinaryVideoUrl, cloudinaryVideoPoster } from "@/lib/cloudinary"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { ShareButton } from "@/components/ui/share-button"
import { SermonComments } from "@/components/sermons/sermon-comments"
import { QueryProvider } from "@/components/query-provider"

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
  const data = await serverFetch<{ sermon: Sermon }>(`/sermons/${slug}`)
  if (!data) return {}
  return { title: data.sermon.title, description: data.sermon.description }
}

export default async function SermonDetailPage({ params }: Props) {
  const { slug } = await params
  const data = await serverFetch<{ sermon: Sermon }>(`/sermons/${slug}`)
  if (!data) notFound()

  const sermon = data.sermon

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb currentLabel={sermon.title} className="mb-6" />
          <Link href="/sermons" className="inline-flex items-center gap-2 text-silver-400 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Sermons
          </Link>
          <div className="flex items-center gap-2 text-gold text-sm font-semibold mb-5">
            <BookOpen className="w-4 h-4" /> {sermon.scripture}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 max-w-3xl">{sermon.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-5 text-silver-300 text-sm">
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> {sermon.preacher}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(sermon.date)}</span>
              {sermon.duration && (
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {sermon.duration}</span>
              )}
            </div>
            <ShareButton title={sermon.title} text={sermon.description} variant="icon" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* The recording, with the sermon's photo as its cover; or just the photo if there is no recording */}
          {sermon.videoPublicId ? (
            <video
              src={cloudinaryVideoUrl(sermon.videoPublicId)}
              poster={
                sermon.imagePublicId
                  ? cloudinaryUrl(sermon.imagePublicId, { width: 1280, height: 720 })
                  : cloudinaryVideoPoster(sermon.videoPublicId)
              }
              controls
              className="w-full rounded-3xl mb-10 bg-navy-950"
            />
          ) : (
            sermon.imagePublicId && (
              <Image
                src={cloudinaryUrl(sermon.imagePublicId, { width: 1200, height: 675 })}
                alt={sermon.title}
                width={1200}
                height={675}
                className="w-full h-auto rounded-3xl mb-10"
              />
            )
          )}

          <div className="flex items-center gap-4 mb-8 p-5 bg-muted/50 rounded-2xl border border-border">
            <Initials name={sermon.preacher} className="w-12 h-12 font-bold" />
            <div>
              <p className="font-bold text-foreground">{sermon.preacher}</p>
              <p className="text-muted-foreground text-sm">{formatDate(sermon.date)}</p>
            </div>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed mb-6">{sermon.description}</p>

          <div className="flex items-center justify-between flex-wrap gap-4 mt-8 pt-8 border-t border-border">
            <Link href="/sermons" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Sermons
            </Link>
            <ShareButton title={sermon.title} text={sermon.description} />
          </div>

          {/* Comments */}
          {/* Comments are loaded in the browser, so they are always current */}
          <QueryProvider>
            <SermonComments sermonId={sermon.id} />
          </QueryProvider>
        </div>
      </section>
    </div>
  )
}
