import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { OfflineNotice } from "@/components/pwa/offline-notice"
import { PwaRegister } from "@/components/pwa/pwa-register"

// The one web font. Monospace text uses the device's own font (see globals.css).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "NAC UCC Campus Congregation",
    template: "%s | NAC UCC",
  },
  description:
    "New Apostolic Church — University of Cape Coast Campus Congregation. A community of believers growing together in faith, worship, and service.",
  keywords: ["NAC", "New Apostolic Church", "UCC", "Cape Coast", "Campus", "Congregation", "Church"],
  openGraph: {
    type: "website",
    locale: "en_GH",
    siteName: "NAC UCC Campus Congregation",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NAC UCC",
  },
  formatDetection: { telephone: false },
  // The browser tab uses src/app/favicon.ico, which Next.js links by itself
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

// The shell shared by every page. The public site adds its navbar and footer
// in (site)/layout.tsx; the dashboard has its own layout.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={geistSans.variable}
      suppressHydrationWarning
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1E3A8A" />
        {/* Photos and videos come from Cloudinary: open that connection early */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Providers>
          <PwaRegister />
          <OfflineNotice />
          {children}
        </Providers>
      </body>
    </html>
  )
}
