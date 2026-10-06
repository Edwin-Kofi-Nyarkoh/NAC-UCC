"use client"

import { EventsList } from "@/components/dashboard/content-lists"

export default function AdminEventsPage() {
  return <EventsList basePath="/admin/events" description="Manage upcoming church events and programmes." />
}
