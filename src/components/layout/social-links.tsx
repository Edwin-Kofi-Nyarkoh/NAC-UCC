import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from "@/components/ui/social-icons"
import type { SocialLinks as SocialLinkSettings } from "@/lib/site-settings"

const NETWORKS = [
  { key: "facebook", label: "Facebook", icon: FacebookIcon },
  { key: "youtube", label: "YouTube", icon: YoutubeIcon },
  { key: "instagram", label: "Instagram", icon: InstagramIcon },
  { key: "twitter", label: "Twitter", icon: TwitterIcon },
] as const

interface SocialLinksProps {
  links: SocialLinkSettings
  className?: string
  linkClassName?: string
  /** Show the network's name next to its icon */
  showLabels?: boolean
}

/** Icons for the social networks set in Admin → Site Settings. Renders nothing if none are set. */
export function SocialLinks({ links, className, linkClassName, showLabels = false }: SocialLinksProps) {
  const networks = NETWORKS.filter(({ key }) => links[key])
  if (networks.length === 0) return null

  return (
    <div className={className}>
      {networks.map(({ key, label, icon: Icon }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={linkClassName}
        >
          <Icon className="w-4 h-4" />
          {showLabels && label}
        </a>
      ))}
    </div>
  )
}
