import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BottomNav } from "@/components/layout/bottom-nav"
import { getSiteSettings, serverFetch } from "@/lib/server-api"
import type { Ministry } from "@/types"

// Public pages read their content from the database on every request, so
// whatever staff publish in the dashboard shows up straight away.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, ministryData] = await Promise.all([
    getSiteSettings(),
    serverFetch<{ ministries: Ministry[] }>("/ministries"),
  ])
  const ministries = ministryData?.ministries ?? []

  return (
    <>
      <Navbar ministries={ministries.map(({ name, slug }) => ({ name, slug }))} />
      {/* Bottom padding leaves room for the mobile tab bar */}
      <main className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      <Footer settings={settings} />
      <BottomNav />
    </>
  )
}
