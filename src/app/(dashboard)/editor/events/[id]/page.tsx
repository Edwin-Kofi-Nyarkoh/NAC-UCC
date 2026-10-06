"use client"

import { useParams } from "next/navigation"
import { EventForm } from "@/components/dashboard/content-forms"

export default function EditEditorEventPage() {
  const { id } = useParams<{ id: string }>()
  return <EventForm id={id} backHref="/editor/events" />
}
