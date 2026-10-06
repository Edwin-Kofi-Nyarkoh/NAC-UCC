# NAC UCC Website — Staff Guide

How to run the website day to day: who can sign in, what each account can do, and
how to do it. No technical knowledge is needed. If you maintain the code, see
[README.md](README.md) instead.

> **Private.** This guide and the website's dashboard are for the NAC UCC web team
> only. Please do not share this document outside the team.

## Contents
1. [The idea in one minute](#the-idea-in-one-minute)
2. [Accounts](#accounts)
3. [Signing in and out](#signing-in-and-out)
4. [Adding photos and videos](#adding-photos-and-videos)
5. [Putting a picture on the home page](#putting-a-picture-on-the-home-page)
6. [News, events and sermons](#news-events-and-sermons)
7. [Health news](#health-news)
8. [The rest of the site (admin)](#the-rest-of-the-site-admin)
9. [Things visitors send in (admin)](#things-visitors-send-in-admin)
10. [Managing accounts (admin)](#managing-accounts-admin)
11. [When something goes wrong](#when-something-goes-wrong)

---

## The idea in one minute

Everything visitors see that is specific to our congregation — news, events,
sermons, photos, service times, contact details, leaders — is typed in by staff
through the **dashboard**. Nothing is made up for us.

Two things follow from that:

- **A part of the site with nothing in it stays hidden.** No leaders added yet?
  The "Meet Our Leaders" section simply isn't shown. Add one and it appears.
- **Changes show up straight away.** Publish a post and it is on the site the
  moment you press the button.

The admin's dashboard home page has a **Site content** checklist showing which
parts of the site still have nothing in them.

---

## Accounts

There is no "create an account" page. An **admin** creates every account and gives
the person their email and password.

There are three kinds of account. The kind decides what you see when you sign in.

| | Admin | Church Editor | Medical Minister |
|---|:---:|:---:|:---:|
| Dashboard address | `/admin` | `/editor` | `/medical` |
| News posts | ✓ | ✓ | |
| Events | ✓ | ✓ | |
| Sermons | ✓ | ✓ | |
| Health news (medical posts) | ✓ | | ✓ |
| Remove comments on sermons | ✓ | | |
| Home page banner, leaders, ministries, gallery | ✓ | | |
| Site settings (service times, contact details, About page, bank details) | ✓ | | |
| Read contact messages | ✓ | | |
| Run nominations | ✓ | | |
| Create and manage accounts | ✓ | | |

- **Admin** — can do everything. Give this to as few people as possible, but to
  at least two, so one can help the other if they are locked out.
- **Church Editor** — writes and publishes news, events and sermons. Editors can
  edit and delete each other's work, not only their own.
- **Medical Minister** — writes and publishes health news for the Medical Ministry
  pages, and nothing else.

"✓" means create, edit, publish, unpublish and delete.

### The accounts that exist today

| Email | Kind | Name shown |
|---|---|---|
| `admin@nacucc.org` | Admin | System Admin |
| `editor@nacucc.org` | Church Editor | Church Editor |
| `medical@nacucc.org` | Medical Minister | Medical Minister |

These three were created when the site was first set up, with starter passwords.
**Change all three passwords before the site goes public** (see
[Managing accounts](#managing-accounts-admin)). It is better still to give each
real person their own account, so you can tell who wrote what.

Passwords are never written down in this guide or anywhere in the project.

### What visitors can do without an account

Read everything that is published, search, comment on a sermon, send a message
through the Contact page, give online, and — while nominations are open — nominate
leaders.

---

## Signing in and out

1. Go to the website's address followed by `/login`.
2. Enter your email and password and press **Sign In**. You land on your dashboard.
3. On a phone, the menu is behind the **☰** button at the top left.
4. **Sign Out** is at the bottom of the menu.
5. **View site ↗** (top right) opens the public website in a new tab.

You stay signed in for **8 hours**. After that you are returned to the sign-in
page; just sign in again. Nothing you had already saved is lost.

Forgot your password? Ask an admin to reset it. Church Editors and the Medical
Minister cannot change their own password; an admin does it for them.

---

## Adding photos and videos

Wherever the dashboard asks for a photo or video, you get the same two choices.

**Upload it.** Press **Upload a photo** (or **Upload a photo or video**), choose
the file from your phone or computer, and wait for the small preview to appear.
The button shows how far the upload has got. A photo can be up to 10 MB and a
video up to 100 MB.

**Or use one that is already online.** Our photos and videos are stored with a
service called Cloudinary. If the file is already there:

1. Open the file in Cloudinary's Media Library and copy its **Public ID**
   (for example `nac-ucc/harvest-2025`).
2. Paste it into the box that says **…or paste a Cloudinary ID**.
3. If the box has an **Image / Video** choice beside it, pick the right one.
4. Press **Use**. A preview appears if the ID is right; you get a message if it
   isn't.

To take a photo off again, press the bin beside its preview.

Tips:
- Use the original photo. The site makes the smaller sizes it needs by itself,
  so visitors never download the full-size file.
- Large videos take a while to upload. Leave the page open until the preview shows.
- If a video is over 100 MB, trim it to a shorter clip or export it at a lower
  quality first.

---

## Putting a picture on the home page

Pictures reach the home page in three ways. The banner is for admins only; the
other two happen by themselves whenever a post or sermon with a photo is published.

### 1. The banner at the top — admin

The banner is the large area behind the welcome at the top of the home page. You
build it under **Home Page Banner** in the menu, from two things.

**The fallback picture.** One still photo. Visitors see it the instant the page
opens, softly out of focus, while the first slide is still downloading — so the
banner is never an empty box, however slow the connection. If you add no slides
at all, the fallback picture is the banner, shown sharp.

- To set it: under **Fallback picture**, upload a photo (or paste its Cloudinary
  ID and press **Use**). It is saved straight away.
- To change it: press the bin beside it, then add another.
- Choose a wide (landscape) photo of the congregation or the chapel.

**The slides.** Photos and videos that play over the fallback picture, one after
another.

1. Press **Add slide**.
2. Add the **Photo or video**.
3. Optionally type a **Headline** (the large text) and a **Supporting line**. A
   slide with no headline shows the standard welcome, so you can add a slide that
   is only a background.
4. Optionally add a button: **Button text** (for example *Join Us This Sunday*)
   and **Button link** — a page on our own site, starting with `/`, such as
   `/events` or `/about`.
5. Press **Save**. Open the home page: the slide is there.

Then, in the list:
- **The numbers show the order.** Number 1 opens the page. Use **↑ ↓** to move a
  slide up or down.
- The pencil edits a slide — its words, or its photo or video. The bin deletes it.

How the slides behave:
- A photo stays up for 6 seconds. A video plays through, then the next slide
  follows. With a single video slide, it loops.
- Videos play **without sound**, and only **the first 20 seconds** are used. Keep
  clips short; anything after 20 seconds is never shown.
- Visitors can pause the slideshow, and move through it with the arrows.
- A wide (landscape) photo or video works best. On phones the site crops it to an
  upright shape, keeping the middle, so keep what matters near the centre. The
  words sit over the lower left.

**Why this does not use up visitors' data.** The banner is built to be light:

- The fallback picture is sent as a tiny file (about 10 KB).
- Each photo is sent at the size of the visitor's screen — roughly 90 KB on a
  phone, instead of the multi-megabyte original.
- A video is sent as a small, silent, 20-second version — under 1 MB on a phone.
- Only the slide on screen is downloaded. Later slides are fetched when it is
  their turn, and not at all if the visitor has scrolled past the banner.
- Visitors who have switched on **data saver** on their phone, or who are on a
  very slow (2G) connection, get a still picture instead of each video, and the
  slideshow does not move on by itself.

### 2. The newest news post

The "Latest from NAC UCC" section shows the three newest posts. The newest one is
shown large **with its photo** — the first photo attached to that post.

### 3. The newest sermon

The "Latest Sermons" section shows the three newest sermons. The newest one is
shown large **over its photo**, if it has one.

Events on the home page are shown without pictures.

---

## News, events and sermons

*Admins and Church Editors.* All three work the same way.

### Writing something new

1. Choose **Posts & News**, **Events** or **Sermons** in the menu.
2. Press **New Post** / **New Event** / **New Sermon**.
3. Fill in the form (details below).
4. Press **Publish** to put it on the site now, or **Save Draft** to keep it
   hidden while you work on it.

Text is shown exactly as you type it. Leave an empty line between paragraphs.
Bold, links and other formatting are not available.

### Changing, hiding or deleting

In the list:
- The **pencil** opens it for editing. Press **Publish** to save your changes
  (or **Save Draft** to save them and take it off the site).
- Click the green **Published** label to hide it from the site at once. Click
  **Draft** to publish it.
- The **bin** deletes it for good. There is no undo.
- The search box filters the list by title.

### What each form asks for

**Posts** — shown on the News page, the home page and in search.
- **Title**
- **Summary** — one or two sentences shown in lists.
- **Content** — the article.
- **Category** — News, Announcement, Testimony, Devotional or General.
- **Photos & videos** — up to three. The first *photo* is the one shown in lists
  and on the home page.

**Events** — shown on the Events page, the home page and in search.
- **Title** and **Description**
- **Category** — service, fellowship, outreach, youth or other.
- **Photo** — one, shown on the event's own page.
- **Date** (required), **Time** and **Location**.

The Events page sorts itself: events dated today or later appear under *Upcoming
Events*, soonest first; older ones move to *Past Events* on their own. The home
page shows the next four (or, when nothing is coming up, the four most recent).

**Sermons** — shown on the Sermons page, the home page and in search.
- **Title** and **Description**
- **Photo** — shown on the sermon's card, and as the cover of its video.
- **Preacher** (required), **Scripture reference**, **Sermon date** (required)
  and **Duration**.
- **Video (Cloudinary ID)** — to add the recording, upload the video to
  Cloudinary first, then paste its Public ID here.

Visitors can leave comments under a sermon. Comments appear immediately; an admin
can remove them (see [Comments](#comments-on-sermons)).

---

## Health news

*Admins and the Medical Minister.*

Choose **Medical Posts**, then **New Post**. The form is the same as a news post.

- The Medical Minister chooses between two categories: **Emergency** and
  **General**. Admins also have Health tip, Update, News and Screening.
- **Emergency** posts are treated differently: they appear in a red *Emergency
  Health Alert* bar at the top of the Medical Ministry page and are marked red in
  the health news list. Use it only for real alerts, and change the category or
  unpublish the post when the alert is over.

Health news is shown on the Medical Ministry page, the Health News & Alerts page
and in search.

---

## The rest of the site (admin)

### Leaders
**Leaders → Add leader.** Name, Role, and optionally a Photo and a Short bio.
They appear on the About page under *Meet Our Leaders*, in the order shown in the
list (use **↑ ↓** to change it). Without a photo, a leader is shown by their
initials.

### Ministries
**Ministries → Add ministry.** Name and Description, and optionally a Photo,
Leader, Meeting day and Meeting time.

Each ministry gets a card on the Ministries page, a page of its own, and an entry
under **Ministries** in the site's top menu. Renaming a ministry later does not
change its page address, so links people have saved keep working.

### Gallery
**Gallery → Add photo.** The photo or video, and optionally a Caption and a
Category (for example *Services*, *Outreach*, *Youth*).

The newest are shown first. Once photos have more than one category, visitors get
buttons to filter by category. Clicking a photo opens it full-screen.

### Site Settings
**Site Settings** has five cards. Each has its own **Save** button — press it
after changing that card, and wait for **Saved**. Anything left blank is simply
left off the site.

| Card | What to enter | Where it shows |
|---|---|---|
| **Service Times** | One row per service: name, day, time, optional note | Home page ("Join Us for Worship") and the foot of every page |
| **Contact Details** | Address, phone, email, office hours; map latitude and longitude | Contact page and the foot of every page |
| **Social Media** | Full links (starting `https://`) to our Facebook, YouTube, Instagram and Twitter/X pages | An icon for each one filled in, on the Contact page and the foot of every page |
| **About Page** | Our history, vision and mission; a timeline of year + what happened | About page |
| **Bank Details** | Bank name, account name, account number, branch — all four, or none | Give page |

To show a **map** on the Contact page, fill in both latitude and longitude. To
find them: in Google Maps, right-click the church's location and click the two
numbers at the top of the menu to copy them. The first is the latitude.

---

## Things visitors send in (admin)

### Contact messages
**Contact Messages** is the inbox for the form on the Contact page. New messages
are marked with a dot.

- **Reply by email** opens your email program with the sender's address filled in.
- **Mark as read** clears the dot.
- **Delete** removes the message for good.

The website does not send you an email when a message arrives. Check the inbox.

### Comments on sermons
**Comments** lists every comment on every sermon, newest first, with a link to the
sermon. The bin deletes a comment. Comments are not held for approval: they are
public as soon as they are posted, so look in regularly.

### Nominations
Used when the congregation nominates student leaders.

1. **Nominations → Add Position** for each role (President, Secretary, …).
2. Share the address of the nominations page: the site address followed by
   `/nominations`. It is not in the site's menu. **View Public Form ↗** opens it.
3. Members enter their name and student index number, then name one person for
   each position. Each index number can nominate once per position.
4. The **Results** tab shows, for each position, how many nominations each person
   received and who nominated them. Click a position to open it.
5. To stop taking nominations for a position, switch it off with the toggle beside
   it. When every position is off, the public page says nominations are not open.

Deleting a position deletes its nominations too.

### Gifts
Online gifts are paid through Paystack. They are **not** listed in this dashboard:
see them, and the donors' details, in the church's Paystack account.

---

## Managing accounts (admin)

Everything is under **User Management**.

**Create an account.** **New User** → full name, email, a password of at least 8
characters, and the kind of account. Tell the person their email and password
yourself; the website does not email them.

**Change what someone can do.** Use the dropdown in the **Role** column.

**Suspend someone.** Click **Active** in the **Access** column; it changes to
**Suspended**. They are signed out immediately and cannot sign back in. Click
again to restore them. Their posts stay on the site.

**Verified / Pending.** An account marked **Pending** cannot sign in. Accounts you
create are verified automatically, so you will rarely need this.

**Reset a password.** Click the key, type a new password, and tell the person.
You can reset your own this way too.

**Delete an account.** Click the bin. An account that has written posts, events
or sermons cannot be deleted, because its work would lose its author — suspend
it instead.

Two safeguards:
- You cannot change your own role, suspend yourself or delete yourself. Another
  admin has to. This stops an admin locking themselves out by a slip of the hand.
- Because of that, there is always at least one working admin account.

When someone leaves the team, suspend their account the same day.

---

## When something goes wrong

**"I was sent back to the sign-in page."**
Your 8 hours ran out, or an admin suspended the account. Sign in again; if it
says *Invalid credentials* and you are sure of the password, ask an admin.

**"My post isn't on the website."**
It is probably still a draft. Find it in the list and click **Draft** to publish.

**"A whole section of the site is missing."**
That section has no content yet. Admins: the *Site content* checklist on your
dashboard home page shows what is missing and where to add it.

**"Uploading a photo or video fails."**
The message says why. Too large: photos can be up to 10 MB, videos up to 100 MB.
If it mentions Cloudinary's settings, tell whoever maintains the code (the README
explains the fix), and meanwhile use the "paste a Cloudinary ID" route. Otherwise
check your connection and try again; large videos can take several minutes.

**"I pressed Use and it says it could not reach Cloudinary."**
The site could not get through to the photo service to check the ID. Nothing is
wrong with the ID itself, and nothing was changed. Check your internet connection
and press **Use** again.

**"I added a video to the banner but visitors see a still picture."**
Three possible reasons, all normal. The video is still being prepared: this takes
a minute or two after you save, longer for big files. The visitor has data saver
on, or is on a very slow connection. Or their phone is in low-power mode, which
stops videos playing by themselves. On an ordinary slow connection the video does
play, but only once enough of it has arrived; the fallback picture and then the
still are shown while it loads.

**"It says a field 'must be at least … characters'."**
The message names the field. Titles need at least 3 characters and article text
at least 10.

**"I deleted something by mistake."**
Deleting is permanent. It has to be typed in again.

**"Every admin is locked out."**
Whoever maintains the code can create a new admin or reset a password from the
server. The README explains how.
