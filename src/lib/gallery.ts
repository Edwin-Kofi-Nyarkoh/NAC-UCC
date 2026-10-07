// What a gallery photo or video can be filed under. The admin picks one from
// this list when adding to the gallery, and visitors filter the gallery by them.
// To offer another category, add it here.
export const GALLERY_CATEGORIES = [
  "Divine Service",
  "Events",
  "Outreach",
  "Youth",
  "Choir & Music",
  "Sunday School",
  "Medical Ministry",
  "Fellowship",
  "Other",
] as const

/** How many photos or videos the admin can add to the gallery in one go. */
export const GALLERY_ADD_AT_ONCE = 5
