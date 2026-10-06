import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { requiredText, validate } from "../lib/validate"
import { authenticate, requireRole } from "../middleware/auth"

export const commentsRouter = new Hono()

const commentSchema = z.object({
  content: requiredText(3).max(1000),
  authorName: requiredText(2).max(80),
  authorEmail: z.string().email().optional().or(z.literal("")),
})

// GET /sermons/:sermonId/comments — approved only, public
commentsRouter.get("/sermons/:sermonId/comments", async (c) => {
  const comments = await prisma.sermonComment.findMany({
    where: { sermonId: c.req.param("sermonId"), approved: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, content: true, authorName: true, createdAt: true },
  })
  return c.json({ comments })
})

// POST /sermons/:sermonId/comments — anyone can comment. Comments show straight
// away; an admin can remove them from the dashboard.
commentsRouter.post(
  "/sermons/:sermonId/comments",
  validate(commentSchema),
  async (c) => {
    const { sermonId } = c.req.param()
    const sermon = await prisma.sermon.findUnique({ where: { id: sermonId } })
    if (!sermon || !sermon.published) return c.json({ error: "Sermon not found" }, 404)

    const data = c.req.valid("json")
    const comment = await prisma.sermonComment.create({
      data: { ...data, sermonId, authorEmail: data.authorEmail || null, approved: true },
    })
    return c.json({ comment: { id: comment.id, authorName: comment.authorName, createdAt: comment.createdAt } }, 201)
  }
)

// Admin routes
commentsRouter.get(
  "/comments",
  authenticate,
  requireRole(["ADMIN"]),
  async (c) => {
    const comments = await prisma.sermonComment.findMany({
      orderBy: { createdAt: "desc" },
      include: { sermon: { select: { title: true, slug: true } } },
    })
    return c.json({ comments })
  }
)

commentsRouter.delete(
  "/comments/:id",
  authenticate,
  requireRole(["ADMIN"]),
  async (c) => {
    await prisma.sermonComment.delete({ where: { id: c.req.param("id") } })
    return c.json({ success: true })
  }
)
