"use client"

import { PostsList } from "@/components/dashboard/content-lists"

export default function EditorPostsPage() {
  return <PostsList basePath="/editor/posts" description="Publish church news and announcements." />
}
