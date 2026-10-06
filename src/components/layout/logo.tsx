import nacSmall from "@/assets/logos/nac-96.webp"
import nacLarge from "@/assets/logos/nac-192.webp"
import uccSmall from "@/assets/logos/ucc-96.webp"
import uccLarge from "@/assets/logos/ucc-192.webp"

interface LogoProps {
  /** Height of each emblem, in pixels */
  size?: number
  /** Spacing classes: the gap between the two emblems, and any margin around the pair */
  className?: string
  /** Sizing classes for the emblems, where the size has to change with the screen (e.g. "size-9 sm:size-10") */
  emblemClassName?: string
}

/**
 * The congregation's two emblems side by side: the New Apostolic Church's and
 * the University of Cape Coast's. The crest sits on a white badge so the pair
 * reads on any background, including over the banner's photo.
 *
 * They carry no alt text because every place that shows them also names the
 * congregation in words right beside them.
 */
export function Logo({ size = 40, className = "gap-1.5", emblemClassName = "" }: LogoProps) {
  // The small files stay sharp up to 40px, even on a phone's dense screen
  const [nac, ucc] = size > 40 ? [nacLarge, uccLarge] : [nacSmall, uccSmall]

  // Plain <img> and plain class strings: these are small files of a fixed size,
  // shown on every page, and should bring no script with them.
  return (
    <span className={`inline-flex shrink-0 items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={nac.src} alt="" width={size} height={size} decoding="async" className={`rounded-[22%] ${emblemClassName}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ucc.src}
        alt=""
        width={size}
        height={size}
        decoding="async"
        className={`rounded-[22%] ring-1 ring-black/10 ${emblemClassName}`}
      />
    </span>
  )
}
