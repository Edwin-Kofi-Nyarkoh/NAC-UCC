import { cn } from "@/lib/utils"

interface SectionLabelProps {
  children: React.ReactNode
  /** Centre it and add a matching gold rule on the right */
  centered?: boolean
  className?: string
}

/** The small gold, upper-case label that sits above a section heading. */
export function SectionLabel({ children, centered = false, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-5", centered && "justify-center", className)}>
      <div className="w-8 h-px bg-gold" />
      <span className="text-gold text-sm font-semibold tracking-widest uppercase">{children}</span>
      {centered && <div className="w-8 h-px bg-gold" />}
    </div>
  )
}
