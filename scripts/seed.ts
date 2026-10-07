// Puts sample events, news posts and health posts into the database, so the
// site can be seen with something on it before the real content is written.
//
//   npm run db:seed               adds the samples (safe to run more than once)
//   npm run db:seed -- --remove   takes them out again
//
// This is the one place sample content is allowed to live. Every sample is
// found again by its address (its "slug"), listed here, so nothing written in
// the dashboard is ever changed or removed by this script. Each one says in its
// last line that it is a sample, because the events below are not real. A
// sample that staff have rewritten, taking that line out, is theirs from then
// on: removing the samples leaves it where it is.
//
// The database is the live site's, so this changes what visitors see.

import { PrismaClient, type MedicalCategory, type PostCategory } from "@prisma/client"

const prisma = new PrismaClient()

const SAMPLE_LINE = "(This is sample content. Replace it with your own from the dashboard.)"
const SAMPLE_NOTE = `\n\n${SAMPLE_LINE}`

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

/**
 * The next time it is this weekday (0 = Sunday), then `weeksLater` weeks on.
 * Midnight UTC of that day, which is how the dashboard stores an event's date.
 */
function comingWeekday(weekday: number, weeksLater = 0): Date {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  const daysAhead = (weekday - date.getUTCDay() + 7) % 7 || 7
  return new Date(date.getTime() + (daysAhead + weeksLater * 7) * DAY)
}

const events = [
  {
    slug: "sample-sunday-divine-service",
    title: "Sunday Divine Service",
    date: comingWeekday(0),
    time: "9:00 AM",
    location: "University of Cape Coast campus",
    category: "service",
    description:
      "Join us for divine service this Sunday. We gather to worship, to hear the word of God and to celebrate Holy Communion together. Everyone is welcome: students, staff, families and friends.",
  },
  {
    slug: "sample-midweek-service",
    title: "Midweek Service",
    date: comingWeekday(3),
    time: "6:30 PM",
    location: "University of Cape Coast campus",
    category: "service",
    description:
      "A shorter service in the middle of the week, to pause, pray and be strengthened for the days ahead. Come straight from lectures; you are welcome as you are.",
  },
  {
    slug: "sample-youth-fellowship-evening",
    title: "Youth Fellowship Evening",
    date: comingWeekday(6, 1),
    time: "4:00 PM",
    location: "University of Cape Coast campus",
    category: "youth",
    description:
      "An evening for the young people of the congregation: songs, a short devotion, games and time to talk. Bring a friend.",
  },
  {
    slug: "sample-campus-outreach-day",
    title: "Campus Outreach Day",
    date: comingWeekday(6, 2),
    time: "8:00 AM",
    location: "University of Cape Coast campus",
    category: "outreach",
    description:
      "We go out across campus to meet students, share the gospel and invite them to worship with us. We meet for prayer first, then go out in small groups.",
  },
]

const posts: { slug: string; title: string; category: PostCategory; excerpt: string; content: string }[] = [
  {
    slug: "sample-welcome-to-our-new-website",
    title: "Welcome to Our New Website",
    category: "ANNOUNCEMENT",
    excerpt: "Our congregation now has a home online. Here is what you will find on it.",
    content:
      "We are glad to welcome you to the website of the New Apostolic Church, University of Cape Coast Campus Congregation.\n\nHere you will find our service times, coming events, sermons, news from the congregation and health advice from our medical ministry. You can also reach us through the Contact page, and give towards the work of the church.\n\nWe hope it helps you stay close to the congregation, on campus and away from it.",
  },
  {
    slug: "sample-a-warm-welcome-to-the-new-semester",
    title: "A Warm Welcome to the New Semester",
    category: "NEWS",
    excerpt: "To everyone returning to campus, and everyone arriving for the first time: welcome.",
    content:
      "A new semester has begun, and with it come new faces and familiar ones.\n\nIf you are new to the University of Cape Coast, we would love to meet you. Come to a divine service, stay a little afterwards, and let us get to know you. If you are returning, welcome back; we have missed you.\n\nWhatever this semester holds, you do not have to walk through it alone.",
  },
  {
    slug: "sample-choir-rehearsals-resume",
    title: "Choir Rehearsals Resume This Week",
    category: "ANNOUNCEMENT",
    excerpt: "The choir is singing again, and there is room for more voices.",
    content:
      "Choir rehearsals resume this week.\n\nYou do not need to read music or to have sung in a choir before. If you enjoy singing and would like to serve in the divine services, come along and try it.\n\nSpeak to any choir member after the service to find out more.",
  },
  {
    slug: "sample-a-word-for-the-week",
    title: "A Word for the Week: Walking in Love",
    category: "DEVOTIONAL",
    excerpt: "A short thought to carry into the week.",
    content:
      "\"Let all that you do be done with love.\" (1 Corinthians 16:14)\n\nIt is a short verse, and a demanding one. Not some of what we do, and not only what is seen: all of it. The way we answer a roommate, the patience we show in a queue, the care we take over work that nobody will check.\n\nThis week, choose one ordinary thing you do every day, and do it with love.",
  },
]

