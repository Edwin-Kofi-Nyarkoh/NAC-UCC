import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar, Tag } from "lucide-react"
import { cloudinaryUrl } from "@/lib/cloudinary"
import { categoryLabel, formatDate, truncate } from "@/lib/utils"
import type { Post } from "@/types"
import { SectionLabel } from "@/components/layout/section-label"

interface NewsSectionProps {
  posts: Post[]
}

export function NewsSection({ posts }: NewsSectionProps) {
  const [featured, ...rest] = posts

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <SectionLabel className="mb-3">News & Updates</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Latest from NAC UCC</h2>
          </div>
          <Link
            href="/news"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            All news <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!featured ? (
          <div className="text-center py-16 border border-dashed border-border rounded-3xl text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No news yet</p>
            <p className="text-sm mt-1">News and updates will appear here once published.</p>
          </div>
        ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured post */}
          {featured && (
            <Link
              href={`/news/${featured.slug}`}
              className="lg:col-span-1 group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-200"
            >
              {/* The post's featured photo, or a plain branded panel if it has none */}
              <div className="h-52 bg-linear-to-br from-navy-800 to-navy-950 relative overflow-hidden">
                {featured.imagePublicId ? (
                  <Image
                    src={cloudinaryUrl(featured.imagePublicId, { width: 800, height: 416 })}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/20 text-8xl font-black select-none">NAC</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full capitalize">
                    {categoryLabel(featured.category)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(featured.createdAt)}
                </div>
                <h3 className="font-bold text-foreground text-base mb-3 group-hover:text-primary transition-colors leading-tight">
                  {featured.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {truncate(featured.excerpt ?? "", 120)}
                </p>
              </div>
            </Link>
          )}

          {/* Rest of posts */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group flex gap-5 p-5 bg-card border border-border rounded-2xl hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                {/* Date block */}
                <div className="shrink-0 text-center w-12">
                  <div className="text-2xl font-bold text-primary leading-none">
                    {new Date(post.createdAt).getDate()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                    {new Date(post.createdAt).toLocaleString("default", { month: "short" })}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary/80 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> <span className="capitalize">{categoryLabel(post.category)}</span>
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-xs text-muted-foreground">{post.author.name}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1.5 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  )
}
