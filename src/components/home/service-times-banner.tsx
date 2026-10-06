import { Clock, MapPin } from "lucide-react"
import type { ServiceTime } from "@/lib/site-settings"

interface ServiceTimesBannerProps {
  services: ServiceTime[]
  /** Where the services are held, on one line */
  address: string
}

/** Weekly service times from Admin → Site Settings. Hidden until some are entered. */
export function ServiceTimesBanner({ services, address }: ServiceTimesBannerProps) {
  if (services.length === 0) return null

  return (
    <section className="bg-primary text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">Join Us for Worship</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {services.map((service) => (
            <div
              key={`${service.name}-${service.day}`}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="text-3xl font-bold text-white/90">{service.day}</span>
                {service.note && (
                  <div className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {service.note}
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-white mb-3 text-sm">{service.name}</h3>
              <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{service.time}</span>
              </div>
            </div>
          ))}
        </div>

        {address && (
          <div className="mt-8 flex items-center justify-center gap-2 text-primary-foreground/70 text-sm">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{address}</span>
          </div>
        )}
      </div>
    </section>
  )
}
