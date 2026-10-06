import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { requiredText, validate } from "../lib/validate"
import { authenticate, requireRole } from "../middleware/auth"

export const nominationsRouter = new Hono()

// Public: list active positions
nominationsRouter.get("/positions", async (c) => {
  const positions = await prisma.nominationPosition.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, title: true, description: true, order: true },
  })
  return c.json({ positions })
})

// Public: submit nominations (batch — one per active position)
const submitSchema = z.object({
  nominatorName: requiredText(2).max(100),
  nominatorId: requiredText(2).max(50),  // Student index number
  nominations: z.array(
    z.object({
      positionId: z.string(),
      nomineeName: requiredText(2).max(100),
      nomineeInfo: z.string().max(200).optional(),
    })
  ).min(1).max(20),
})

nominationsRouter.post("/submit", validate(submitSchema), async (c) => {
  const { nominatorName, nominatorId, nominations } = c.req.valid("json")

  // Check for existing nominations from this student
  const existingPositionIds = await prisma.nomination.findMany({
    where: {
      nominatorId,
      positionId: { in: nominations.map((n) => n.positionId) },
    },
    select: { positionId: true },
  })

  const alreadyVoted = new Set(existingPositionIds.map((e) => e.positionId))
  const fresh = nominations.filter((n) => !alreadyVoted.has(n.positionId))

  // Nothing new to record: the member has already nominated for every position sent
  if (fresh.length === 0) {
    return c.json({
      submitted: 0,
      skipped: nominations.length,
      alreadyVoted: Array.from(alreadyVoted),
    })
  }

  await prisma.nomination.createMany({
    data: fresh.map((n) => ({
      nomineeName: n.nomineeName,
      nomineeInfo: n.nomineeInfo ?? null,
      nominatorName,
      nominatorId,
      positionId: n.positionId,
    })),
    skipDuplicates: true,
  })

  return c.json({
    submitted: fresh.length,
    skipped: nominations.length - fresh.length,
    alreadyVoted: Array.from(alreadyVoted),
  }, 201)
})

// Public: check if a student has already voted (before they fill form)
nominationsRouter.get("/check/:nominatorId", async (c) => {
  const nominatorId = c.req.param("nominatorId")
  const existing = await prisma.nomination.findMany({
    where: { nominatorId },
    select: { positionId: true },
  })
  return c.json({ votedPositionIds: existing.map((e) => e.positionId) })
})

// Admin: manage positions
const positionSchema = z.object({
  title: requiredText(2).max(100),
  description: z.string().max(300).optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
})

nominationsRouter.get(
  "/positions/all",
  authenticate,
  requireRole(["ADMIN"]),
  async (c) => {
    const positions = await prisma.nominationPosition.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { nominations: true } } },
    })
    return c.json({ positions })
  }
)

nominationsRouter.post(
  "/positions",
  authenticate,
  requireRole(["ADMIN"]),
  validate(positionSchema),
  async (c) => {
    const data = c.req.valid("json")
    const position = await prisma.nominationPosition.create({ data })
    return c.json({ position }, 201)
  }
)

nominationsRouter.patch(
  "/positions/:id",
  authenticate,
  requireRole(["ADMIN"]),
  validate(positionSchema.partial()),
  async (c) => {
    const position = await prisma.nominationPosition.update({
      where: { id: c.req.param("id") },
      data: c.req.valid("json"),
    })
    return c.json({ position })
  }
)

nominationsRouter.delete(
  "/positions/:id",
  authenticate,
  requireRole(["ADMIN"]),
  async (c) => {
    await prisma.nominationPosition.delete({ where: { id: c.req.param("id") } })
    return c.json({ success: true })
  }
)

// Admin: view results per position (tally)
nominationsRouter.get(
  "/results",
  authenticate,
  requireRole(["ADMIN"]),
  async (c) => {
    const positions = await prisma.nominationPosition.findMany({
      orderBy: { order: "asc" },
      include: {
        nominations: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            nomineeName: true,
            nomineeInfo: true,
            nominatorName: true,
            nominatorId: true,
            createdAt: true,
          },
        },
      },
    })

    // Build tally: {nomineeName → count} per position
    const results = positions.map((pos) => {
      const tally: Record<string, number> = {}
      for (const nom of pos.nominations) {
        const key = nom.nomineeName.toLowerCase().trim()
        tally[key] = (tally[key] ?? 0) + 1
      }

      const ranked = Object.entries(tally)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      return {
        id: pos.id,
        title: pos.title,
        description: pos.description,
        active: pos.active,
        totalNominations: pos.nominations.length,
        tally: ranked,
        nominations: pos.nominations,
      }
    })

    return c.json({ results })
  }
)

// Admin: delete individual nomination
nominationsRouter.delete(
  "/nominations/:id",
  authenticate,
  requireRole(["ADMIN"]),
  async (c) => {
    await prisma.nomination.delete({ where: { id: c.req.param("id") } })
    return c.json({ success: true })
  }
)
