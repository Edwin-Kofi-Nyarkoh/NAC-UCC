"use client"

import { useState, useRef, useEffect } from "react"
import { Share2, Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  title: string
  text?: string | null
  url?: string
  className?: string
  variant?: "icon" | "full"
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.858L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function ShareButton({ title, text, url, className, variant = "full" }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const shareText = text ?? title

  // The page address is only known in the browser, so it is read when the user
  // clicks, and for the menu, which is never open on the first render.
  const pageUrl = () => url ?? window.location.href

  // Close the menu when clicking anywhere else
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  async function copyLink() {
    const link = pageUrl()
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      prompt("Copy this link:", link)
    }
    setCopied(true)
    setTimeout(() => { setCopied(false); setOpen(false) }, 2000)
  }

  async function handleClick() {
    // Phones have their own share sheet (WhatsApp, Facebook and so on)
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: pageUrl() })
      } catch {
        // The user closed the share sheet
      }
      return
    }
    // Desktop browsers get a small menu instead
    setOpen((v) => !v)
  }

  const destinations = open
    ? [
        {
          label: "WhatsApp",
          href: `https://wa.me/?text=${encodeURIComponent(`${title} ${pageUrl()}`)}`,
          icon: <WhatsAppIcon className="w-4 h-4 text-emerald-500" />,
        },
        {
          label: "Facebook",
          href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl())}`,
          icon: <FacebookIcon className="w-4 h-4 text-blue-600" />,
        },
        {
          label: "X (Twitter)",
          href: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl())}`,
          icon: <XIcon className="w-4 h-4" />,
        },
      ]
    : []

  const trigger =
    variant === "icon" ? (
      <button
        onClick={handleClick}
        title="Share"
        aria-label="Share"
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors",
          className
        )}
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
      </button>
    ) : (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors",
          className
        )}
      >
        {copied ? (
          <><Check className="w-4 h-4 text-emerald-500" /> Copied!</>
        ) : (
          <><Share2 className="w-4 h-4" /> Share</>
        )}
      </button>
    )

  return (
    <div className="relative" ref={menuRef}>
      {trigger}

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-52 bg-popover border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <p className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Share via</p>

          {destinations.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              {icon} {label}
            </a>
          ))}

          <div className="my-1 border-t border-border" />

          <button
            onClick={copyLink}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors w-full"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-emerald-500" /> Link copied!</>
            ) : (
              <><Copy className="w-4 h-4 text-muted-foreground" /> Copy link</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
