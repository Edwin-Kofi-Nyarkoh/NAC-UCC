# NAC UCC Campus Congregation — Website

The website of the New Apostolic Church, University of Cape Coast Campus Congregation:
a public site, a staff dashboard for managing its content, and the API behind both.
It is one Next.js application.

> **Private project.** This code and its documentation belong to the NAC UCC web
> team. It is not open source: do not publish the repository, share it outside the
> team, or reuse it elsewhere without permission. `.env` holds live credentials and
> must never be committed or sent to anyone.

There are two documents:

| Document | For | Covers |
|---|---|---|
| **README.md** (this file) | Whoever maintains the code | Running it, configuration, how it is built, how to extend it |
| **[STAFF-GUIDE.md](STAFF-GUIDE.md)** | The people who run the site | Accounts, signing in, and how to do every task in the dashboard |

## Running it

You need Node.js 20 or newer and a PostgreSQL database.

```bash
npm install        # also generates the database client
npm run dev        # http://localhost:3000
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` then `npm start` | Build and run for production. The build downloads the site's font from Google, so it needs internet; if it stops with a Google Fonts error, run it again |
| `npm run typecheck` | Check the TypeScript types |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Apply `prisma/schema.prisma` to the database |
| `npm run db:studio` | Browse the database in a browser |
| `npm run create-admin -- <email> "<password>" "<name>"` | Create an admin, or reset an admin's password |

### First-time setup

1. Create `.env` (see below).
2. `npm run db:push` to create the tables.
3. `npm run create-admin -- you@example.org "a strong password" "Your Name"`.
4. `npm run dev`, sign in at `/login`, and fill in the site from the dashboard.

## Configuration

Everything is configured in a single `.env` file in this folder. It is never committed.

| Variable | Needed for | Notes |
|---|---|---|
| `DATABASE_URL` | Everything | PostgreSQL connection string |
| `DIRECT_URL` | `npm run db:push` | Non-pooled connection. Same as `DATABASE_URL` if you have no pooler |
| `JWT_SECRET` | Staff login | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Showing photos and videos | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Uploading from the dashboard | Cloudinary console → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Uploading from the dashboard | Same page, "API Secret". It is **not** the same value as the key |
| `PAYSTACK_SECRET_KEY` | Online giving | `sk_test_…` while testing, `sk_live_…` to take real gifts |
| `SITE_URL` | Online giving in production | The site's public address, e.g. `https://example.org` |

Restart the server after changing `.env`.

Without a correct Cloudinary key and secret, uploads from the dashboard are refused
with a message naming `CLOUDINARY_API_SECRET`; staff can still use media that is
already on Cloudinary by pasting its ID. Without the Paystack key, the Give page shows
the bank details only.

A query time limit of 20 seconds is added to `DATABASE_URL` automatically. To use a
different limit, put `socket_timeout=<seconds>` in the URL yourself.

## Accounts and what they can do

There is no sign-up page. An admin creates every account at `/admin/users`.

| | Admin | Church Editor | Medical Minister |
|---|:---:|:---:|:---:|
| Role in the database | `ADMIN` | `CHURCH_EDITOR` | `MEDICAL_MINISTER` |
| Dashboard | `/admin` | `/editor` | `/medical` |
| Posts, events, sermons | ✓ | ✓ | |
| Medical posts | ✓ | | ✓ |
| Sermon comments (remove) | ✓ | | |
| Hero slides, leaders, ministries, gallery | ✓ | | |
| Site settings | ✓ | | |
| Contact messages, nominations | ✓ | | |
| Staff accounts | ✓ | | |
| Upload media | ✓ | ✓ | ✓ |

How the rules are enforced:

- **Twice.** `src/proxy.ts` keeps people out of dashboard pages that are not theirs
  (an editor who opens `/admin` is sent to `/editor`), and every API route checks the
  role again with `requireRole()` or `adminWrites()`. The page guard is a convenience;
  the API check is the one that matters.
- **On every request.** The API looks the account up each time, so suspending someone
  or changing their role takes effect immediately, not when their 8-hour token expires.
