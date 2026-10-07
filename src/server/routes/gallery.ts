import { Hono } from "hono"
import { z } from "zod"
import { GALLERY_CATEGORIES } from "@/lib/gallery"
import { prisma } from "../lib/prisma"
import { requiredText, validate } from "../lib/validate"
import { adminWrites } from "../middleware/auth"

// Photos and videos on the /gallery page. Newest first.
export const galleryRouter = new Hono()

adminWrites(galleryRouter)

const galleryItemSchema = z.object({
  type: z.enum(["image", "video"]),
  publicId: requiredText(1),
  caption: z.string().trim().optional(),
  // One from the list, or none
  category: z.enum(["", ...GALLERY_CATEGORIES], "must be one of the categories in the list").optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

galleryRouter.get("/", async (c) => {
  const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } })
  return c.json({ items })
})

galleryRouter.post("/", validate(galleryItemSchema), async (c) => {
  const item = await prisma.galleryItem.create({ data: c.req.valid("json") })
  return c.json({ item }, 201)
})

galleryRouter.patch("/:id", validate(galleryItemSchema.partial()), async (c) => {
  const item = await prisma.galleryItem.update({
    where: { id: c.req.param("id") },
    data: c.req.valid("json"),
  })
  return c.json({ item })
})

galleryRouter.delete("/:id", async (c) => {
  await prisma.galleryItem.delete({ where: { id: c.req.param("id") } })
  return c.json({ success: true })
})
