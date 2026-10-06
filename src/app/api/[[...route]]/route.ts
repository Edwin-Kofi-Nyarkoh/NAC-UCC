import { handle } from "hono/vercel"
import { app } from "@/server/app"

// Every request under /api is handed to the API in src/server.
// Prisma and bcrypt need the Node.js runtime.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const handler = handle(app)

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
}