- **Nobody edits their own access.** An admin cannot change their own role, suspend,
  un-verify or delete themselves, so there is always at least one working admin.
- A **Pending** (unverified) or **Suspended** account cannot sign in. Accounts created
  from the dashboard start verified.
- An account that has authored content cannot be deleted (the database refuses);
  suspend it instead.
- Editors can edit and delete any post, event or sermon, not only their own.

Recovering access when every admin is locked out, or creating the first admin:

```bash
npm run create-admin -- admin@example.org "a new strong password"
```

If the email exists, this resets its password and makes it an active, verified admin.
If not, it creates the account.

The step-by-step version of all this, written for the people using the dashboard, is
in [STAFF-GUIDE.md](STAFF-GUIDE.md).

## How the site gets its content

Nothing on the public site is hard-coded sample data. Staff enter it in the dashboard,
and a section of the site stays hidden until it has content.

| Shown on the site | Managed at | Who |
|---|---|---|
| News, events, sermons | `/admin/…` or `/editor/…` | Admin, Church Editor |
| Health news and alerts | `/admin/medical` or `/medical/posts` | Admin, Medical Minister |
| Home page banner (fallback picture, photo and video slides), leaders, ministries, gallery | `/admin/hero-slides`, `/admin/leaders`, `/admin/ministries`, `/admin/gallery` | Admin |
| Service times, contact details, social links, About page text, bank details | `/admin/settings` | Admin |
| Sermon comments, contact messages, nominations | `/admin/comments`, `/admin/messages`, `/admin/nominations` | Admin |
| Staff accounts | `/admin/users` | Admin |

Where pictures appear on the home page:

- The banner at the top, set up at `/admin/hero-slides`: a fallback picture, and
  photo or video slides in the order the admin chooses. See "The home page banner"
  below.
- The newest news post is shown with its featured photo.
- The newest sermon is shown over its photo.

Online gifts go through Paystack and are not stored by this app; they are listed in
the church's Paystack account.

## How the code is organised

```
README.md                   This file
STAFF-GUIDE.md              How to use the dashboard, for non-developers
prisma/schema.prisma        The database tables
scripts/create-admin.ts     Creates the first admin account
public/                     Icons and the service worker (offline support)
src/
  app/
    (site)/                 The public pages, wrapped in the navbar and footer
    (auth)/login/           Staff sign-in
    (dashboard)/            The staff dashboard: admin/, editor/, medical/
    api/[[...route]]/       Hands every /api request to the API in src/server
  server/                   The API
    app.ts                  Lists every router and where it is mounted
    routes/                 One file per resource (posts, events, gallery, …)
    middleware/auth.ts      Sign-in and role checks
    lib/                    Database client, tokens, validation, slugs, Cloudinary signing
  components/
    layout/                 Navbar, footer, mobile tab bar
    home/                   Sections of the home page
    dashboard/              Building blocks shared by the dashboard pages
    content/, gallery/, …   Pieces used by individual public pages
    ui/                     Small generic components
  lib/
    api.ts                  How the browser calls the API
    server-api.ts           How server-rendered pages read from the API
    session.ts              The signed-in user: storage, cookie, React hook
    site-settings.ts        The shape of the site settings, shared by API and forms
    cloudinary.ts           Builds image and video URLs
    hero-media.ts           Sizes and quality of the home page banner's photos and videos
    upload.ts               Uploads a file to Cloudinary from the browser
    browser-conditions.ts   What we know about the visitor: data saver, reduced motion, in view
  config/navigation.ts      The menu and footer links
  types/index.ts            The shape of every record the API returns
  proxy.ts                  Keeps signed-out visitors out of the dashboard
```

### How a request flows

- **A visitor opens a page.** The page is rendered on the server. It reads what it
  needs through `serverFetch()` in `src/lib/server-api.ts`, which calls the API
  directly, without going over the network.
- **Staff use the dashboard.** Dashboard pages run in the browser and call the API
  through `api` in `src/lib/api.ts`, which adds the sign-in token to each request.
