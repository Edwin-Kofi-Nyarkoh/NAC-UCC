import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { requiredText, validate } from "../lib/validate"
import { authenticate, requireRole } from "../middleware/auth"

export const contactRouter = new Hono()

const contactSchema = z.object({
  name: requiredText(2),
  email: z.string().email(),
  subject: requiredText(3),
  message: requiredText(10),
})

// Public — anyone can submit
contactRouter.post("/", validate(contactSchema), async (c) => {
  const data = c.req.valid("json")
  const msg = await prisma.contactMessage.create({ data })
  return c.json({ success: true, id: msg.id }, 201)
})

// Admin only — view submissions
contactRouter.get(
  "/",
  authenticate,
  requireRole(["ADMIN"]),
  async (c) => {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    })
    return c.json({ messages })
  }
)

contactRouter.patch(
  "/:id/read",
  authenticate,
  requireRole(["ADMIN"]),
  async (c) => {
    const msg = await prisma.contactMessage.update({
      where: { id: c.req.param("id") },
      data: { read: true },
    })
    return c.json({ message: msg })
  }
)

contactRouter.delete(
  "/:id",
  authenticate,
  requireRole(["ADMIN"]),
  async (c) => {
    await prisma.contactMessage.delete({ where: { id: c.req.param("id") } })
    return c.json({ success: true })
  }
)
