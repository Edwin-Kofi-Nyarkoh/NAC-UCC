import { Hono } from "hono"
import { z } from "zod"
import { validate } from "../lib/validate"

export const giveRouter = new Hono()

const PAYSTACK_API = "https://api.paystack.co"

const NOT_CONFIGURED =
  "Online giving is not available yet. Please use the bank transfer details."

/**
 * Calls Paystack, trying twice. Returns null when it cannot be reached or fails
 * on its own side, which says nothing about the payment itself.
 */
async function askPaystack(path: string, secret: string, init: RequestInit = {}): Promise<Response | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`${PAYSTACK_API}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${secret}`, ...init.headers },
        signal: AbortSignal.timeout(15000),
      })
      if (res.status < 500) return res
    } catch {
      // Could not connect, or no answer in time
    }
  }
  return null
}

const initializeSchema = z.object({
  email: z.string().email(),
  amount: z.number().min(1).max(1_000_000), // GH₵
  type: z.enum(["Tithe", "Offering", "Alumni", "Other"]),
  name: z.string().max(120).optional(),
})

// POST /give/initialize — start a Paystack checkout and return its URL.
// The secret key never leaves the server.
giveRouter.post("/initialize", validate(initializeSchema), async (c) => {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return c.json({ error: NOT_CONFIGURED }, 503)

  const { email, amount, type, name } = c.req.valid("json")
  const origin =
    process.env.SITE_URL ?? c.req.header("origin") ?? new URL(c.req.url).origin

  // Asking twice at worst starts two checkouts; only the one the giver is sent to can be paid
  const res = await askPaystack("/transaction/initialize", secret, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // pesewas
      currency: "GHS",
      callback_url: `${origin}/give`,
      metadata: {
        custom_fields: [
          { display_name: "Name", variable_name: "name", value: name ?? "" },
          { display_name: "Giving Type", variable_name: "type", value: type },
        ],
      },
    }),
  })
  if (!res) return c.json({ error: "Could not reach Paystack just now. Please try again in a moment." }, 502)

  const body = (await res.json().catch(() => null)) as {
    status?: boolean
    message?: string
    data?: { authorization_url: string; reference: string }
  } | null

  if (!res.ok || !body?.status || !body.data) {
    console.error("Paystack initialize failed:", res.status, body?.message)
    return c.json({ error: "Could not start the payment. Please try again." }, 502)
  }

  return c.json({
    authorizationUrl: body.data.authorization_url,
    reference: body.data.reference,
  })
})

// GET /give/verify/:reference — confirm with Paystack that a payment succeeded.
giveRouter.get("/verify/:reference", async (c) => {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return c.json({ error: NOT_CONFIGURED }, 503)

  const reference = c.req.param("reference")
  if (!/^[\w.=-]{1,100}$/.test(reference)) return c.json({ error: "Invalid reference" }, 400)

  const res = await askPaystack(`/transaction/verify/${reference}`, secret)
  // Not the same as "not paid": the giver may well have been charged
  if (!res) return c.json({ error: "Could not reach Paystack to confirm this payment." }, 502)

  const body = (await res.json().catch(() => null)) as {
    status?: boolean
    data?: { status: string; amount: number; currency: string }
  } | null

  // Paystack answered and knows of no such payment
  if (!res.ok || !body?.status || !body.data) return c.json({ paid: false })

  return c.json({
    paid: body.data.status === "success",
    amount: body.data.amount / 100,
    currency: body.data.currency,
  })
})
