import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/server/lib/jwt"

const DASHBOARD_ROUTES: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/editor": ["ADMIN", "CHURCH_EDITOR"],
  "/medical": ["ADMIN", "MEDICAL_MINISTER"],
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const protectedPrefix = Object.keys(DASHBOARD_ROUTES).find((p) =>
    pathname.startsWith(p)
  )

  if (!protectedPrefix) return NextResponse.next()

  const allowedRoles = DASHBOARD_ROUTES[protectedPrefix]

  const token =
    req.cookies.get("nac_token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url))
  }

  try {
    const { role } = await verifyToken(token)

    if (!allowedRoles.includes(role)) {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url))
      if (role === "CHURCH_EDITOR") return NextResponse.redirect(new URL("/editor", req.url))
      if (role === "MEDICAL_MINISTER") return NextResponse.redirect(new URL("/medical", req.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url))
  }
}

export const config = {
  matcher: ["/admin/:path*", "/editor/:path*", "/medical/:path*"],
}
