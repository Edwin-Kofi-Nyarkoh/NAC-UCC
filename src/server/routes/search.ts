import { Hono } from "hono"
import { prisma } from "../lib/prisma"

export const searchRouter = new Hono()

searchRouter.get("/", async (c) => {
  const q = c.req.query("q")?.trim()
  const type = c.req.query("type") // "posts" | "events" | "sermons" | "medical" | all

  if (!q || q.length < 2) {
    return c.json({ query: q ?? "", results: { posts: [], events: [], sermons: [], medical: [] }, total: 0 })
  }

  const where = {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { excerpt: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  }

  const [posts, events, sermons, medical] = await Promise.all([
    (!type || type === "posts")
      ? prisma.post.findMany({
          where: { published: true, ...where },
          select: { id: true, title: true, slug: true, excerpt: true, category: true, createdAt: true },
          take: 5,
        })
      : [],

    (!type || type === "events")
      ? prisma.event.findMany({
          where: {
            published: true,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, title: true, slug: true, date: true, location: true, category: true },
          take: 5,
        })
      : [],

    (!type || type === "sermons")
      ? prisma.sermon.findMany({
          where: {
            published: true,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { preacher: { contains: q, mode: "insensitive" } },
              { scripture: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, title: true, slug: true, preacher: true, scripture: true, date: true },
          take: 5,
        })
      : [],

    (!type || type === "medical")
      ? prisma.medicalPost.findMany({
          where: { published: true, ...where },
          select: { id: true, title: true, slug: true, excerpt: true, category: true, createdAt: true },
          take: 5,
        })
      : [],
  ])

  return c.json({
    query: q,
    results: {
      posts: posts.map((p) => ({ ...p, _type: "post" })),
      events: events.map((e) => ({ ...e, _type: "event" })),
      sermons: sermons.map((s) => ({ ...s, _type: "sermon" })),
      medical: medical.map((m) => ({ ...m, _type: "medical" })),
    },
    total: posts.length + events.length + sermons.length + medical.length,
  })
})
