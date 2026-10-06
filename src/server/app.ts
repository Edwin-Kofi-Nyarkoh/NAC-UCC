import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { Prisma } from "@prisma/client"

import { authRouter } from "./routes/auth"
import { adminRouter } from "./routes/admin"
import { postsRouter } from "./routes/posts"
import { medicalRouter } from "./routes/medical"
import { eventsRouter } from "./routes/events"
import { sermonsRouter } from "./routes/sermons"
import { commentsRouter } from "./routes/comments"
import { contactRouter } from "./routes/contact"
import { nominationsRouter } from "./routes/nominations"
import { searchRouter } from "./routes/search"
import { giveRouter } from "./routes/give"
import { settingsRouter } from "./routes/settings"
import { heroSlidesRouter } from "./routes/hero-slides"
import { leadersRouter } from "./routes/leaders"
import { ministriesRouter } from "./routes/ministries"
import { galleryRouter } from "./routes/gallery"
import { uploadsRouter } from "./routes/uploads"

// The whole API. It is part of the Next.js app and served from /api/*
// (see src/app/api/[[...route]]/route.ts). Server components skip HTTP and
// call it directly through src/lib/server-api.ts.
export const app = new Hono().basePath("/api")

// Staff accounts
app.route("/auth", authRouter)
app.route("/admin", adminRouter)

// Content written by staff
app.route("/posts", postsRouter)
app.route("/medical", medicalRouter)
app.route("/events", eventsRouter)
app.route("/sermons", sermonsRouter)
app.route("/", commentsRouter) // /sermons/:id/comments and /comments

// Things visitors send in
app.route("/contact", contactRouter)
app.route("/nominations", nominationsRouter)
app.route("/give", giveRouter)
app.route("/search", searchRouter)

// Site content the admin manages
app.route("/settings", settingsRouter)
app.route("/hero-slides", heroSlidesRouter)
app.route("/leaders", leadersRouter)
app.route("/ministries", ministriesRouter)
app.route("/gallery", galleryRouter)
app.route("/uploads", uploadsRouter)

app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }))

// Every error leaves as { error: string } so the client can show it as it is.
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // The record to update or delete does not exist
    if (err.code === "P2025") return c.json({ error: "Not found" }, 404)
    // Something else still points at it, e.g. a user who has written posts
    if (err.code === "P2003") {
      return c.json({ error: "This record is still in use and cannot be deleted" }, 409)
    }
  }
  console.error(err)
  return c.json({ error: "Internal server error" }, 500)
})

app.notFound((c) => c.json({ error: "Route not found" }, 404))
