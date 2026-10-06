import Link from "next/link"
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react"
import type { Event } from "@/types"
import { SectionLabel } from "@/components/layout/section-label"

const categoryColors: Record<string, string> = {
  service: "bg-navy-100 text-navy-700 dark:bg-navy-900/40 dark:text-navy-300",
  fellowship: "bg-silver-100 text-silver-700 dark:bg-silver-900/40 dark:text-silver-300",
  outreach: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  youth: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  other: "bg-muted text-muted-foreground",
}

interface UpcomingEventsProps {
  events: Event[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <SectionLabel className="mb-3">Calendar</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Upcoming Events</h2>
          </div>
          <Link
            href="/events"
            className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            View all events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Event grid */}
        {events.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-3xl text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No upcoming events</p>
            <p className="text-sm mt-1">Check back soon for upcoming events.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200"
            >
              {/* Date header */}
              <div className="bg-primary/10 px-5 pt-5 pb-4 flex items-start gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary leading-none">
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="text-xs font-semibold text-primary/70 uppercase tracking-wide mt-1">
                    {new Date(event.date).toLocaleString("default", { month: "short" })}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[event.category] ?? categoryColors.other} capitalize`}>
                  {event.category}
                </span>
              </div>

              <div className="px-5 py-4">
                <h3 className="font-bold text-foreground text-sm mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {event.title}
                </h3>
                <div className="space-y-1.5 text-muted-foreground text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}
