import type { Role } from "@prisma/client"
import { SignJWT, jwtVerify } from "jose"

const DEV_SECRET = "change-me-in-production-use-openssl-rand-base64-32"

// Resolved lazily so a missing secret fails the request, not the build.
function getSecret(): Uint8Array {
  const value = process.env.JWT_SECRET
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not set")
  }
  return new TextEncoder().encode(value ?? DEV_SECRET)
}

const EXPIRES_IN = "8h"

export interface JWTPayload {
  sub: string   // user id
  email: string
  name: string
  role: Role
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as JWTPayload
}
