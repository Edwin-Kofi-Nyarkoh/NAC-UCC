import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, Users, Calendar, ArrowLeft } from "lucide-react"
import { cloudinaryUrl } from "@/lib/cloudinary"
import { serverFetch } from "@/lib/server-api"
import { truncate } from "@/lib/utils"
import type { Ministry } from "@/types"

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
  const data = await serverFetch<{ ministry: Ministry }>(`/ministries/${slug}`)
  if (!data) return {}
  return { title: data.ministry.name, description: truncate(data.ministry.description, 160) }
}

export default async function MinistryDetailPage({ params }: Props) {
  const { slug } = await params
  const [data, allData] = await Promise.all([
    serverFetch<{ ministry: Ministry }>(`/ministries/${slug}`),
    serverFetch<{ ministries: Ministry[] }>("/ministries"),
  ])
  if (!data) notFound()

  const ministry = data.ministry
  const others = (allData?.ministries ?? []).filter((m) => m.slug !== slug).slice(0, 3)

  const details = [
    { icon: Users, label: "Ministry Leader", value: ministry.leader },
    { icon: Calendar, label: "Meeting Day", value: ministry.meetingDay },
    { icon: Clock, label: "Meeting Time", value: ministry.meetingTime },
  ].filter((detail) => detail.value)

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/ministries" className="inline-flex items-center gap-2 text-silver-400 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Ministries
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">{ministry.name}</h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {ministry.imagePublicId && (
              <Image
                src={cloudinaryUrl(ministry.imagePublicId, { width: 1200, height: 600 })}
                alt={ministry.name}
                width={1200}
                height={600}
                className="w-full h-auto rounded-3xl mb-8"
              />
            )}
            <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
              {ministry.description}
            </p>
          </div>

          <div className="space-y-6">
            {details.length > 0 && (
              <div className="bg-muted/50 border border-border rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-foreground">Ministry Details</h2>
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 text-sm">
                    <Icon className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
                      <p className="font-medium text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/contact"
              className="block w-full text-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Get Involved
            </Link>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="py-12 bg-muted/30 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Other Ministries</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/ministries/${other.slug}`}
                  className="group p-5 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{other.name}</h3>
                  <p className="text-muted-foreground text-xs line-clamp-2">{other.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
