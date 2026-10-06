import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { uniqueSlug } from "../lib/slug"
import { requiredText, validate } from "../lib/validate"
import { authenticate, requireRole } from "../middleware/auth"

export const eventsRouter = new Hono()

const eventSchema = z.object({
  title: requiredText(3),
  date: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  time: z.string(),
  location: z.string(),
  description: z.string(),
  imagePublicId: z.string().optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
})

// Public reads
eventsRouter.get("/", async (c) => {
  // "upcoming" param: filter to events today or later (for landing page)
  const upcoming = c.req.query("upcoming") === "true"
  const events = await prisma.event.findMany({
    where: {
      published: true,
      ...(upcoming && { date: { gte: new Date() } }),
    },
    orderBy: { date: "asc" },
  })
  return c.json({ events })
})

// /all must come BEFORE /:slug
eventsRouter.get(
  "/all",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  async (c) => {
    const events = await prisma.event.findMany({ orderBy: { date: "asc" } })
    return c.json({ events })
  }
)

eventsRouter.get("/:slug", async (c) => {
  const event = await prisma.event.findUnique({ where: { slug: c.req.param("slug") } })
  if (!event || !event.published) return c.json({ error: "Not found" }, 404)
  return c.json({ event })
})

// Single record by id, drafts included — used by the dashboard edit pages
eventsRouter.get(
  "/id/:id",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  async (c) => {
    const event = await prisma.event.findUnique({
      where: { id: c.req.param("id") },
    })
    if (!event) return c.json({ error: "Not found" }, 404)
    return c.json({ event })
  }
)

// Authenticated writes
eventsRouter.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  validate(eventSchema),
  async (c) => {
    const data = c.req.valid("json")
    const slug = await uniqueSlug(data.title, (s) =>
      prisma.event.findUnique({ where: { slug: s } }).then(Boolean)
    )
    const event = await prisma.event.create({
      data: {
        ...data,
        slug,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        authorId: c.var.user.sub,
      },
    })
    return c.json({ event }, 201)
  }
)

eventsRouter.patch(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  validate(eventSchema.partial()),
  async (c) => {
    const data = c.req.valid("json")
    const event = await prisma.event.update({
      where: { id: c.req.param("id") },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })
    return c.json({ event })
  }
)

eventsRouter.delete(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  async (c) => {
    await prisma.event.delete({ where: { id: c.req.param("id") } })
    return c.json({ success: true })
  }
)
