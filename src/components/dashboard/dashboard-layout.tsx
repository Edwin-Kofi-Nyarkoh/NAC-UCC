"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  Calendar,
  ChevronRight,
  FileText,
  ImageIcon,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Mic2,
  Settings,
  Stethoscope,
  UserRound,
  Users,
  UsersRound,
  Vote,
} from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { clearSession, dashboardHome, useSession } from "@/lib/session"
import { cn, initials } from "@/lib/utils"
import type { AuthUser, Role } from "@/types"

interface NavGroup {
  label: string
  items: { label: string; href: string; icon: React.ElementType }[]
}

// What each role sees in the sidebar. The route guard (src/proxy.ts) and the
// API enforce the same boundaries; this only decides what is offered.
const navByRole: Record<Role, NavGroup[]> = {
  ADMIN: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
      label: "Church Content",
      items: [
        { label: "Posts & News", href: "/admin/posts", icon: FileText },
        { label: "Events", href: "/admin/events", icon: Calendar },
        { label: "Sermons", href: "/admin/sermons", icon: Mic2 },
        { label: "Comments", href: "/admin/comments", icon: MessageCircle },
        { label: "Medical Posts", href: "/admin/medical", icon: Stethoscope },
      ],
    },
    {
      label: "Site Content",
      items: [
        { label: "Home Page Banner", href: "/admin/hero-slides", icon: ImageIcon },
        { label: "Leaders", href: "/admin/leaders", icon: UserRound },
        { label: "Ministries", href: "/admin/ministries", icon: UsersRound },
        { label: "Gallery", href: "/admin/gallery", icon: Images },
        { label: "Site Settings", href: "/admin/settings", icon: Settings },
      ],
    },
    {
      label: "People",
      items: [
        { label: "Contact Messages", href: "/admin/messages", icon: Mail },
        { label: "Nominations", href: "/admin/nominations", icon: Vote },
        { label: "User Management", href: "/admin/users", icon: Users },
      ],
    },
  ],
  CHURCH_EDITOR: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/editor", icon: LayoutDashboard }],
    },
    {
      label: "Church Content",
      items: [
        { label: "Posts & News", href: "/editor/posts", icon: FileText },
        { label: "Events", href: "/editor/events", icon: Calendar },
        { label: "Sermons", href: "/editor/sermons", icon: Mic2 },
      ],
    },
  ],
  MEDICAL_MINISTER: [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/medical", icon: LayoutDashboard }],
    },
    {
      label: "Medical Content",
      items: [{ label: "Medical Posts", href: "/medical/posts", icon: Stethoscope }],
    },
  ],
}

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrator",
  CHURCH_EDITOR: "Church Editor",
  MEDICAL_MINISTER: "Medical Minister",
}

interface SidebarProps {
  user: AuthUser
  pathname: string
  /** Called after choosing a link, so the mobile drawer can close */
  onNavigate: () => void
  onSignOut: () => void
}

function Sidebar({ user, pathname, onNavigate, onSignOut }: SidebarProps) {
  const home = dashboardHome(user.role)

  return (
    <aside className="flex flex-col h-full bg-navy-950 text-white w-64 shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Logo size={36} />
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight">NAC UCC</p>
          <p className="text-silver-500 text-xs">{roleLabels[user.role]}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navByRole[user.role].map((group) => (
          <div key={group.label} className="mb-6">
            <p className="text-silver-600 text-xs font-semibold uppercase tracking-widest px-3 mb-2">
              {group.label}
            </p>
            {group.items.map(({ label, href, icon: Icon }) => {
              // The dashboard home only lights up on its own page, not on every page beneath it
              const active = href === home ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5",
                    active ? "bg-primary/20 text-white" : "text-silver-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", active && "text-primary")} />
                  {label}
                  {active && <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
            <p className="text-silver-500 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-silver-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}

/** The frame around every dashboard page: sidebar, top bar and the page itself. */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Nothing to show until the session has been read in the browser. Visitors
  // without one never get this far: the route guard sends them to /login.
  if (!user) return null

  function signOut() {
    clearSession()
    router.push("/login")
  }

  const sidebar = (
    <Sidebar user={user} pathname={pathname} onNavigate={() => setDrawerOpen(false)} onSignOut={signOut} />
  )

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="hidden lg:flex">{sidebar}</div>

      {/* On small screens the sidebar is a drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative z-50">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-background border-b border-border shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="hidden lg:block text-muted-foreground text-sm">
            Welcome back, <span className="font-semibold text-foreground">{user.name}</span>
          </p>
          <Link
            href="/"
            target="_blank"
            className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View site ↗
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
