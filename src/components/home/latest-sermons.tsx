import Image from "next/image"
import Link from "next/link"
import { Play, Clock, BookOpen, ArrowRight } from "lucide-react"
import { Initials } from "@/components/ui/initials"
import { cloudinaryUrl } from "@/lib/cloudinary"
import { formatDate } from "@/lib/utils"
import type { Sermon } from "@/types"
import { SectionLabel } from "@/components/layout/section-label"

interface LatestSermonsProps {
  sermons: Sermon[]
}

export function LatestSermons({ sermons }: LatestSermonsProps) {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <SectionLabel className="mb-3">The Word</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Latest Sermons</h2>
          </div>
          <Link
            href="/sermons"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            All sermons <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured + side list */}
        {sermons.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-3xl text-muted-foreground">
            <Play className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No sermons yet</p>
            <p className="text-sm mt-1">Sermons will appear here once uploaded.</p>
          </div>
        ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Featured sermon */}
          {sermons[0] && (
            <Link
              href={`/sermons/${sermons[0].slug}`}
              className="lg:col-span-3 group relative bg-navy-950 rounded-3xl overflow-hidden min-h-[320px] flex flex-col justify-end p-8 hover:shadow-2xl transition-shadow"
            >
              {/* Background: the sermon's photo if it has one, darkened so the text stays readable */}
              <div className="absolute inset-0 bg-linear-to-br from-navy-800 via-navy-900 to-navy-950" />
              {sermons[0].imagePublicId && (
                <>
                  <Image
                    src={cloudinaryUrl(sermons[0].imagePublicId, { width: 1000, height: 640 })}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/75 to-navy-950/30" />
                </>
              )}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle at 20% 80%, var(--color-navy-500) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--color-navy-600) 0%, transparent 50%)"
                }}
              />

              {/* Play button */}
              <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-6 h-6 text-white ml-0.5" />
              </div>

              <div className="relative">
                <div className="flex items-center gap-2 text-gold text-xs font-semibold mb-4">
                  <BookOpen className="w-4 h-4" />
                  {sermons[0].scripture}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-primary-foreground transition-colors">
                  {sermons[0].title}
                </h3>
                <p className="text-silver-400 text-sm leading-relaxed mb-5 line-clamp-2">
                  {sermons[0].description}
                </p>
                <div className="flex items-center gap-4">
                  <Initials name={sermons[0].preacher} className="bg-primary/20 text-xs" />
                  <div>
                    <p className="text-white text-sm font-medium">{sermons[0].preacher}</p>
                    <p className="text-silver-500 text-xs">{formatDate(sermons[0].date)}</p>
                  </div>
                  {sermons[0].duration && (
                    <div className="ml-auto flex items-center gap-1.5 text-silver-500 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {sermons[0].duration}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Sermon list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {sermons.slice(1).map((sermon) => (
              <Link
                key={sermon.id}
                href={`/sermons/${sermon.slug}`}
                className="group flex gap-4 p-5 rounded-2xl bg-muted/50 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Play className="w-4 h-4 text-primary ml-0.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gold font-semibold mb-1">{sermon.scripture}</p>
                  <h4 className="font-semibold text-foreground text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {sermon.title}
                  </h4>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    <span>{sermon.preacher}</span>
                    {sermon.duration && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {sermon.duration}
                        </span>
                      </>
                    )}
                  </div>
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
