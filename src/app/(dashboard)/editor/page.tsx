"use client"

import Link from "next/link"
import { FileText, Calendar, Mic2, ArrowRight, PenLine } from "lucide-react"
import { useSession } from "@/lib/session"

const quickLinks = [
  { label: "Posts & News", href: "/editor/posts", icon: FileText, desc: "Publish announcements and church updates" },
  { label: "Events", href: "/editor/events", icon: Calendar, desc: "Add and manage upcoming events" },
  { label: "Sermons", href: "/editor/sermons", icon: Mic2, desc: "Upload sermon notes and media links" },
]

export default function EditorDashboard() {
  const user = useSession()
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Church Editor Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Hello {user?.name} — manage church content below.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {quickLinks.map(({ label, href, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-4 p-6 bg-card border border-border rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
              <p className="text-muted-foreground text-sm mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-auto" />
          </Link>
        ))}
      </div>

      <div className="bg-muted/30 border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <PenLine className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground">Your Role</h2>
        </div>
        <ul className="text-muted-foreground text-sm space-y-1.5">
          <li>✓ Create, edit, publish, and delete church posts &amp; news</li>
          <li>✓ Create, edit, and manage church events</li>
          <li>✓ Upload and manage sermon content</li>
          <li>✗ Cannot access medical content or user accounts</li>
        </ul>
      </div>
    </div>
  )
}
