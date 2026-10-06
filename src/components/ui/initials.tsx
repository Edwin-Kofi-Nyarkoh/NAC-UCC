import { cn, initials } from "@/lib/utils"

/**
 * A person's initials in a circle, for where there is no photo of them.
 * A plain element, so public pages do not load the dashboard's Avatar component for it.
 */
export function Initials({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm text-primary select-none",
        // The same hairline edge the dashboard's avatars have
        "after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten",
        className
      )}
    >
      {initials(name)}
    </span>
  )
}
