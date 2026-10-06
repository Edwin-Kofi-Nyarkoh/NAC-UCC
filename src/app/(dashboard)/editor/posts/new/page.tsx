"use client"

import { PostForm } from "@/components/dashboard/content-forms"

const CATEGORIES = ["NEWS", "ANNOUNCEMENT", "TESTIMONY", "DEVOTIONAL", "GENERAL"]

export default function NewEditorPostPage() {
  return <PostForm backHref="/editor/posts" kind="posts" noun="Post" categories={CATEGORIES} />
}
