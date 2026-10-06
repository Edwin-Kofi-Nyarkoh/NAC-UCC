"use client"

import { EventsList } from "@/components/dashboard/content-lists"

export default function EditorEventsPage() {
  return <EventsList basePath="/editor/events" description="Manage upcoming church events." />
}
