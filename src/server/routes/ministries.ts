import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { uniqueSlug } from "../lib/slug"
import { reorderSchema, requiredText, validate } from "../lib/validate"
import { adminWrites } from "../middleware/auth"

// Ministries and departments: the /ministries listing and each detail page.
export const ministriesRouter = new Hono()

adminWrites(ministriesRouter)

const ministrySchema = z.object({
  name: requiredText(2),
  description: requiredText(10),
  leader: z.string().trim().optional(),
  meetingDay: z.string().trim().optional(),
  meetingTime: z.string().trim().optional(),
  imagePublicId: z.string().trim().optional(),
})

ministriesRouter.get("/", async (c) => {
  const ministries = await prisma.ministry.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })
  return c.json({ ministries })
})

ministriesRouter.get("/:slug", async (c) => {
  const ministry = await prisma.ministry.findUnique({ where: { slug: c.req.param("slug") } })
  if (!ministry) return c.json({ error: "Not found" }, 404)
  return c.json({ ministry })
})

ministriesRouter.post("/", validate(ministrySchema), async (c) => {
  const data = c.req.valid("json")
  const slug = await uniqueSlug(data.name, (s) =>
    prisma.ministry.findUnique({ where: { slug: s } }).then(Boolean)
  )
  const order = await prisma.ministry.count()
  const ministry = await prisma.ministry.create({ data: { ...data, slug, order } })
  return c.json({ ministry }, 201)
})

// Registered before "/:id" so "reorder" is not read as an id
ministriesRouter.post("/reorder", validate(reorderSchema), async (c) => {
  const { ids } = c.req.valid("json")
  await prisma.$transaction(
    ids.map((id, order) => prisma.ministry.update({ where: { id }, data: { order } }))
  )
  return c.json({ success: true })
})

// The slug is kept when a ministry is renamed, so links to its page keep working
ministriesRouter.patch("/:id", validate(ministrySchema.partial()), async (c) => {
  const ministry = await prisma.ministry.update({
    where: { id: c.req.param("id") },
    data: c.req.valid("json"),
  })
  return c.json({ ministry })
})

ministriesRouter.delete("/:id", async (c) => {
  await prisma.ministry.delete({ where: { id: c.req.param("id") } })
  return c.json({ success: true })
})
