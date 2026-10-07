import { MapPin, Phone, Mail } from "lucide-react"
import { IntentLink } from "@/components/layout/intent-link"
import { Logo } from "@/components/layout/logo"
import { SocialLinks } from "@/components/layout/social-links"
import { footerNav } from "@/config/navigation"
import { lines, type SiteSettings } from "@/lib/site-settings"

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <IntentLink href={link.href} className="text-silver-400 hover:text-white text-sm transition-colors">
              {link.label}
            </IntentLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Service times and contact details come from Admin → Site Settings and are left out until entered. */
export function Footer({ settings }: { settings: SiteSettings }) {
  const { contact, serviceTimes, social } = settings
  const address = lines(contact.address).join(", ")
  const hasContact = Boolean(address || contact.phone || contact.email)

  return (
    // The space at the very bottom keeps the last lines clear of the phone's tab bar
    <footer className="bg-navy-950 text-silver-200 pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <IntentLink href="/" className="flex items-center gap-3 mb-5">
              <Logo />
              <div>
                <p className="font-bold text-white text-sm leading-tight">NAC UCC</p>
                <p className="text-silver-400 text-xs leading-tight">Campus Congregation</p>
              </div>
            </IntentLink>
            <p className="text-silver-400 text-sm leading-relaxed mb-6">
              A vibrant community of believers on the University of Cape Coast campus, committed to worship, fellowship, and reaching the lost.
            </p>
            <SocialLinks
              links={social}
              className="flex gap-3"
              linkClassName="w-9 h-9 rounded-full bg-navy-800 hover:bg-primary flex items-center justify-center transition-colors"
            />
          </div>

          <LinkColumn title="Congregation" links={footerNav.congregation} />
          <LinkColumn title="Connect" links={footerNav.connect} />

          {(serviceTimes.length > 0 || hasContact) && (
            <div>
              {serviceTimes.length > 0 && (
                <>
                  <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
                    Service Times
                  </h3>
                  <ul className="space-y-4 mb-8">
                    {serviceTimes.map((service) => (
                      <li key={`${service.name}-${service.day}`} className="flex justify-between items-start gap-3 text-sm">
                        <div>
                          <p className="text-white font-medium">{service.name}</p>
                          <p className="text-silver-500">{service.day}</p>
                        </div>
                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                          {service.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {hasContact && (
                <div className="space-y-3 text-sm text-silver-400">
                  {address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>{address}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 shrink-0 text-primary" />
                      <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white transition-colors">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 shrink-0 text-primary" />
                      <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors">
                        {contact.email}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-px w-full bg-navy-800" />

        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-silver-500 text-xs">
          <p>
            &copy; {new Date().getFullYear()} New Apostolic Church — UCC Campus Congregation. All rights reserved.
          </p>
          <p>
            Built with <span className="text-primary">♥</span> for His glory
          </p>
        </div>
      </div>
    </footer>
  )
}
