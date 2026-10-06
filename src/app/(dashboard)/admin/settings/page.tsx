"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { BookOpen, Building2, Check, Clock, MapPin, Plus, Share2, Trash2 } from "lucide-react"
import {
  ErrorBanner,
  LoadingState,
  PrimaryButton,
  TextAreaField,
  TextField,
  inputClass,
} from "@/components/dashboard/form-fields"
import { api } from "@/lib/api"
import type { SettingsSection, SiteSettings } from "@/lib/site-settings"

// Everything here is shown on the public site. Each card saves on its own, and
// anything left blank is simply left off the site.

export default function AdminSettingsPage() {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: api.settings.get,
    // Always edit what is in the database, never a cached copy
    staleTime: 0,
    gcTime: 0,
  })

  if (!settings) {
    return isLoading ? <LoadingState label="Loading settings…" /> : <ErrorBanner message={error?.message} />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Details shown across the website. Anything left blank is left off the site.
        </p>
      </div>

      <ServiceTimesCard initial={settings.serviceTimes} />
      <ContactCard initial={settings.contact} />
      <SocialCard initial={settings.social} />
      <AboutCard initial={settings.about} />
      <BankCard initial={settings.bank} />
    </div>
  )
}

interface SettingsCardProps<S extends SettingsSection> {
  section: S
  icon: React.ElementType
  title: string
  description: string
  /** The form's current value, saved as it is */
  value: NonNullable<SiteSettings[S]>
  /** Set when the form cannot be saved yet, e.g. a number that is not a number */
  problem?: string
  children: React.ReactNode
}

