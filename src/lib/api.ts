import { clearSession, getToken } from "@/lib/session"
import type { SettingsSection, SiteSettings } from "@/lib/site-settings"
import type {
  AuthUser,
  ContactMessage,
  Event,
  GalleryItem,
  HeroSlide,
  Leader,
  MedicalPost,
  Ministry,
  ModeratedComment,
  NominationPosition,
  NominationReceipt,
  NominationResult,
  NominationSubmission,
  Post,
  Role,
  SearchResults,
  Sermon,
  SermonComment,
  StaffUser,
} from "@/types"

// The browser's way of talking to the API. The API is part of this app
// (src/server) and lives on the same origin, under /api.
//
// Every call returns the record(s) asked for, or throws an Error whose message
// is safe to show to the user.

const BASE_URL = "/api"

type Method = "POST" | "PUT" | "PATCH" | "DELETE"

async function request<T>(path: string, method: "GET" | Method = "GET", body?: unknown): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    // The request never reached the server. Nothing was saved or changed.
    throw new Error(
      navigator.onLine
        ? "Could not reach the site. Check your internet connection and try again."
        : "You're offline. Check your internet connection and try again."
    )
  }
  const data = await res.json().catch(() => ({}))

  // The session expired or the account was suspended: sign out and send them
  // back to the login page.
  if (res.status === 401 && token) {
    clearSession()
    if (!window.location.pathname.startsWith("/login")) {
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`)
    }
  }

  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Request failed")
  return data as T
}

/** The API wraps results as `{ post: … }` or `{ posts: […] }`; this takes the value out. */
async function unwrap<T>(key: string, path: string, method: "GET" | Method = "GET", body?: unknown) {
  const data = await request<Record<string, T>>(path, method, body)
  return data[key]
}

/** Posts, medical posts, events and sermons: written by staff, with drafts. */
function contentApi<T>(path: string, one: string, many: string) {
  return {
    /** Every item, drafts included */
    all: () => unwrap<T[]>(many, `${path}/all`),
    byId: (id: string) => unwrap<T>(one, `${path}/id/${id}`),
    create: (input: Partial<T>) => unwrap<T>(one, path, "POST", input),
    update: (id: string, input: Partial<T>) => unwrap<T>(one, `${path}/${id}`, "PATCH", input),
    remove: (id: string) => request<unknown>(`${path}/${id}`, "DELETE"),
  }
}

/** Hero slides, leaders, ministries and gallery items: lists the admin curates. */
function collectionApi<T>(path: string, one: string, many: string) {
  return {
    list: () => unwrap<T[]>(many, path),
    create: (input: Partial<T>) => unwrap<T>(one, path, "POST", input),
    update: (id: string, input: Partial<T>) => unwrap<T>(one, `${path}/${id}`, "PATCH", input),
    remove: (id: string) => request<unknown>(`${path}/${id}`, "DELETE"),
  }
}

/** Saves a new order for a collection: every id, first to last. */
const reorder = (path: string) => (ids: string[]) => request<unknown>(`${path}/reorder`, "POST", { ids })

export interface NewStaffUser {
  email: string
  password: string
  name: string
  role: Role
}

/** What the browser needs to upload one file straight to Cloudinary. */
export interface UploadSignature {
  cloudName: string
  apiKey: string
  folder: string
  timestamp: number
  signature: string
}

export interface MediaInfo {
  publicId: string
  type: "image" | "video"
  width: number
  height: number
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: AuthUser }>("/auth/login", "POST", { email, password }),
    me: () => unwrap<AuthUser>("user", "/auth/me"),
  },

  posts: contentApi<Post>("/posts", "post", "posts"),
  medical: contentApi<MedicalPost>("/medical", "post", "posts"),
  events: contentApi<Event>("/events", "event", "events"),
  sermons: contentApi<Sermon>("/sermons", "sermon", "sermons"),

  heroSlides: { ...collectionApi<HeroSlide>("/hero-slides", "slide", "slides"), reorder: reorder("/hero-slides") },
  leaders: { ...collectionApi<Leader>("/leaders", "leader", "leaders"), reorder: reorder("/leaders") },
  ministries: { ...collectionApi<Ministry>("/ministries", "ministry", "ministries"), reorder: reorder("/ministries") },
  gallery: collectionApi<GalleryItem>("/gallery", "item", "items"),

  settings: {
    get: () => unwrap<SiteSettings>("settings", "/settings"),
    save: <S extends SettingsSection>(section: S, value: NonNullable<SiteSettings[S]>) =>
      unwrap<SiteSettings>("settings", `/settings/${section}`, "PUT", value),
  },

  users: {
    list: () => unwrap<StaffUser[]>("users", "/admin/users"),
    create: (input: NewStaffUser) => unwrap<StaffUser>("user", "/admin/users", "POST", input),
    update: (id: string, input: Partial<Pick<StaffUser, "name" | "role" | "verified" | "active">>) =>
      unwrap<StaffUser>("user", `/admin/users/${id}`, "PATCH", input),
    remove: (id: string) => request<unknown>(`/admin/users/${id}`, "DELETE"),
    resetPassword: (id: string, password: string) =>
      request<unknown>(`/admin/users/${id}/reset-password`, "PATCH", { password }),
  },

  comments: {
    forSermon: (sermonId: string) => unwrap<SermonComment[]>("comments", `/sermons/${sermonId}/comments`),
    add: (sermonId: string, input: { authorName: string; authorEmail?: string; content: string }) =>
      request<unknown>(`/sermons/${sermonId}/comments`, "POST", input),
    /** Every comment on every sermon (admin) */
    all: () => unwrap<ModeratedComment[]>("comments", "/comments"),
    remove: (id: string) => request<unknown>(`/comments/${id}`, "DELETE"),
  },

  messages: {
    /** The public contact form */
    send: (input: Pick<ContactMessage, "name" | "email" | "subject" | "message">) =>
      request<unknown>("/contact", "POST", input),
    list: () => unwrap<ContactMessage[]>("messages", "/contact"),
    markRead: (id: string) => unwrap<ContactMessage>("message", `/contact/${id}/read`, "PATCH"),
    remove: (id: string) => request<unknown>(`/contact/${id}`, "DELETE"),
  },

  nominations: {
    /** A member's nominations, one per position */
    submit: (input: NominationSubmission) => request<NominationReceipt>("/nominations/submit", "POST", input),
    /** Every position, open or closed, with how many nominations each has (admin) */
    positions: () => unwrap<NominationPosition[]>("positions", "/nominations/positions/all"),
    results: () => unwrap<NominationResult[]>("results", "/nominations/results"),
    createPosition: (input: { title: string; description?: string; order?: number }) =>
      unwrap<NominationPosition>("position", "/nominations/positions", "POST", input),
    updatePosition: (
      id: string,
      input: Partial<{ title: string; description: string; active: boolean; order: number }>
    ) => unwrap<NominationPosition>("position", `/nominations/positions/${id}`, "PATCH", input),
    removePosition: (id: string) => request<unknown>(`/nominations/positions/${id}`, "DELETE"),
    removeNomination: (id: string) => request<unknown>(`/nominations/nominations/${id}`, "DELETE"),
  },

  uploads: {
    signature: () => request<UploadSignature>("/uploads/signature", "POST"),
    /** Looks up a Cloudinary ID that was pasted in rather than uploaded */
    info: (publicId: string, type: "image" | "video") =>
      request<MediaInfo>(`/uploads/info?publicId=${encodeURIComponent(publicId)}&type=${type}`),
  },

  give: {
    /** Starts a Paystack checkout and returns the page to send the giver to */
    start: (input: { email: string; amount: number; type: string; name?: string }) =>
      request<{ authorizationUrl: string; reference: string }>("/give/initialize", "POST", input),
    verify: (reference: string) =>
      request<{ paid: boolean; amount?: number; currency?: string }>(
        `/give/verify/${encodeURIComponent(reference)}`
      ),
  },

  search: (query: string) =>
    request<{ results: SearchResults; total: number }>(`/search?q=${encodeURIComponent(query)}`),
}
