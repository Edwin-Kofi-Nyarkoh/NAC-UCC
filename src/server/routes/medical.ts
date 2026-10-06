import { MedicalCategory } from "@prisma/client"
import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { uniqueSlug } from "../lib/slug"
import { mediaItemSchema, requiredText, validate } from "../lib/validate"
import { authenticate, requireRole } from "../middleware/auth"

export const medicalRouter = new Hono()

const medicalSchema = z.object({
  title: requiredText(3),
  content: requiredText(10),
  excerpt: z.string().optional(),
  imagePublicId: z.string().optional(),
  mediaItems: z.array(mediaItemSchema).max(3).optional(),
  published: z.boolean().optional(),
  category: z.enum(MedicalCategory).optional(),
})

// Public reads
medicalRouter.get("/", async (c) => {
  const posts = await prisma.medicalPost.findMany({
    where: { published: true },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })
  return c.json({ posts })
})

// /all must come BEFORE /:slug
medicalRouter.get(
  "/all",
  authenticate,
  requireRole(["ADMIN", "MEDICAL_MINISTER"]),
  async (c) => {
    const posts = await prisma.medicalPost.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })
    return c.json({ posts })
  }
)

medicalRouter.get("/:slug", async (c) => {
  const post = await prisma.medicalPost.findUnique({
    where: { slug: c.req.param("slug") },
    include: { author: { select: { name: true } } },
  })
  if (!post || !post.published) return c.json({ error: "Not found" }, 404)
  return c.json({ post })
})

// Single record by id, drafts included — used by the dashboard edit pages
medicalRouter.get(
  "/id/:id",
  authenticate,
  requireRole(["ADMIN", "MEDICAL_MINISTER"]),
  async (c) => {
    const post = await prisma.medicalPost.findUnique({
      where: { id: c.req.param("id") },
      include: { author: { select: { name: true } } },
    })
    if (!post) return c.json({ error: "Not found" }, 404)
    return c.json({ post })
  }
)

// Authenticated writes
medicalRouter.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "MEDICAL_MINISTER"]),
  validate(medicalSchema),
  async (c) => {
    const data = c.req.valid("json")
    const author = c.var.user

    const slug = await uniqueSlug(data.title, (s) =>
      prisma.medicalPost.findUnique({ where: { slug: s } }).then(Boolean)
    )

    const post = await prisma.medicalPost.create({
      data: { ...data, slug, authorId: author.sub },
      include: { author: { select: { name: true } } },
    })
    return c.json({ post }, 201)
  }
)

medicalRouter.patch(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "MEDICAL_MINISTER"]),
  validate(medicalSchema.partial()),
  async (c) => {
    const id = c.req.param("id")
    const data = c.req.valid("json")

    const post = await prisma.medicalPost.update({
      where: { id },
      data,
      include: { author: { select: { name: true } } },
    })
    return c.json({ post })
  }
)

medicalRouter.delete(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "MEDICAL_MINISTER"]),
  async (c) => {
    await prisma.medicalPost.delete({ where: { id: c.req.param("id") } })
    return c.json({ success: true })
  }
)
