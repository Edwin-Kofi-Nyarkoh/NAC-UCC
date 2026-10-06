export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

/**
 * Top navigation of the public site.
 * The Ministries entry gets a dropdown of the ministries added in the dashboard.
 */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Ministries", href: "/ministries" },
  { label: "Events", href: "/events" },
  { label: "Sermons", href: "/sermons" },
  { label: "News", href: "/news" },
  {
    label: "Medical",
    href: "/medical-ministry",
    children: [
      { label: "Health Ministry", href: "/medical-ministry" },
      { label: "Health News & Alerts", href: "/medical-ministry/news" },
    ],
  },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
]

/** Link columns in the footer. */
export const footerNav = {
  congregation: [
    { label: "About Us", href: "/about" },
    { label: "Ministries", href: "/ministries" },
    { label: "Medical Ministry", href: "/medical-ministry" },
    { label: "Gallery", href: "/gallery" },
  ],
  connect: [
    { label: "Events", href: "/events" },
    { label: "Sermons", href: "/sermons" },
    { label: "News & Updates", href: "/news" },
    { label: "Contact Us", href: "/contact" },
    { label: "Give / Donate", href: "/give" },
  ],
}
