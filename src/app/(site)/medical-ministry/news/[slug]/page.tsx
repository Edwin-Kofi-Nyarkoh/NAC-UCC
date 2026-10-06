import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, AlertTriangle, Calendar, User } from "lucide-react"
import { serverFetch } from "@/lib/server-api"
import type { MedicalPost } from "@/types"
import { formatDate, cn } from "@/lib/utils"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { ShareButton } from "@/components/ui/share-button"
import { PostMediaGallery } from "@/components/content/post-media-gallery"
import { ArticleBody } from "@/components/content/article-body"

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
  const data = await serverFetch<{ post: MedicalPost }>(`/medical/${slug}`)
  if (!data) return {}
  return { title: data.post.title, description: data.post.excerpt }
}

export default async function MedicalPostPage({ params }: Props) {
  const { slug } = await params
  const data = await serverFetch<{ post: MedicalPost }>(`/medical/${slug}`)
  if (!data) notFound()

  const post = data.post
  const isEmergency = post.category === "EMERGENCY"

  return (
    <div className="pt-20">
      <section className={cn("py-20 text-white", isEmergency ? "bg-red-900" : "bg-navy-950")}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb currentLabel={post.title} className="mb-6" />
          <Link
            href="/medical-ministry/news"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Health News
          </Link>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5",
              isEmergency
                ? "bg-red-500 text-white"
                : "bg-primary/20 text-gold"
            )}
          >
            {isEmergency && <AlertTriangle className="w-3.5 h-3.5" />}
            {isEmergency ? "Emergency Alert" : "General Health News"}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-5 text-white/60 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {formatDate(post.createdAt)}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" /> {post.author.name}
              </span>
            </div>
            <ShareButton title={post.title} text={post.excerpt} variant="icon" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {isEmergency && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 mb-8 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">This is an emergency health alert. Please read carefully and share with those who may be affected.</p>
            </div>
          )}

          <PostMediaGallery
            imagePublicId={post.imagePublicId}
            mediaItems={post.mediaItems}
            title={post.title}
          />
          {post.excerpt && (
            <p className="text-muted-foreground text-xl leading-relaxed font-medium mb-6">{post.excerpt}</p>
          )}

          <ArticleBody text={post.content} />

          <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <Link
                href="/medical-ministry/news"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> All Health News
              </Link>
              <Link
                href="/medical-ministry"
                className="inline-flex items-center gap-2 text-muted-foreground font-semibold text-sm hover:text-foreground transition-colors"
              >
                Medical Ministry Home
              </Link>
            </div>
            <ShareButton title={post.title} text={post.excerpt} />
          </div>
        </div>
      </section>
    </div>
  )
}
