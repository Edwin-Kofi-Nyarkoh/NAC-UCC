"use client"

import { useParams } from "next/navigation"
import { PostForm } from "@/components/dashboard/content-forms"

const CATEGORIES = ["EMERGENCY", "GENERAL"]

export default function EditMinisterMedicalPostPage() {
  const { id } = useParams<{ id: string }>()
  return <PostForm id={id} backHref="/medical/posts" kind="medical" noun="Medical Post" categories={CATEGORIES} />
}
