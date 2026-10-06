import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { serverFetch } from "@/lib/server-api"
import type { Post } from "@/types"
import { formatDate, categoryLabel } from "@/lib/utils"
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
  const data = await serverFetch<{ post: Post }>(`/posts/${slug}`)
  if (!data) return {}
  return { title: data.post.title, description: data.post.excerpt }
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const data = await serverFetch<{ post: Post }>(`/posts/${slug}`)
  if (!data) notFound()

  const post = data.post

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb currentLabel={post.title} className="mb-6" />
          <Link href="/news" className="inline-flex items-center gap-2 text-silver-400 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All News
          </Link>
          <span className="inline-block bg-primary/20 text-gold text-xs font-semibold px-3 py-1 rounded-full mb-5 capitalize">
            {categoryLabel(post.category)}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-5 text-silver-400 text-sm">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(post.createdAt)}</span>
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> {post.author.name}</span>
            </div>
            <ShareButton title={post.title} text={post.excerpt} variant="icon" />
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <PostMediaGallery
            imagePublicId={post.imagePublicId}
            mediaItems={post.mediaItems}
            title={post.title}
          />
          {post.excerpt && (
            <p className="text-muted-foreground text-xl leading-relaxed font-medium mb-6">{post.excerpt}</p>
          )}
          <ArticleBody text={post.content} />
          <div className="mt-10 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
            <Link href="/news" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to News
            </Link>
            <ShareButton title={post.title} text={post.excerpt} />
          </div>
        </div>
      </section>
    </div>
  )
}
