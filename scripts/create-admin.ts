// Creates an admin account, or resets the password of an existing one.
//
// The website has no sign-up page: staff accounts are created by an admin from
// the dashboard. A new installation therefore needs its first admin made here,
// and this is also the way back in if every admin has forgotten their password.
//
//   npm run create-admin -- admin@example.org "a strong password" "Full Name"

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const [email, password, name = "Administrator"] = process.argv.slice(2)

  if (!email?.includes("@") || !password) {
    console.error('Usage: npm run create-admin -- <email> "<password>" ["<full name>"]')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error("The password must be at least 8 characters.")
    process.exit(1)
  }

  const hashed = await bcrypt.hash(password, 12)
  const existing = await prisma.user.findUnique({ where: { email } })

  await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: "ADMIN", verified: true, active: true },
    create: { email, password: hashed, name, role: "ADMIN", verified: true },
  })

  console.log(
    existing
      ? `Password reset for ${email}. The account is an active admin.`
      : `Admin account created for ${email}.`
  )
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
