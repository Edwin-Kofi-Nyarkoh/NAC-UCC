import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"
import { SectionLabel } from "@/components/layout/section-label"
import { serverFetch } from "@/lib/server-api"
import { cn, isUpcoming } from "@/lib/utils"
import type { Event } from "@/types"

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming events and programmes at NAC UCC Campus Congregation.",
}

const categoryColors: Record<string, string> = {
  service: "bg-navy-100 text-navy-700 dark:bg-navy-900/40 dark:text-navy-300",
  fellowship: "bg-silver-100 text-silver-700 dark:bg-silver-900/40 dark:text-silver-300",
  outreach: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  youth: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  other: "bg-muted text-muted-foreground",
}

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date)

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col sm:flex-row gap-6 p-6 bg-card border border-border rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all duration-200"
    >
      <div className="shrink-0 w-20 text-center">
        <div className="text-4xl font-bold text-primary leading-none">{date.getUTCDate()}</div>
        <div className="text-sm font-semibold text-primary/70 uppercase tracking-wide mt-1">
          {date.toLocaleString("en-GH", { month: "short", timeZone: "UTC" })}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{date.getUTCFullYear()}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-3 mb-2">
          <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
              categoryColors[event.category] ?? categoryColors.other
            )}
          >
            {event.category}
          </span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">{event.description}</p>
        <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
          {event.time && (
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {event.time}</span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.location}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default async function EventsPage() {
  const data = await serverFetch<{ events: Event[] }>("/events")
  const events = data?.events ?? [] // oldest first

  const upcoming = events.filter((event) => isUpcoming(event.date))
  const past = events.filter((event) => !isUpcoming(event.date)).reverse() // most recent first

  return (
    <div className="pt-20">
      <section className="py-20 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Calendar</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Events</h1>
          <p className="text-silver-300 text-lg max-w-2xl">Stay connected with what&apos;s happening at NAC UCC.</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Events</h2>
            {upcoming.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-3xl text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-lg">No upcoming events at this time. Check back soon.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Past Events</h2>
              <div className="space-y-5">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
