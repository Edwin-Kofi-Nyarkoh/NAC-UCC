import { Hono } from "hono"
import {
  emptySettings,
  isSettingsSection,
  settingsSchemas,
  type SettingsSection,
  type SiteSettings,
} from "@/lib/site-settings"
import { prisma } from "../lib/prisma"
import { issueMessage } from "../lib/validate"
import { authenticate, requireRole } from "../middleware/auth"

export const settingsRouter = new Hono()

/** Reads every saved section, falling back to "empty" for anything missing or malformed. */
async function loadSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany()
  const settings: Record<string, unknown> = { ...emptySettings }

  for (const row of rows) {
    if (!isSettingsSection(row.key)) continue
    try {
      const parsed = settingsSchemas[row.key].safeParse(JSON.parse(row.value))
      if (!parsed.success) continue
      // Bank details saved blank mean "no bank details"
      if (row.key === "bank" && !(parsed.data as { accountNo: string }).accountNo) continue
      settings[row.key] = parsed.data
    } catch {
      // Unreadable JSON: keep the empty default for this section
    }
  }

  return settings as unknown as SiteSettings
}

// GET /settings — everything the public pages need, in one call
settingsRouter.get("/", async (c) => {
  return c.json({ settings: await loadSettings() })
})

// PUT /settings/:section — replace one section (bank, contact, social, serviceTimes, about)
settingsRouter.put("/:section", authenticate, requireRole("ADMIN"), async (c) => {
  const section = c.req.param("section")
  if (!isSettingsSection(section)) return c.json({ error: "Unknown settings section" }, 404)

  const body = await c.req.json().catch(() => null)
  const parsed = settingsSchemas[section as SettingsSection].safeParse(body)
  if (!parsed.success) return c.json({ error: issueMessage(parsed.error) }, 400)

  const value = JSON.stringify(parsed.data)
  await prisma.siteSetting.upsert({
    where: { key: section },
    update: { value },
    create: { key: section, value },
  })

  return c.json({ settings: await loadSettings() })
})
