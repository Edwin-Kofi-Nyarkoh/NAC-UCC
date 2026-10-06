// Shapes of the records the API returns. Dates arrive as ISO strings, and
// optional database columns arrive as null.

export type { SiteSettings, BankDetails, ContactDetails, SocialLinks, ServiceTime, AboutContent } from "@/lib/site-settings"

// Staff accounts

export type Role = "ADMIN" | "CHURCH_EDITOR" | "MEDICAL_MINISTER"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

/** A staff account as the admin's user list sees it. */
export interface StaffUser extends AuthUser {
  verified: boolean
  active: boolean
  createdAt: string
}

// Content written by staff

/** A photo or video stored on Cloudinary. */
export interface MediaItem {
  type: "image" | "video"
  publicId: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  /** Featured image: the first image in `mediaItems` */
  imagePublicId?: string | null
  mediaItems?: MediaItem[] | null
  published: boolean
  category: string
  author: { name: string }
  authorId: string
  createdAt: string
  updatedAt: string
}

/** Medical posts have the same fields as posts; only the categories differ. */
export type MedicalPost = Post

export interface Event {
  id: string
  title: string
  slug: string
  date: string
  endDate?: string | null
  time: string
  location: string
  description: string
  imagePublicId?: string | null
  category: string
  published: boolean
  createdAt: string
}

export interface Sermon {
  id: string
  title: string
  slug: string
  preacher: string
  date: string
  scripture: string
  description: string
  duration?: string | null
  audioPublicId?: string | null
  videoPublicId?: string | null
  imagePublicId?: string | null
  published: boolean
  createdAt: string
}

export interface SermonComment {
  id: string
  content: string
  authorName: string
  createdAt: string
}

/** A comment as the moderation page sees it. */
export interface ModeratedComment extends SermonComment {
  authorEmail: string | null
  approved: boolean
  sermon: { title: string; slug: string }
}

// Site content managed by the admin

export interface HeroSlide {
  id: string
  type: "image" | "video"
  publicId: string
  title: string
  subtitle?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
  order: number
}

export interface Leader {
  id: string
  name: string
  title: string
  bio?: string | null
  imagePublicId?: string | null
  order: number
}

export interface Ministry {
  id: string
  name: string
  slug: string
  description: string
  leader?: string | null
  meetingDay?: string | null
  meetingTime?: string | null
  imagePublicId?: string | null
  order: number
}

export interface GalleryItem {
  id: string
  type: "image" | "video"
  publicId: string
  caption?: string | null
  category?: string | null
  width: number
  height: number
  createdAt: string
}

// Things visitors send in

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

export interface NominationPosition {
  id: string
  title: string
  description: string | null
  order: number
  active: boolean
  /** Present in the admin listing */
  _count?: { nominations: number }
}

export interface Nomination {
  id: string
  nomineeName: string
  nomineeInfo: string | null
  nominatorName: string
  nominatorId: string
  createdAt: string
}

/** One position's results: every nomination, plus a count per nominee. */
export interface NominationResult {
  id: string
  title: string
  description: string | null
  active: boolean
  totalNominations: number
  tally: { name: string; count: number }[]
  nominations: Nomination[]
}

export interface NominationSubmission {
  nominatorName: string
  nominatorId: string
  nominations: { positionId: string; nomineeName: string; nomineeInfo?: string }[]
}

export interface NominationReceipt {
  submitted: number
  skipped: number
  /** Positions this member had already nominated for */
  alreadyVoted: string[]
}

// Search

export interface SearchResults {
  posts: (Pick<Post, "id" | "title" | "slug" | "excerpt" | "category" | "createdAt"> & { _type: "post" })[]
  events: (Pick<Event, "id" | "title" | "slug" | "date" | "location" | "category"> & { _type: "event" })[]
  sermons: (Pick<Sermon, "id" | "title" | "slug" | "preacher" | "scripture" | "date"> & { _type: "sermon" })[]
  medical: (Pick<MedicalPost, "id" | "title" | "slug" | "excerpt" | "category" | "createdAt"> & { _type: "medical" })[]
}
