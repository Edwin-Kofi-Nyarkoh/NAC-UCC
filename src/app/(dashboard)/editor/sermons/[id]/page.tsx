"use client"

import { useParams } from "next/navigation"
import { SermonForm } from "@/components/dashboard/content-forms"

export default function EditEditorSermonPage() {
  const { id } = useParams<{ id: string }>()
  return <SermonForm id={id} backHref="/editor/sermons" />
}
