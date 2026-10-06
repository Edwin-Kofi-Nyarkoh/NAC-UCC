import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { Hono } from "hono"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { requiredText, validate } from "../lib/validate"
import { authenticate, requireRole } from "../middleware/auth"

export const adminRouter = new Hono()

// All admin routes require authentication + ADMIN role
adminRouter.use("*", authenticate, requireRole("ADMIN"))

// Passwords are taken exactly as typed: never trimmed or otherwise altered
const newPassword = z.string().min(8, "must be at least 8 characters")

const createUserSchema = z.object({
  email: z.string().email(),
  password: newPassword,
  name: requiredText(2),
  role: z.enum(Role),
})

const updateUserSchema = z.object({
  name: requiredText(2).optional(),
  role: z.enum(Role).optional(),
  verified: z.boolean().optional(),
  active: z.boolean().optional(),
})

// GET /admin/users
adminRouter.get("/users", async (c) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, verified: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
  return c.json({ users })
})

// POST /admin/users — create a user (no self-registration)
adminRouter.post("/users", validate(createUserSchema), async (c) => {
  const { email, password, name, role } = c.req.valid("json")

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return c.json({ error: "Email already in use" }, 409)

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role, verified: true },
    select: { id: true, email: true, name: true, role: true, verified: true, active: true },
  })
  return c.json({ user }, 201)
})

// PATCH /admin/users/:id — update role, verified, active
adminRouter.patch("/users/:id", validate(updateUserSchema), async (c) => {
  const id = c.req.param("id")
  const data = c.req.valid("json")

  // An admin cannot lock themselves out by mistake. Because whoever makes a
  // change always keeps their own access, there is always at least one admin.
  const changesAccess =
    data.role !== undefined || data.active !== undefined || data.verified !== undefined
  if (id === c.var.user.sub && changesAccess) {
    return c.json({ error: "You cannot change your own role or access. Ask another admin to do it." }, 400)
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, verified: true, active: true },
  })
  return c.json({ user })
})

// DELETE /admin/users/:id
adminRouter.delete("/users/:id", async (c) => {
  const id = c.req.param("id")
  const current = c.var.user

  // Prevent self-deletion
  if (id === current.sub) {
    return c.json({ error: "Cannot delete your own account" }, 400)
  }
  await prisma.user.delete({ where: { id } })
  return c.json({ success: true })
})

// PATCH /admin/users/:id/reset-password
adminRouter.patch(
  "/users/:id/reset-password",
  validate(z.object({ password: newPassword })),
  async (c) => {
    const id = c.req.param("id")
    const { password } = c.req.valid("json")
    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.update({ where: { id }, data: { password: hashed } })
    return c.json({ success: true })
  }
)
