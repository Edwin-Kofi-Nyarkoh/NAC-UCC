import type { Metadata } from "next"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { ContactForm } from "@/components/contact/contact-form"
import { SectionLabel } from "@/components/layout/section-label"
import { SocialLinks } from "@/components/layout/social-links"
import { getSiteSettings } from "@/lib/server-api"
import { lines } from "@/lib/site-settings"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with NAC UCC Campus Congregation.",
}

/** An OpenStreetMap embed centred on a point, with a marker. */
function Map({ latitude, longitude }: { latitude: number; longitude: number }) {
  const span = 0.02 // degrees of map shown either side of the marker
  const bbox = [longitude - span, latitude - span, longitude + span, latitude + span].join("%2C")

  return (
    <div className="rounded-2xl overflow-hidden border border-border h-48 sm:h-56 relative mb-5">
      <iframe
        title="Where to find us"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white/90 text-xs px-2 py-1 rounded text-navy-900 font-medium hover:bg-white transition-colors"
      >
        Open in Maps ↗
      </a>
    </div>
  )
}

// Address, phone, email, office hours, map position and social links all come
// from Admin → Site Settings. Anything not filled in is left out.
export default async function ContactPage() {
  const { contact, social } = await getSiteSettings()

  const details = [
    { icon: MapPin, title: "Location", rows: lines(contact.address) },
    { icon: Phone, title: "Phone", rows: lines(contact.phone) },
    { icon: Mail, title: "Email", rows: lines(contact.email) },
    { icon: Clock, title: "Office Hours", rows: lines(contact.officeHours) },
  ].filter((detail) => detail.rows.length > 0)

  const hasMap = contact.mapLatitude !== null && contact.mapLongitude !== null
  const hasSocial = Object.values(social).some(Boolean)
  const hasFindUs = details.length > 0 || hasMap || hasSocial

  return (
    <div className="pt-16 sm:pt-20">
      <section className="py-10 sm:py-16 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel className="mb-3 sm:mb-5">Reach Out</SectionLabel>
          <h1 className="text-3xl sm:text-5xl font-bold mb-3">Contact Us</h1>
          <p className="text-silver-300 text-base sm:text-lg max-w-2xl">
            We&apos;d love to hear from you. Reach out for prayer requests, ministry inquiries, or to find out more about NAC UCC.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn("grid gap-8 lg:gap-16", hasFindUs ? "lg:grid-cols-2" : "max-w-2xl mx-auto")}>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">Send Us a Message</h2>
              <ContactForm />
            </div>

            {hasFindUs && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">Find Us</h2>

                {details.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {details.map(({ icon: Icon, title, rows }) => (
                      <div key={title} className="bg-muted/50 border border-border rounded-2xl p-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-bold text-foreground text-xs mb-1">{title}</h3>
                        {rows.map((row) => (
                          <p key={row} className="text-muted-foreground text-xs leading-snug break-words">{row}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {hasMap && <Map latitude={contact.mapLatitude!} longitude={contact.mapLongitude!} />}

                {hasSocial && (
                  <div>
                    <h3 className="font-bold text-foreground text-sm mb-3">Follow Us</h3>
                    <SocialLinks
                      links={social}
                      showLabels
                      className="flex flex-wrap gap-2"
                      linkClassName="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm font-medium text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
