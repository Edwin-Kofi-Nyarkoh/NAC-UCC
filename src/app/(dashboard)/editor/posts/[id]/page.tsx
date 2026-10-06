"use client"

import { useParams } from "next/navigation"
import { PostForm } from "@/components/dashboard/content-forms"

const CATEGORIES = ["NEWS", "ANNOUNCEMENT", "TESTIMONY", "DEVOTIONAL", "GENERAL"]

export default function EditEditorPostPage() {
  const { id } = useParams<{ id: string }>()
  return <PostForm id={id} backHref="/editor/posts" kind="posts" noun="Post" categories={CATEGORIES} />
}
