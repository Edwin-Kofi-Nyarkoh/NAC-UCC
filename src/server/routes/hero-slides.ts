import { Hono } from "hono"
import { z } from "zod"
import { prepareHeroVideo } from "../lib/cloudinary"
import { prisma } from "../lib/prisma"
import { reorderSchema, requiredText, validate } from "../lib/validate"
import { adminWrites } from "../middleware/auth"

// The slides in the banner at the top of the home page. Each is a photo or a
// video, shown in the order the admin has put them.
export const heroSlidesRouter = new Hono()

adminWrites(heroSlidesRouter)

const slideSchema = z.object({
  type: z.enum(["image", "video"]),
  publicId: requiredText(1),
  // All the words are optional: a slide with no headline is just a background
  // for the banner's standard welcome
  title: z.string().trim().max(120).optional(),
  subtitle: z.string().trim().max(200).optional(),
  ctaLabel: z.string().trim().max(40).optional(),
  // Internal links only ("/events"), so a slide can never send visitors off-site
  ctaHref: z
    .string()
    .trim()
    .regex(/^\/(?!\/)/, "must be a page on this site, e.g. /events")
    .or(z.literal(""))
    .optional(),
})

heroSlidesRouter.get("/", async (c) => {
  const slides = await prisma.heroSlide.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  })
  return c.json({ slides })
})

heroSlidesRouter.post("/", validate(slideSchema), async (c) => {
  const input = c.req.valid("json")
  // New slides go to the end of the slideshow
  const order = await prisma.heroSlide.count()
  const slide = await prisma.heroSlide.create({ data: { ...input, title: input.title ?? "", order } })

  if (slide.type === "video") await prepareHeroVideo(slide.publicId)
  return c.json({ slide }, 201)
})

// Registered before "/:id" so "reorder" is not read as an id
heroSlidesRouter.post("/reorder", validate(reorderSchema), async (c) => {
  const { ids } = c.req.valid("json")
  await prisma.$transaction(
    ids.map((id, order) => prisma.heroSlide.update({ where: { id }, data: { order } }))
  )
  return c.json({ success: true })
})

heroSlidesRouter.patch("/:id", validate(slideSchema.partial()), async (c) => {
  const input = c.req.valid("json")
  const slide = await prisma.heroSlide.update({ where: { id: c.req.param("id") }, data: input })

  // Only when the file itself was changed
  if (input.publicId && slide.type === "video") await prepareHeroVideo(slide.publicId)
  return c.json({ slide })
})

heroSlidesRouter.delete("/:id", async (c) => {
  await prisma.heroSlide.delete({ where: { id: c.req.param("id") } })
  return c.json({ success: true })
})
