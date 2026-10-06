"use client"

import { SermonsList } from "@/components/dashboard/content-lists"

export default function AdminSermonsPage() {
  return <SermonsList basePath="/admin/sermons" description="Manage sermon recordings and notes." />
}
