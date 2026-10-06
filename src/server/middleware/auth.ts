import type { Role } from "@prisma/client"
import type { Hono } from "hono"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { verifyToken, type JWTPayload } from "../lib/jwt"
import { prisma } from "../lib/prisma"

declare module "hono" {
  interface ContextVariableMap {
    user: JWTPayload
  }
}

/**
 * Checks the Bearer token and that the account is still active, then makes the
 * signed-in user available to the route as `c.var.user`.
 */
export const authenticate = createMiddleware(async (c, next) => {
  const header = c.req.header("Authorization")
  if (!header?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing or invalid Authorization header" })
  }

  let payload: JWTPayload
  try {
    payload = await verifyToken(header.slice("Bearer ".length))
  } catch {
    throw new HTTPException(401, { message: "Invalid or expired token" })
  }

  // Tokens last 8 hours, so look the account up on every request: suspending
  // a user or changing their role takes effect immediately, not at next login.
  const account = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { role: true, active: true, verified: true },
  })
  if (!account || !account.active || !account.verified) {
    throw new HTTPException(401, { message: "This account is no longer active" })
  }

  c.set("user", { ...payload, role: account.role })
  await next()
})

/**
 * Role guard, used after `authenticate`:
 * requireRole("ADMIN") or requireRole(["ADMIN", "CHURCH_EDITOR"])
 */
export function requireRole(roles: Role | Role[]) {
  const allowed = Array.isArray(roles) ? roles : [roles]
  return createMiddleware(async (c, next) => {
    if (!allowed.includes(c.var.user.role)) {
      throw new HTTPException(403, { message: "Insufficient permissions" })
    }
    await next()
  })
}

/**
 * For collections that anyone may read but only an admin may change.
 * Call it on a router before adding its routes.
 */
export function adminWrites(router: Hono) {
  router.on(["POST", "PUT", "PATCH", "DELETE"], "*", authenticate, requireRole("ADMIN"))
}
