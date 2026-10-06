import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Play, Clock, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cloudinaryUrl } from "@/lib/cloudinary"
import { serverFetch } from "@/lib/server-api"
import type { Sermon } from "@/types"
import { formatDate, initials } from "@/lib/utils"
import { SectionLabel } from "@/components/layout/section-label"

export const metadata: Metadata = {
  title: "Sermons",
  description: "Listen to sermons and messages from NAC UCC Campus Congregation.",
}

export default async function SermonsPage() {
  const data = await serverFetch<{ sermons: Sermon[] }>("/sermons")
  const sermons = data?.sermons ?? []

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>The Word</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Sermons</h1>
          <p className="text-silver-300 text-lg max-w-2xl">
            Revisit powerful messages from our pastors and ministers. Let the Word of God transform your life.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sermons.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Play className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No sermons published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sermons.map((sermon) => (
                <Link
                  key={sermon.id}
                  href={`/sermons/${sermon.slug}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-200"
                >
                  <div className="h-36 bg-linear-to-br from-navy-800 to-navy-950 relative flex items-center justify-center overflow-hidden">
                    {sermon.imagePublicId && (
                      <>
                        <Image
                          src={cloudinaryUrl(sermon.imagePublicId, { width: 640, height: 288 })}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-navy-950/50" />
                      </>
                    )}
                    <div className="relative w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Play className="w-6 h-6 text-primary ml-0.5" />
                    </div>
                    {sermon.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {sermon.duration}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-gold text-xs font-semibold mb-3">
                      <BookOpen className="w-3.5 h-3.5" /> {sermon.scripture}
                    </div>
                    <h2 className="font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
                      {sermon.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
                      {sermon.description}
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-border">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials(sermon.preacher)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-foreground text-xs font-semibold truncate">{sermon.preacher}</p>
                        <p className="text-muted-foreground text-xs">{formatDate(sermon.date)}</p>
                      </div>
                    </div>
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
