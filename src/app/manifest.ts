import type { MetadataRoute } from "next"

// Lets phones install the site as an app ("Add to Home Screen").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NAC UCC Campus Congregation",
    short_name: "NAC UCC",
    description: "New Apostolic Church — University of Cape Coast Campus Congregation",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0F1E",
    theme_color: "#1E3A8A",
    orientation: "portrait-primary",
    // "maskable" icons keep the artwork inside the middle, because Android may
    // crop the icon to a circle; the others are used as they are.
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["religion", "lifestyle"],
    shortcuts: [
      { name: "Events", url: "/events" },
      { name: "Sermons", url: "/sermons" },
      { name: "Give", url: "/give" },
    ],
  }
}
