import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Calendar, User } from "lucide-react"
import { cloudinaryUrl } from "@/lib/cloudinary"
import { serverFetch } from "@/lib/server-api"
import type { Post } from "@/types"
import { formatDate, categoryLabel } from "@/lib/utils"
import { SectionLabel } from "@/components/layout/section-label"

export const metadata: Metadata = {
  title: "News & Updates",
  description: "Latest news, updates, and announcements from NAC UCC Campus Congregation.",
}

export default async function NewsPage() {
  const data = await serverFetch<{ posts: Post[] }>("/posts")
  const posts = data?.posts ?? []

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Updates</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">News & Updates</h1>
          <p className="text-silver-300 text-lg max-w-2xl">
            Stay informed about what God is doing in and through NAC UCC.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No posts published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-200"
                >
                  <div className="h-44 bg-linear-to-br from-navy-800 to-navy-950 relative overflow-hidden flex items-center justify-center">
                    {post.imagePublicId ? (
                      <Image
                        src={cloudinaryUrl(post.imagePublicId, { width: 640, height: 352 })}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-white/10 text-7xl font-black select-none">NAC</span>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full capitalize">
                        {categoryLabel(post.category)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author.name}</span>
                    </div>
                    <h2 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
