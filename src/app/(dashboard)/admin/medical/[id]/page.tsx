"use client"

import { useParams } from "next/navigation"
import { PostForm } from "@/components/dashboard/content-forms"

const CATEGORIES = ["HEALTH_TIP", "UPDATE", "NEWS", "SCREENING", "EMERGENCY", "GENERAL"]

export default function EditMedicalPostPage() {
  const { id } = useParams<{ id: string }>()
  return <PostForm id={id} backHref="/admin/medical" kind="medical" noun="Medical Post" categories={CATEGORIES} />
}
