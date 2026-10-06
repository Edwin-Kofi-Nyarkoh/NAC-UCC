import { zValidator } from "@hono/zod-validator"
import { z, type ZodType } from "zod"

interface ValidationError {
  issues: readonly { path: readonly PropertyKey[]; message: string }[]
}

/** ["serviceTimes", 0, "day"] → "Service times, row 1, day" */
function fieldLabel(path: readonly PropertyKey[]): string {
  const words = path.map((part) =>
    typeof part === "number"
      ? `row ${part + 1}`
      : String(part).replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()
  )
  const label = words.join(", ")
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Turns a failed validation into one readable sentence, e.g. "Title: Too short". */
export function issueMessage(error: ValidationError): string {
  const issue = error.issues[0]
  if (!issue) return "Invalid request"
  const field = fieldLabel(issue.path)
  return field ? `${field}: ${issue.message}` : issue.message
}

/**
 * Validates a JSON request body. On failure it answers with the same
 * `{ error: string }` shape as every other route, so the client can show the
 * message as it is.
 */
export const validate = <T extends ZodType>(schema: T) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: issueMessage(result.error) }, 400)
    }
  })

/**
 * Text that must be filled in, at least `min` characters long once trimmed.
 * The message is worded to follow the field's name: "Title: must be at least 3 characters".
 */
export const requiredText = (min: number) =>
  z
    .string()
    .trim()
    .min(min, min === 1 ? "is required" : `must be at least ${min} characters`)

/** A photo or video stored on Cloudinary. */
export const mediaItemSchema = z.object({
  type: z.enum(["image", "video"]),
  publicId: z.string().trim().min(1),
})

/** Body of a "reorder" request: every id, in the new order. */
export const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
})
