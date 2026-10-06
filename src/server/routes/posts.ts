import { PostCategory } from "@prisma/client"
import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { uniqueSlug } from "../lib/slug"
import { mediaItemSchema, requiredText, validate } from "../lib/validate"
import { authenticate, requireRole } from "../middleware/auth"

export const postsRouter = new Hono()

const postSchema = z.object({
  title: requiredText(3),
  content: requiredText(10),
  excerpt: z.string().optional(),
  imagePublicId: z.string().optional(),
  mediaItems: z.array(mediaItemSchema).max(3).optional(),
  published: z.boolean().optional(),
  category: z.enum(PostCategory).optional(),
})

// Public reads
postsRouter.get("/", async (c) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })
  return c.json({ posts })
})

// /all must come BEFORE /:slug — otherwise "all" is treated as a slug value
postsRouter.get(
  "/all",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  async (c) => {
    const posts = await prisma.post.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })
    return c.json({ posts })
  }
)

postsRouter.get("/:slug", async (c) => {
  const post = await prisma.post.findUnique({
    where: { slug: c.req.param("slug") },
    include: { author: { select: { name: true } } },
  })
  if (!post || !post.published) return c.json({ error: "Not found" }, 404)
  return c.json({ post })
})

// Single record by id, drafts included — used by the dashboard edit pages
postsRouter.get(
  "/id/:id",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  async (c) => {
    const post = await prisma.post.findUnique({
      where: { id: c.req.param("id") },
      include: { author: { select: { name: true } } },
    })
    if (!post) return c.json({ error: "Not found" }, 404)
    return c.json({ post })
  }
)

// Authenticated writes
postsRouter.post(
  "/",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  validate(postSchema),
  async (c) => {
    const data = c.req.valid("json")
    const author = c.var.user

    const slug = await uniqueSlug(data.title, (s) =>
      prisma.post.findUnique({ where: { slug: s } }).then(Boolean)
    )

    const post = await prisma.post.create({
      data: { ...data, slug, authorId: author.sub },
      include: { author: { select: { name: true } } },
    })
    return c.json({ post }, 201)
  }
)

postsRouter.patch(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  validate(postSchema.partial()),
  async (c) => {
    const id = c.req.param("id")
    const data = c.req.valid("json")

    const post = await prisma.post.update({
      where: { id },
      data,
      include: { author: { select: { name: true } } },
    })
    return c.json({ post })
  }
)

postsRouter.delete(
  "/:id",
  authenticate,
  requireRole(["ADMIN", "CHURCH_EDITOR"]),
  async (c) => {
    await prisma.post.delete({ where: { id: c.req.param("id") } })
    return c.json({ success: true })
  }
)
