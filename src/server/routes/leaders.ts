import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { reorderSchema, requiredText, validate } from "../lib/validate"
import { adminWrites } from "../middleware/auth"

// The leadership team shown on the About page.
export const leadersRouter = new Hono()

adminWrites(leadersRouter)

const leaderSchema = z.object({
  name: requiredText(2),
  title: requiredText(2),
  bio: z.string().trim().optional(),
  imagePublicId: z.string().trim().optional(),
})

leadersRouter.get("/", async (c) => {
  const leaders = await prisma.leader.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })
  return c.json({ leaders })
})

leadersRouter.post("/", validate(leaderSchema), async (c) => {
  // New entries go to the end of the list
  const order = await prisma.leader.count()
  const leader = await prisma.leader.create({ data: { ...c.req.valid("json"), order } })
  return c.json({ leader }, 201)
})

// Registered before "/:id" so "reorder" is not read as an id
leadersRouter.post("/reorder", validate(reorderSchema), async (c) => {
  const { ids } = c.req.valid("json")
  await prisma.$transaction(
    ids.map((id, order) => prisma.leader.update({ where: { id }, data: { order } }))
  )
  return c.json({ success: true })
})

leadersRouter.patch("/:id", validate(leaderSchema.partial()), async (c) => {
  const leader = await prisma.leader.update({
    where: { id: c.req.param("id") },
    data: c.req.valid("json"),
  })
  return c.json({ leader })
})

leadersRouter.delete("/:id", async (c) => {
  await prisma.leader.delete({ where: { id: c.req.param("id") } })
  return c.json({ success: true })
})
