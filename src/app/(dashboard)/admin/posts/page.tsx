"use client"

import { PostsList } from "@/components/dashboard/content-lists"

export default function AdminPostsPage() {
  return <PostsList basePath="/admin/posts" description="Manage church news and announcements." />
}
