import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { PwaRegister } from "@/components/pwa/pwa-register"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1E3A8A" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  )
}
