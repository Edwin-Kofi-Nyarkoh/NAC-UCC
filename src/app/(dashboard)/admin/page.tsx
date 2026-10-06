"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  Mail,
  Mic2,
  Stethoscope,
  Users,
  Vote,
} from "lucide-react"
import { api } from "@/lib/api"

const quickLinks = [
  { label: "Posts & News", href: "/admin/posts", icon: FileText, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  { label: "Events", href: "/admin/events", icon: Calendar, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
  { label: "Sermons", href: "/admin/sermons", icon: Mic2, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
  { label: "Medical Posts", href: "/admin/medical", icon: Stethoscope, color: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" },
  { label: "Contact Messages", href: "/admin/messages", icon: Mail, color: "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400" },
  { label: "Nominations", href: "/admin/nominations", icon: Vote, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" },
  { label: "User Management", href: "/admin/users", icon: Users, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage the website&apos;s content and the people who edit it.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {quickLinks.map(({ label, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-5 p-6 bg-card border border-border rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <p className="flex-1 min-w-0 font-semibold text-foreground group-hover:text-primary transition-colors">
              {label}
            </p>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      <SiteSetup />
    </div>
  )
}

/**
 * The parts of the public site that only appear once someone fills them in,
 * each with a tick when it has content and a link to where it is edited.
 */
function SiteSetup() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: api.settings.get })
  const slides = useQuery({ queryKey: ["collection", "Home Page Banner"], queryFn: api.heroSlides.list })
  const leaders = useQuery({ queryKey: ["collection", "Leaders"], queryFn: api.leaders.list })
  const ministries = useQuery({ queryKey: ["collection", "Ministries"], queryFn: api.ministries.list })
  const gallery = useQuery({ queryKey: ["collection", "Gallery"], queryFn: api.gallery.list })

  if (!settings.data) return null
  const { serviceTimes, contact, about, bank, hero } = settings.data

  const steps = [
    { label: "Service times", where: "Home page and footer", href: "/admin/settings", done: serviceTimes.length > 0 },
    { label: "Contact details", where: "Contact page and footer", href: "/admin/settings", done: Boolean(contact.address || contact.phone || contact.email) },
    { label: "History, vision and mission", where: "About page", href: "/admin/settings", done: Boolean(about.history || about.vision || about.mission) },
    { label: "Bank details", where: "Give page", href: "/admin/settings", done: bank !== null },
    { label: "Home page banner", where: "Top of the home page", href: "/admin/hero-slides", done: (slides.data?.length ?? 0) > 0 || Boolean(hero.fallbackImage) },
    { label: "Leaders", where: "About page", href: "/admin/leaders", done: (leaders.data?.length ?? 0) > 0 },
    { label: "Ministries", where: "Ministries page and menu", href: "/admin/ministries", done: (ministries.data?.length ?? 0) > 0 },
    { label: "Gallery photos", where: "Gallery page", href: "/admin/gallery", done: (gallery.data?.length ?? 0) > 0 },
  ]

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <h2 className="font-bold text-foreground">Site content</h2>
      <p className="text-muted-foreground text-sm mt-1 mb-5">
        These parts of the website stay hidden until they have content.
      </p>
      <ul className="grid sm:grid-cols-2 gap-2">
        {steps.map(({ label, where, href, done }) => (
          <li key={label}>
            <Link
              href={href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              )}
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{label}</span>
                <span className="block text-xs text-muted-foreground">
                  {where} · {done ? "added" : "not added yet"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
