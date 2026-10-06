"use client"

import { PostForm } from "@/components/dashboard/content-forms"

const CATEGORIES = ["HEALTH_TIP", "UPDATE", "NEWS", "SCREENING", "EMERGENCY", "GENERAL"]

export default function NewMedicalPostPage() {
  return <PostForm backHref="/admin/medical" kind="medical" noun="Medical Post" categories={CATEGORIES} />
}