- **The API.** Each router in `src/server/routes/` validates its input with Zod and
  talks to the database through Prisma. Every error leaves as `{ "error": "…" }`.

### Signing in

Signing in returns a token that lasts 8 hours. The browser keeps it in `localStorage`
(to send with API calls) and in a cookie (so `src/proxy.ts` can turn away signed-out
visitors before a dashboard page loads). Passwords are stored hashed with bcrypt.

### Media

Photos and videos live on Cloudinary; the database stores only each file's Cloudinary
ID. To upload, the browser asks the API for a signature (`POST /api/uploads/signature`)
and then sends the file straight to Cloudinary, so large files never pass through this
server and the API secret never reaches the browser.

`src/lib/cloudinary.ts` builds the URLs that resize, crop and compress each picture for
where it is shown, and browsers fetch them directly from Cloudinary. Next.js's own
image optimiser is switched off in `next.config.ts`: Cloudinary has already done that
work, and a second pass through this server only added a step that could time out.

### The home page banner

`src/components/home/hero.tsx` draws the banner in layers, cheapest first, so there is
always something to look at:

1. a plain navy background;
2. the admin's fallback picture, as a small softened file (about 10 KB);
3. the current slide's photo, or the first frame of its video;
4. the video itself, once enough has arrived to play.

It is the heaviest thing on the site, so it is built to use little data. The rules
live in `src/lib/hero-media.ts`:

- Photos are cropped to the hero's shape (tall for upright phones, wide otherwise),
  offered in a few widths, at Cloudinary's economy quality.
- Videos are cut to their first 20 seconds, with the sound removed, in two sizes.
  When a video slide is saved, the server asks Cloudinary to prepare both in the
  background (`prepareHeroVideo` in `src/server/lib/cloudinary.ts`); until they are
  ready, visitors see the still.
- Only the slide on screen is downloaded. The slideshow stops while the banner is
  scrolled out of view or the tab is hidden.
- With data saver on, a 2G-class connection, or "reduce motion", visitors get
  stills only and the slideshow does not advance by itself. (3G still gets video:
  the layers above cover the wait.)

Measured in a browser, with a detailed 2600 px photo (1.2 MB) and a 27 MB video as the
slides:

| Visitor | Fallback | Photo slide | Video slide |
|---|---|---|---|
| Phone | 9 KB | 94 KB | 862 KB, after a 12 KB still |
| Desktop | 15 KB | 198 KB | 1.3 MB, after a 14 KB still |

A phone with data saver on downloaded 21 KB for a banner that opens on the video: the
fallback and the still, and no video. Before these rules the banner sent the same two
files as 329 KB and 3.5 MB.

### The database connection

Hosted databases close idle connections, and this site is idle most of the time.
`src/server/lib/prisma.ts` therefore retries a query when the connection failed before
the query was sent (always safe), retries read-only queries when the connection died
part-way, and gives up on any single query after 20 seconds instead of hanging.

### Adding something new

- **A new field on an existing record:** add it to `prisma/schema.prisma`, run
  `npm run db:push`, add it to the Zod schema in the record's router, to its type in
  `src/types/index.ts`, and to its form.
- **A new kind of record:** add a model to the schema, a router in
  `src/server/routes/` (mount it in `src/server/app.ts`), a type, an entry in
  `src/lib/api.ts`, and a dashboard page. For a simple list, the dashboard page is a
  few lines using `CollectionManager` — see `src/app/(dashboard)/admin/leaders/page.tsx`.
- **A new site setting:** add it to `src/lib/site-settings.ts` and to the card in
  `src/app/(dashboard)/admin/settings/page.tsx`. No database change is needed.
- **A new role, or a change to what a role may do:** the role names are in
  `prisma/schema.prisma`; what each may do is decided by the `requireRole()` calls in
  `src/server/routes/`, the page guard in `src/proxy.ts`, and the menus in
  `src/components/dashboard/dashboard-layout.tsx`. Change all three together, and
  update the tables in this file and in STAFF-GUIDE.md.

When a dashboard screen changes, update [STAFF-GUIDE.md](STAFF-GUIDE.md) to match.
