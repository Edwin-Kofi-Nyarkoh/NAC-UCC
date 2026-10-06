import bcrypt from "bcryptjs"
import { Hono } from "hono"
import { z } from "zod"
import { signToken } from "../lib/jwt"
import { prisma } from "../lib/prisma"
import { validate } from "../lib/validate"
import { authenticate } from "../middleware/auth"

export const authRouter = new Hono()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "is required"), // exactly as typed
})

// POST /auth/login
authRouter.post("/login", validate(loginSchema), async (c) => {
  const { email, password } = c.req.valid("json")

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.active) {
    return c.json({ error: "Invalid credentials" }, 401)
  }

  // Must be verified by admin before they can log in
  if (!user.verified) {
    return c.json({ error: "Your account has not been verified yet. Please contact the administrator." }, 403)
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401)
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  })
})

// GET /auth/me — return current user from token
authRouter.get("/me", authenticate, async (c) => {
  const { sub } = c.var.user
  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: { id: true, email: true, name: true, role: true, verified: true, active: true },
  })
  if (!user) return c.json({ error: "User not found" }, 404)
  return c.json({ user })
})
