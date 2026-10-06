"use client"

import Link from "next/link"
import { useState, type ComponentProps } from "react"

/**
 * A link that fetches its page only once the visitor shows they mean to open
 * it: pointing at it, touching it, or tabbing to it. An ordinary <Link> fetches
 * its page as soon as it is on screen.
 *
 * The menus use this. They list every page, on every page, so preloading them
 * all would spend visitors' data on pages most of them never open. Opening a
 * page is still quick: it is served from the cache, and the fetch starts the
 * moment a finger or the pointer lands on the link.
 */
export function IntentLink(props: Omit<ComponentProps<typeof Link>, "prefetch">) {
  const [intent, setIntent] = useState(false)
  const showIntent = () => setIntent(true)

  return (
    <Link
      {...props}
      prefetch={intent ? null : false}
      onMouseEnter={showIntent}
      onTouchStart={showIntent}
      onFocus={showIntent}
    />
  )
}