/** A titled card with its own Save button, for one section of the settings. */
function SettingsCard<S extends SettingsSection>(props: SettingsCardProps<S>) {
  const { section, icon: Icon, title, description, value, problem, children } = props
  const current = JSON.stringify(value)
  const [saved, setSaved] = useState(current)

  const save = useMutation({
    mutationFn: () => api.settings.save(section, value),
    onSuccess: () => setSaved(current),
  })

  const changed = current !== saved

  return (
    <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">{title}</h2>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>

      {children}

      <ErrorBanner message={problem ?? save.error?.message} />

      <div className="flex items-center gap-3">
        <PrimaryButton onClick={() => save.mutate()} busy={save.isPending} disabled={!changed || Boolean(problem)}>
          Save {title.toLowerCase()}
        </PrimaryButton>
        {save.isSuccess && !changed && (
          <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </section>
  )
}

interface RowsProps<Row extends Record<string, string>> {
  rows: Row[]
  onChange: (rows: Row[]) => void
  columns: { name: keyof Row & string; label: string; placeholder?: string }[]
  /** Tailwind grid classes laying out one row's inputs */
  gridClass: string
  /** A new, empty row */
  blank: Row
  addLabel: string
}

/** A list of small rows (service times, timeline entries) that can be added to and removed from. */
function Rows<Row extends Record<string, string>>(props: RowsProps<Row>) {
  const { rows, onChange, columns, gridClass, blank, addLabel } = props

  function setCell(index: number, name: keyof Row, value: string) {
    onChange(rows.map((row, i) => (i === index ? { ...row, [name]: value } : row)))
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className={`grid flex-1 gap-2 ${gridClass}`}>
            {columns.map((column) => (
              <input
                key={column.name}
                type="text"
                value={row[column.name]}
                onChange={(e) => setCell(index, column.name, e.target.value)}
                placeholder={column.placeholder ?? column.label}
                aria-label={`${column.label}, row ${index + 1}`}
                className={inputClass}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
            aria-label={`Remove row ${index + 1}`}
            className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, blank])}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  )
}

function ServiceTimesCard({ initial }: { initial: SiteSettings["serviceTimes"] }) {
  const [services, setServices] = useState(initial)

  return (
    <SettingsCard
      section="serviceTimes"
      icon={Clock}
      title="Service Times"
      description="Shown on the home page and in the footer of every page."
      value={services}
    >
      <Rows
        rows={services}
        onChange={setServices}
        gridClass="grid-cols-2 sm:grid-cols-4"
        blank={{ name: "", day: "", time: "", note: "" }}
        addLabel="Add a service"
        columns={[
          { name: "name", label: "Service", placeholder: "e.g. Divine Service" },
          { name: "day", label: "Day", placeholder: "e.g. Sunday" },
          { name: "time", label: "Time", placeholder: "e.g. 9:00 AM" },
          { name: "note", label: "Note", placeholder: "Note (optional)" },
        ]}
      />
    </SettingsCard>
  )
}

/** "" → no coordinate; "5.1165" → 5.1165; anything else → not a number. */
function toCoordinate(text: string): number | null {
  return text.trim() === "" ? null : Number(text)
}

function ContactCard({ initial }: { initial: SiteSettings["contact"] }) {
  const [contact, setContact] = useState(initial)
  const [latitude, setLatitude] = useState(initial.mapLatitude?.toString() ?? "")
  const [longitude, setLongitude] = useState(initial.mapLongitude?.toString() ?? "")

  const mapLatitude = toCoordinate(latitude)
  const mapLongitude = toCoordinate(longitude)
  const badCoordinates = Number.isNaN(mapLatitude) || Number.isNaN(mapLongitude)

  const set = (field: "address" | "phone" | "email" | "officeHours") => (value: string) =>
    setContact((current) => ({ ...current, [field]: value }))

  return (
    <SettingsCard
      section="contact"
      icon={MapPin}
      title="Contact Details"
      description="Shown on the Contact page and in the footer."
      value={{ ...contact, mapLatitude, mapLongitude }}
      problem={badCoordinates ? "Latitude and longitude must be numbers, e.g. 5.1165 and -1.2822." : undefined}
    >
      <TextAreaField label="Address" value={contact.address} onChange={set("address")} hint="One line per row." />
      <TextField label="Phone" value={contact.phone} onChange={set("phone")} placeholder="+233 …" />
      <TextField label="Email" type="email" value={contact.email} onChange={set("email")} />
      <TextAreaField
        label="Office hours"
        value={contact.officeHours}
        onChange={set("officeHours")}
        hint="One line per row, e.g. Mon – Fri: 9:00 AM – 5:00 PM"
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Map latitude" value={latitude} onChange={setLatitude} placeholder="e.g. 5.1165" mono />
        <TextField label="Map longitude" value={longitude} onChange={setLongitude} placeholder="e.g. -1.2822" mono />
      </div>
      <p className="text-muted-foreground text-xs -mt-2">
        Fill in both to show a map on the Contact page. In Google Maps, right-click your location to copy them.
      </p>
    </SettingsCard>
  )
}

function SocialCard({ initial }: { initial: SiteSettings["social"] }) {
  const [social, setSocial] = useState(initial)

  const networks = [
    { key: "facebook", label: "Facebook" },
    { key: "youtube", label: "YouTube" },
    { key: "instagram", label: "Instagram" },
    { key: "twitter", label: "Twitter / X" },
  ] as const

  return (
    <SettingsCard
      section="social"
      icon={Share2}
      title="Social Media"
      description="Links to the congregation's pages. An icon is shown for each one filled in."
      value={social}
    >
      {networks.map(({ key, label }) => (
        <TextField
          key={key}
          label={label}
          type="url"
          value={social[key]}
          onChange={(value) => setSocial((current) => ({ ...current, [key]: value }))}
          placeholder="https://…"
        />
      ))}
    </SettingsCard>
  )
}

function AboutCard({ initial }: { initial: SiteSettings["about"] }) {
  const [about, setAbout] = useState(initial)

  const set = (field: "history" | "vision" | "mission") => (value: string) =>
    setAbout((current) => ({ ...current, [field]: value }))

  return (
    <SettingsCard
      section="about"
      icon={BookOpen}
      title="About Page"
      description="The congregation's story. Each part appears on the About page once it is written."
      value={about}
    >
      <TextAreaField
        label="Our history"
        rows={6}
        value={about.history}
        onChange={set("history")}
        hint="Leave a blank line between paragraphs."
      />
      <TextAreaField label="Our vision" value={about.vision} onChange={set("vision")} />
      <TextAreaField label="Our mission" value={about.mission} onChange={set("mission")} />
      <div>
        <span className="block text-sm font-semibold text-foreground mb-1.5">Timeline</span>
        <Rows
          rows={about.timeline}
          onChange={(timeline) => setAbout((current) => ({ ...current, timeline }))}
          gridClass="grid-cols-[5.5rem_1fr]"
          blank={{ year: "", event: "" }}
          addLabel="Add a milestone"
          columns={[
            { name: "year", label: "Year", placeholder: "Year" },
            { name: "event", label: "What happened", placeholder: "What happened" },
          ]}
        />
      </div>
    </SettingsCard>
  )
}

function BankCard({ initial }: { initial: SiteSettings["bank"] }) {
  const [bank, setBank] = useState(initial ?? { bankName: "", accountName: "", accountNo: "", branch: "" })

  const set = (field: keyof typeof bank) => (value: string) =>
    setBank((current) => ({ ...current, [field]: value }))

  return (
    <SettingsCard
      section="bank"
      icon={Building2}
      title="Bank Details"
      description="Shown on the Give page for people who prefer a bank transfer."
      value={bank}
    >
      <TextField label="Bank name" value={bank.bankName} onChange={set("bankName")} />
      <TextField label="Account name" value={bank.accountName} onChange={set("accountName")} />
      <TextField label="Account number" value={bank.accountNo} onChange={set("accountNo")} mono />
      <TextField label="Branch" value={bank.branch} onChange={set("branch")} />
    </SettingsCard>
  )
}
