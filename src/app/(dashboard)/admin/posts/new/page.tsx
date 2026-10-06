"use client"

import { PostForm } from "@/components/dashboard/content-forms"

const CATEGORIES = ["NEWS", "ANNOUNCEMENT", "TESTIMONY", "DEVOTIONAL", "GENERAL"]

export default function NewPostPage() {
  return <PostForm backHref="/admin/posts" kind="posts" noun="Post" categories={CATEGORIES} />
}
