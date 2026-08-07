# Cafeish Website

Dark, minimal, editorial site for Cafeish — pop-ups & catering, St. Louis.
Plain HTML/CSS/JS — no build tools, no account, no setup. Open any `.html` file in a browser and it works.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home — hero, tagline, waitlist input, menu preview, founder quote |
| `menu.html` | Menu — filter pills (All/Drinks/Bakes/Food/Cakes), item grid |
| `about.html` | About — values, team grid |
| `journal.html` | Journal — featured post + grid |
| `waitlist.html` | Early access — perks + signup form |
| `order.html` | Order & contact — contact info + request form |
| `reviews.html` | Reviews — average rating + submit a review |
| `admin.html` | Password-gated: add/remove menu items, team photos, and site colors/font (not in nav — internal tool) |

## Editing content

Almost everything you'd want to change lives in **`js/data.js`**:
- `DEFAULT_MENU_ITEMS` — starter menu items (or add real ones via `/admin.html`)
- `TEAM_MEMBERS` — team photos/names/bios for the About page
- `JOURNAL_POSTS` — blog posts
- `CONTACT_INFO` — email/phone/Instagram shown on the Order page
- `DEFAULT_THEME` — Aisha's exact color palette + font (or change it via `/admin.html`)

Colors and fonts can also be edited directly in **`css/style.css`** under `:root` at the top of the file.

## How data saves (important to understand)

Menu items, team photos, reviews, and theme changes made through `/admin.html` save to
**your browser's local storage** — not a shared database. That means:
- They persist when you come back to the same browser later
- A different visitor, or you on a different device, won't see them

This is a deliberate choice to keep the site free and require zero setup for launch. If the
site takes off and you want changes visible to every visitor everywhere (e.g. a teammate adding
menu items from their own laptop and it showing up for customers), that's a well-defined
upgrade — connecting a database — for later, not something you need to worry about now.

## Admin access

Go to `/admin.html` (not linked in the nav). Default password is `cafeish2026` — change it in
`js/site-config.js` before sharing it with your team.

## Getting a live URL (free, no setup) — GitHub Pages

Once this is pushed to GitHub (see below), you can get a real `https://` URL for free in about
2 minutes:

1. On your repo on GitHub, go to **Settings → Pages**
2. Under "Source", choose **Deploy from a branch**, pick **`main`** and **`/ (root)`**
3. Click **Save**
4. Wait ~1 minute, refresh the page — GitHub gives you a URL like `https://your-username.github.io/cafeish-website/`

That's your live site. Share that link with Aisha. Any time you push new changes to `main`,
the live site updates automatically within a minute or two.

## Pushing to GitHub

If the repo doesn't exist yet:

```bash
cd cafeish-website
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/cafeish-website.git
git push -u origin main
```

If the repo already exists and you're adding this to it:

```bash
cd cafeish-website
git remote add origin https://github.com/YOUR-USERNAME/cafeish-website.git
git pull origin main --allow-unrelated-histories
git add .
git commit -m "Add Cafeish site"
git push -u origin main
```

Then invite your teammates as collaborators on GitHub (Settings → Collaborators), and have everyone
`git clone` the repo to get a local copy.

## Suggested team workflow from here

- Nobody commits directly to `main` — branch per task: `git checkout -b yourname/task-name`
- Open a Pull Request to merge into `main`, get one teammate to glance at it before merging
- Push work-in-progress branches daily so everyone can see what's in progress

## Still needed from Aisha

- Full menu list + prices (placeholder items are in `js/data.js` now — add real ones via `/admin.html`, or edit `DEFAULT_MENU_ITEMS` directly)
- Team photos + bios (placeholder team members are in `js/data.js` now)
- Final logo PNG — swap into the `.logo-mark` element in each page's `<nav>` (currently text placeholder)
- Real hero images/video frames for the filmstrip animation (`index.html`, look for the `frames` array in the `<script>` at the bottom)
