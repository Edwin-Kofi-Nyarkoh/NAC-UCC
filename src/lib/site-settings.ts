import { z } from "zod"

// Site-wide details the church edits under Admin → Site Settings.
// Each section is saved as one JSON row in the `site_settings` table, keyed by
// its name here. The API validates with these schemas, and the public pages and
// admin forms take their types from them, so the three cannot drift apart.

const text = z.string().trim()
const optionalUrl = text.url("must be a full link, starting with https://").or(z.literal(""))
// A link visitors are sent to: web addresses only, never anything else a browser would follow
const optionalWebsite = text
  .regex(/^https?:\/\/\S+$/i, "must be a full link, starting with https://")
  .or(z.literal(""))

export const bankSchema = z
  .object({ bankName: text, accountName: text, accountNo: text, branch: text })
  .refine(
    (bank) => {
      const filled = Object.values(bank).filter(Boolean).length
      return filled === 0 || filled === 4
    },
    "Fill in all four bank details, or clear all four to take them off the site."
  )

export const contactSchema = z.object({
  address: text, // one line per row
  phone: text,
  email: text.email("must be a valid email address").or(z.literal("")),
  officeHours: text, // one line per row
  // Both set → the contact page shows a map centred on this point
  mapLatitude: z.number().min(-90).max(90).nullable(),
  mapLongitude: z.number().min(-180).max(180).nullable(),
})

export const socialSchema = z.object({
  facebook: optionalUrl,
  youtube: optionalUrl,
  instagram: optionalUrl,
  twitter: optionalUrl,
})

export const serviceTimesSchema = z
  .array(
    z.object({
      name: text.min(1, "is required"),
      day: text.min(1, "is required"),
      time: text.min(1, "is required"),
      note: text,
    })
  )
  .max(12)

export const aboutSchema = z.object({
  history: text,
  vision: text,
  mission: text,
  timeline: z
    .array(
      z.object({
        year: text.min(1, "is required"),
        event: text.min(1, "is required"),
      })
    )
    .max(30),
  // The wider church's website. Set → the About page ends with a button that
  // opens it, for visitors who want to read more. Both have a default, so About
  // content saved before these two existed still loads.
  churchWebsite: optionalWebsite.default(""),
  // What that button says; blank → the standard wording
  churchWebsiteButton: text.max(40, "must be 40 characters or fewer").default(""),
})

export const heroSchema = z.object({
  // Cloudinary ID of the picture shown while a slide is loading, or "" for none
  fallbackImage: text,
})

export const settingsSchemas = {
  hero: heroSchema,
  bank: bankSchema,
  contact: contactSchema,
  social: socialSchema,
  serviceTimes: serviceTimesSchema,
  about: aboutSchema,
}

export type SettingsSection = keyof typeof settingsSchemas

export type BankDetails = z.infer<typeof bankSchema>
export type ContactDetails = z.infer<typeof contactSchema>
export type SocialLinks = z.infer<typeof socialSchema>
export type ServiceTime = z.infer<typeof serviceTimesSchema>[number]
export type AboutContent = z.infer<typeof aboutSchema>
export type HeroSettings = z.infer<typeof heroSchema>

export interface SiteSettings {
  /** null until an admin enters the account details (and again if they clear them) */
  bank: BankDetails | null
  contact: ContactDetails
  social: SocialLinks
  serviceTimes: ServiceTime[]
  about: AboutContent
  hero: HeroSettings
}

/** What the site shows before anything has been entered: nothing. */
export const emptySettings: SiteSettings = {
  bank: null,
  contact: { address: "", phone: "", email: "", officeHours: "", mapLatitude: null, mapLongitude: null },
  social: { facebook: "", youtube: "", instagram: "", twitter: "" },
  serviceTimes: [],
  about: { history: "", vision: "", mission: "", timeline: [], churchWebsite: "", churchWebsiteButton: "" },
  hero: { fallbackImage: "" },
}

export function isSettingsSection(value: string): value is SettingsSection {
  return value in settingsSchemas
}

/** Splits a multi-line setting (address, office hours) into its non-empty lines. */
export function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}
