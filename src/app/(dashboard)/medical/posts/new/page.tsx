"use client"

import { PostForm } from "@/components/dashboard/content-forms"

const CATEGORIES = ["EMERGENCY", "GENERAL"]

export default function NewMinisterMedicalPostPage() {
  return <PostForm backHref="/medical/posts" kind="medical" noun="Medical Post" categories={CATEGORIES} />
}
