import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BottomNav } from "@/components/layout/bottom-nav"
import { getSiteSettings, serverFetch } from "@/lib/server-api"
import type { Ministry } from "@/types"

// The frame around every public page. Its content, like the pages', comes from
// the cache described in src/server/lib/public-cache.ts: whatever staff save in
// the dashboard shows up on the next visit.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, ministryData] = await Promise.all([
    getSiteSettings(),
    serverFetch<{ ministries: Ministry[] }>("/ministries"),
  ])
  const ministries = ministryData?.ministries ?? []

  return (
    <>
      <Navbar ministries={ministries.map(({ name, slug }) => ({ name, slug }))} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <BottomNav />
    </>
  )
}
