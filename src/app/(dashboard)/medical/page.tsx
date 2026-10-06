"use client"

import Link from "next/link"
import { Stethoscope, ArrowRight, Heart } from "lucide-react"
import { useSession } from "@/lib/session"

export default function MedicalDashboard() {
  const user = useSession()
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Medical Ministry Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Hello {user?.name} — manage health content for the congregation.
        </p>
      </div>

      <Link
        href="/medical/posts"
        className="group flex items-center gap-5 p-7 bg-card border border-border rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all max-w-md mb-8"
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
          <Stethoscope className="w-7 h-7 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground group-hover:text-primary transition-colors text-lg">Medical Posts</p>
          <p className="text-muted-foreground text-sm">Health tips, updates, screenings, emergencies</p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </Link>

      <div className="bg-muted/30 border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-5 h-5 text-rose-500" />
          <h2 className="font-bold text-foreground">Your Role</h2>
        </div>
        <ul className="text-muted-foreground text-sm space-y-1.5">
          <li>✓ Create, edit, publish, and delete medical posts</li>
          <li>✓ Categories: Health Tips, Updates, News, Screenings, Emergency</li>
          <li>✗ Cannot access church posts, events, sermons, or user accounts</li>
        </ul>
      </div>
    </div>
  )
}
