import { Prisma, PrismaClient } from "@prisma/client"

// Hosted databases close connections that have sat idle, and a quiet website is
// idle most of the time. The first query after a lull then fails or hangs,
// although nothing is really wrong. Two things here keep that from reaching
// visitors: a limit on how long one query may take, and a few automatic retries.

/** No query on this site needs more than a second or two. */
const QUERY_TIMEOUT_SECONDS = 20

const ATTEMPTS = 3

// The query never reached the database, so running it again is always safe:
//   P1001  cannot reach the database server
//   P1002  reached it, but it timed out before answering the connection
//   P2024  timed out waiting for a free connection
const NEVER_SENT = ["P1001", "P1002", "P2024"]

// The connection died while the query was in flight. It may or may not have
// run, so only queries that change nothing are tried again:
//   P1008  the query timed out
//   P1017  the server closed the connection
const INTERRUPTED = ["P1008", "P1017"]
const READS = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "findMany", "count", "aggregate", "groupBy"]

function worthRetrying(error: unknown, operation: string): boolean {
  // The client could not open a connection at all (the server was unreachable,
  // the handshake failed or timed out), so nothing was sent
  if (error instanceof Prisma.PrismaClientInitializationError) return true

  const code = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : ""
  return NEVER_SENT.includes(code) || (INTERRUPTED.includes(code) && READS.includes(operation))
}

/** DATABASE_URL with the query time limit added, unless the URL already sets its own. */
function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  // The setting only exists for direct PostgreSQL connections
  if (!url || !/^postgres(ql)?:/.test(url) || url.includes("socket_timeout=")) return url
  return `${url}${url.includes("?") ? "&" : "?"}socket_timeout=${QUERY_TIMEOUT_SECONDS}`
}

function createClient() {
  return new PrismaClient({ datasourceUrl: databaseUrl(), log: ["error"] }).$extends({
    name: "retry-on-connection-trouble",
    query: {
      async $allOperations({ operation, args, query }) {
        for (let attempt = 1; ; attempt++) {
          try {
            return await query(args)
          } catch (error) {
            if (attempt === ATTEMPTS || !worthRetrying(error, operation)) throw error
            // A short pause gives the connection pool time to open a fresh connection
            await new Promise((resolve) => setTimeout(resolve, 250 * attempt))
          }
        }
      },
    },
  })
}

// In development the module is reloaded on every change. Keeping the client on
// `globalThis` stops each reload from opening another set of connections.
const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> }

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
