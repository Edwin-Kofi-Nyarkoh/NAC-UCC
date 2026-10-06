import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { QueryProvider } from "@/components/query-provider"

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </QueryProvider>
  )
}
