import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Joins class names, letting later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "3 October 2026" */
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-GH", { dateStyle: "long" }).format(new Date(date))
}

export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + "…"
}

/** "Kwame Mensah" → "KM", for avatars without a photo. */
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/**
 * Whether an event date is today or later. Event dates are stored as midnight
 * UTC of the chosen day, so an event counts as upcoming for the whole of its day.
 */
export function isUpcoming(date: string) {
  const now = new Date()
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return new Date(date).getTime() >= startOfToday
}

/** "HEALTH_TIP" → "health tip", for showing a stored category to visitors. */
export function categoryLabel(category: string) {
  return category.toLowerCase().replace(/_/g, " ")
}
