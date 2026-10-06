import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { uniqueSlug } from "../lib/slug"
import { requiredText, validate } from "../lib/validate"
import { authenticate, requireRole } from "../middleware/auth"

export const sermonsRouter = new Hono()

const sermonSchema = z.object({
  title: requiredText(3),
  preacher: z.string(),
  date: z.string().datetime(),
  scripture: z.string(),
  description: z.string(),
  audioPublicId: z.string().optional(),
  videoPublicId: z.string().optional(),
  imagePublicId: z.string().optional(),
  duration: z.string().optional(),
  published: z.boolean().optional(),
})

// Public reads
sermonsRouter.get("/", async (c) => {
  const sermons = await prisma.sermon.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  })
  return c.json({ sermons })
})

// /all must come BEFORE /:slug
sermonsRouter.get(
  "/all",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  async (c) => {
    const sermons = await prisma.sermon.findMany({ orderBy: { date: "desc" } })
    return c.json({ sermons })
  }
)

sermonsRouter.get("/:slug", async (c) => {
  const sermon = await prisma.sermon.findUnique({ where: { slug: c.req.param("slug") } })
  if (!sermon || !sermon.published) return c.json({ error: "Not found" }, 404)
  return c.json({ sermon })
})

// Single record by id, drafts included — used by the dashboard edit pages
sermonsRouter.get(
  "/id/:id",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  async (c) => {
    const sermon = await prisma.sermon.findUnique({
      where: { id: c.req.param("id") },
    })
    if (!sermon) return c.json({ error: "Not found" }, 404)
    return c.json({ sermon })
  }
)

// Authenticated writes
sermonsRouter.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  validate(sermonSchema),
  async (c) => {
    const data = c.req.valid("json")
    const slug = await uniqueSlug(data.title, (s) =>
      prisma.sermon.findUnique({ where: { slug: s } }).then(Boolean)
    )
    const sermon = await prisma.sermon.create({
      data: { ...data, slug, date: new Date(data.date), authorId: c.var.user.sub },
    })
    return c.json({ sermon }, 201)
  }
)

sermonsRouter.patch(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  validate(sermonSchema.partial()),
  async (c) => {
    const data = c.req.valid("json")
    const sermon = await prisma.sermon.update({
      where: { id: c.req.param("id") },
      data: { ...data, date: data.date ? new Date(data.date) : undefined },
    })
    return c.json({ sermon })
  }
)

sermonsRouter.delete(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  async (c) => {
    await prisma.sermon.delete({ where: { id: c.req.param("id") } })
    return c.json({ success: true })
  }
)
