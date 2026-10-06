"use client"

import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useState, useEffect, useRef } from "react"
import { Menu, X, Sun, Moon, ChevronDown, Search } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { IntentLink } from "@/components/layout/intent-link"
import { cn } from "@/lib/utils"
import { mainNav, type NavItem } from "@/config/navigation"

interface NavbarProps {
  /** Ministries added in the dashboard; they fill the Ministries dropdown */
  ministries: { name: string; slug: string }[]
}

export function Navbar({ ministries }: NavbarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLElement>(null)

  const items: NavItem[] = mainNav.map((item) =>
    item.href === "/ministries" && ministries.length > 0
      ? {
          ...item,
          children: ministries.map((m) => ({ label: m.name, href: `/ministries/${m.slug}` })),
        }
      : item
  )

  // At the top of the home page the bar sits transparently over the hero
  const overHero = pathname === "/" && !scrolled

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close an open dropdown when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // The page behind the mobile menu should not scroll
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const linkClass = (active: boolean) =>
    cn(
      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
      overHero
        ? "text-white/90 hover:text-white hover:bg-white/10"
        : "text-muted-foreground hover:text-foreground hover:bg-muted",
      active && (overHero ? "text-white bg-white/10" : "text-foreground bg-muted")
    )

  const iconButtonClass = cn(
    "rounded-full flex items-center justify-center transition-colors",
    overHero
      ? "text-white/80 hover:text-white hover:bg-white/10"
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  )

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          overHero ? "bg-transparent" : "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <IntentLink href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <Logo emblemClassName="size-9 sm:size-10" />
              <div>
                <p className={cn("font-bold text-base leading-tight transition-colors", overHero ? "text-white" : "text-foreground")}>
                  NAC UCC
                </p>
                <p className={cn("text-xs leading-tight transition-colors hidden sm:block", overHero ? "text-white/70" : "text-muted-foreground")}>
                  Campus Congregation
                </p>
              </div>
            </IntentLink>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {items.map((item) =>
                item.children ? (
                  <div key={item.href} className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                      aria-expanded={openDropdown === item.label}
                      className={cn("flex items-center gap-1", linkClass(pathname.startsWith(item.href)))}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          openDropdown === item.label && "rotate-180"
                        )}
                      />
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                        {item.children.map((child) => (
                          <IntentLink
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            {child.label}
                          </IntentLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <IntentLink key={item.href} href={item.href} className={linkClass(pathname === item.href)}>
                    {item.label}
                  </IntentLink>
                )
              )}
            </nav>

            <div className="flex items-center gap-1">
              <IntentLink href="/search" className={cn("w-9 h-9", iconButtonClass)} aria-label="Search">
                <Search className="w-4 h-4" />
              </IntentLink>

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn("w-9 h-9", iconButtonClass)}
                aria-label="Toggle theme"
              >
                <Sun className="w-4 h-4 dark:hidden" />
                <Moon className="w-4 h-4 hidden dark:block" />
              </button>

              <IntentLink
                href="/give"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Give
              </IntentLink>

              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((open) => !open)}
                className={cn("lg:hidden w-10 h-10", iconButtonClass)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu: a drawer that drops down over the page */}
      {mobileOpen && (
        <div className="fixed inset-0 z-55 lg:hidden" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-background shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <IntentLink href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <Logo size={32} />
                <span className="font-bold text-foreground">NAC UCC</span>
              </IntentLink>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="px-4 py-4 space-y-1">
              {items.map((item) => (
                <div key={item.href}>
                  <IntentLink
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      pathname === item.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </IntentLink>
                  {item.children && (
                    <div className="ml-4 mt-1 mb-2 space-y-0.5 border-l-2 border-border pl-3">
                      {item.children.map((child) => (
                        <IntentLink
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"
                        >
                          {child.label}
                        </IntentLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="px-4 pb-6 pt-2 border-t border-border">
              <IntentLink
                href="/give"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Give / Donate
              </IntentLink>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
