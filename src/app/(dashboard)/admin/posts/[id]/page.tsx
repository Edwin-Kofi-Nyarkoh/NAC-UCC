"use client"

import { useParams } from "next/navigation"
import { PostForm } from "@/components/dashboard/content-forms"

const CATEGORIES = ["NEWS", "ANNOUNCEMENT", "TESTIMONY", "DEVOTIONAL", "GENERAL"]

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  return <PostForm id={id} backHref="/admin/posts" kind="posts" noun="Post" categories={CATEGORIES} />
}
