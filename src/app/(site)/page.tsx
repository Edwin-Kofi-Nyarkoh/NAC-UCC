import { Hero } from "@/components/home/hero"
import { WelcomeSection } from "@/components/home/welcome-section"
import { ServiceTimesBanner } from "@/components/home/service-times-banner"
import { UpcomingEvents } from "@/components/home/upcoming-events"
import { LatestSermons } from "@/components/home/latest-sermons"
import { NewsSection } from "@/components/home/news-section"
import { CtaSection } from "@/components/home/cta-section"
import { getSiteSettings, serverFetch } from "@/lib/server-api"
import { lines } from "@/lib/site-settings"
import { isUpcoming } from "@/lib/utils"
import type { Event, HeroSlide, Post, Sermon } from "@/types"

/** Up to four events for the home page: the next ones, or the latest past ones if nothing is coming up. */
function eventsForHome(events: Event[]): Event[] {
  const upcoming = events.filter((event) => isUpcoming(event.date))
  return upcoming.length > 0 ? upcoming.slice(0, 4) : events.slice(-4).reverse()
}

export default async function HomePage() {
  const [slideData, eventData, sermonData, postData, settings] = await Promise.all([
    serverFetch<{ slides: HeroSlide[] }>("/hero-slides"),
    serverFetch<{ events: Event[] }>("/events"),
    serverFetch<{ sermons: Sermon[] }>("/sermons"),
    serverFetch<{ posts: Post[] }>("/posts"),
    getSiteSettings(),
  ])

  return (
    <>
      <Hero slides={slideData?.slides ?? []} fallback={settings.hero} />
      <WelcomeSection />
      <ServiceTimesBanner
        services={settings.serviceTimes}
        address={lines(settings.contact.address).join(", ")}
      />
      <UpcomingEvents events={eventsForHome(eventData?.events ?? [])} />
      <LatestSermons sermons={(sermonData?.sermons ?? []).slice(0, 3)} />
      <NewsSection posts={(postData?.posts ?? []).slice(0, 3)} />
      <CtaSection />
    </>
  )
}
