"use client"

import { MedicalPostsList } from "@/components/dashboard/content-lists"

export default function AdminMedicalPage() {
  return <MedicalPostsList basePath="/admin/medical" description="Manage health tips, medical updates, and screening announcements." />
}