const medicalPosts: { slug: string; title: string; category: MedicalCategory; excerpt: string; content: string }[] = [
  {
    slug: "sample-staying-well-in-exam-season",
    title: "Staying Well in Exam Season",
    category: "HEALTH_TIP",
    excerpt: "Sleep, water, food and rest: the simple things that carry you through exams.",
    content:
      "Exams ask a lot of the body as well as the mind. A few simple habits make a real difference.\n\nSleep. A tired mind remembers less. Aim for a full night's sleep, especially the night before a paper.\n\nDrink water. Keep a bottle with you while you study.\n\nEat properly. Skipping meals to save time costs more than it saves.\n\nTake breaks. A short walk every hour or so helps you concentrate when you sit down again.\n\nIf you feel overwhelmed, talk to someone. You are not the only one who feels this way.",
  },
  {
    slug: "sample-protecting-yourself-from-malaria",
    title: "Protecting Yourself from Malaria",
    category: "HEALTH_TIP",
    excerpt: "Malaria is preventable. A few habits lower your risk a great deal.",
    content:
      "Malaria is common, and it is preventable.\n\nSleep under a treated mosquito net every night. Wear long sleeves in the evening, when mosquitoes bite most. Do not leave standing water around where you live, because that is where mosquitoes breed.\n\nIf you have a fever, a headache, chills or body pains, do not wait and do not treat yourself by guesswork. Go to a clinic or the university hospital and get tested.",
  },
  {
    slug: "sample-first-aid-everyone-should-know",
    title: "First Aid Everyone Should Know",
    category: "NEWS",
    excerpt: "What to do in the first minutes, before help arrives.",
    content:
      "You do not need to be a health worker to help in an emergency.\n\nFor a small cut, wash it with clean water, press on it with a clean cloth until the bleeding stops, and cover it.\n\nFor a burn, hold it under cool running water for several minutes. Do not put anything else on it.\n\nIf someone faints, lay them down, loosen tight clothing and make sure they can breathe. If they do not come round quickly, get help.\n\nIn any serious emergency, call for help first.",
  },
  {
    slug: "sample-about-the-medical-ministry",
    title: "What the Medical Ministry Does",
    category: "UPDATE",
    excerpt: "Health professionals and students in the congregation, serving its members.",
    content:
      "The medical ministry brings together members of the congregation who work or study in health.\n\nIt shares health advice here on the website, looks out for members who are unwell, and gives basic health talks to the congregation.\n\nIf you have a question about your health, or would like to serve in this ministry, speak to a member of the medical team after the service.",
  },
]

const slugsOf = (items: { slug: string }[]) => items.map((item) => item.slug)

/**
 * When each sample is said to have been written. Posts are listed newest first,
 * so the samples are dated an hour apart, in the order above, and all of them
 * before the oldest post staff have written: a sample never pushes real news
 * down the page or off the home page.
 */
function sampleDates(oldestReal: { createdAt: Date } | null, count: number): Date[] {
  const newest = (oldestReal?.createdAt.getTime() ?? Date.now()) - HOUR
  return Array.from({ length: count }, (_, index) => new Date(newest - index * HOUR))
}

async function add() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", active: true }, orderBy: { createdAt: "asc" } })
  if (!admin) {
    throw new Error("There is no admin account to be the author. Create one first: npm run create-admin")
  }
  const minister = await prisma.user.findFirst({ where: { role: "MEDICAL_MINISTER", active: true }, orderBy: { createdAt: "asc" } })

  // Anything already there (and perhaps edited since) is left exactly as it is
  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: { ...event, description: event.description + SAMPLE_NOTE, published: true, authorId: admin.id },
    })
  }
  const oldestPost = await prisma.post.findFirst({ where: { slug: { notIn: slugsOf(posts) } }, orderBy: { createdAt: "asc" } })
  const postDates = sampleDates(oldestPost, posts.length)
  for (const [index, post] of posts.entries()) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...post, content: post.content + SAMPLE_NOTE, published: true, authorId: admin.id, createdAt: postDates[index] },
    })
  }
  const oldestMedicalPost = await prisma.medicalPost.findFirst({ where: { slug: { notIn: slugsOf(medicalPosts) } }, orderBy: { createdAt: "asc" } })
  const medicalDates = sampleDates(oldestMedicalPost, medicalPosts.length)
  for (const [index, post] of medicalPosts.entries()) {
    await prisma.medicalPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...post, content: post.content + SAMPLE_NOTE, published: true, authorId: (minister ?? admin).id, createdAt: medicalDates[index] },
    })
  }

  console.log(`Samples in place: ${events.length} events, ${posts.length} news posts, ${medicalPosts.length} health posts.`)
  console.log("They show on the site within five minutes. To take them out again: npm run db:seed -- --remove")
}

async function remove() {
  // Only those still saying they are samples
  const [removedEvents, removedPosts, removedMedical] = await Promise.all([
    prisma.event.deleteMany({ where: { slug: { in: slugsOf(events) }, description: { contains: SAMPLE_LINE } } }),
    prisma.post.deleteMany({ where: { slug: { in: slugsOf(posts) }, content: { contains: SAMPLE_LINE } } }),
    prisma.medicalPost.deleteMany({ where: { slug: { in: slugsOf(medicalPosts) }, content: { contains: SAMPLE_LINE } } }),
  ])
  console.log(`Samples removed: ${removedEvents.count} events, ${removedPosts.count} news posts, ${removedMedical.count} health posts.`)

  const [keptEvents, keptPosts, keptMedical] = await Promise.all([
    prisma.event.findMany({ where: { slug: { in: slugsOf(events) } }, select: { title: true } }),
    prisma.post.findMany({ where: { slug: { in: slugsOf(posts) } }, select: { title: true } }),
    prisma.medicalPost.findMany({ where: { slug: { in: slugsOf(medicalPosts) } }, select: { title: true } }),
  ])
  const kept = [...keptEvents, ...keptPosts, ...keptMedical]
  if (kept.length > 0) {
    console.log(`Kept, because staff have rewritten them (the sample line is gone): ${kept.map((item) => `"${item.title}"`).join(", ")}`)
  }
}

const task = process.argv.includes("--remove") ? remove : add

task()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
