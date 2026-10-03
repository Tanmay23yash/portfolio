# Yash Raghuvanshi · Portfolio

A personal portfolio built with React, Vite, Three.js (react-three-fiber) and GSAP.

- **Intro**: a "Hello!" that drops in letter by letter, once per browser session (skippable, and skipped automatically for people who prefer reduced motion).
- **Hero**: a rotating headline next to an interactive 3D desk diorama built entirely from code (drag to look around, click the lamp).
- **Work**: project cards with screenshots, highlights, tech tags and links.
- **Experience**: a timeline that fills in as you scroll, followed by certifications and achievements.
- **Skills**: scrolling rows of tools and technologies.
- **Contact**: a form next to a 3D retro computer that greets visitors by the name they type.
- **Music**: the equaliser button in the navbar plays a generative lo-fi loop made with the Web Audio API (no audio files).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Make it yours

Almost everything you'll want to change is in **`src/data/content.js`**: name, role, intro line, hero words, stats, projects, experience, certifications, skills, social links and the contact form.

**Project images or videos**: drop files into `public/projects/` and reference them from a project:

```js
{ title: "...", image: "/projects/my-app.webp" }   // or video: "/projects/my-app.mp4"
```

Projects without media get a generated cover in their `accent` colour. With exactly two projects they sit side by side; with three or more, the first is featured and the rest stack beside it or go into a "More projects" list.

**Company logos**: put them in `public/logos/` and set `logo: "/logos/acme.svg"` on an experience entry. Without one, the company's initials are shown.

**Résumé**: the hero links to `public/resume.pdf`. Replace that file to update it, or set `resumeUrl: ""` to hide the link.

**Colours and fonts**: the design tokens are at the top of `src/styles/index.css`. The 3D scene's palette is the `C` object at the top of `src/components/three/HeroScene.jsx`.

## Contact form backend

Messages are sent by a serverless function, [`api/contact.js`](api/contact.js), which emails each submission to you with **Reply-To set to the visitor**, so you can answer straight from your inbox. It also:

- validates name, email and message on the server (the browser checks them too);
- drops bot submissions quietly (a hidden "honeypot" field, plus a minimum time to fill the form);
- rate-limits each IP to 5 messages per 10 minutes;
- times out after 30 seconds instead of hanging. If sending fails for any reason, the visitor keeps their text and gets a pre-filled "Email me directly" link.

### 1. Create a Gmail App Password

1. Turn on 2-Step Verification for the Google account: <https://myaccount.google.com/signinoptions/twosv>
2. Create an App Password (name it "Portfolio"): <https://myaccount.google.com/apppasswords>
3. Copy the 16-character password. It's only shown once.

Any other SMTP provider works too (Resend, Brevo, Zoho…): set `SMTP_HOST` and `SMTP_PORT` as well. See [`.env.example`](.env.example).

### 2. Test it locally

```bash
cp .env.example .env.local   # then fill in SMTP_PASS
npm run dev
```

`npm run dev` and `npm run preview` serve `/api/contact` locally with the same code Vercel runs. `.env.local` is git-ignored, so never commit the password.

### 3. Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `SMTP_USER` | yes | | Sending account, e.g. your Gmail address |
| `SMTP_PASS` | yes | | Its App Password |
| `SMTP_HOST` | no | `smtp.gmail.com` | Other SMTP providers |
| `SMTP_PORT` | no | `465` | `465` (TLS) or `587` (STARTTLS) |
| `CONTACT_TO` | no | `SMTP_USER` | Where messages are delivered |
| `CONTACT_FROM` | no | `SMTP_USER` | The "From" address |
| `SITE_URL` | no | auto on Vercel | Public URL for link previews and the sitemap |

Without `SMTP_USER`/`SMTP_PASS` the form still works for visitors. It tells them it can't send and offers the email link instead.

## Deploy (Vercel)

Vercel runs both the static site and the `api/` function, with no extra config.

1. Push this folder to a GitHub repository.
2. On <https://vercel.com/new>, import the repo. Vercel detects Vite automatically (build `npm run build`, output `dist`).
3. Before deploying, open **Environment Variables** and add `SMTP_USER` and `SMTP_PASS` (and any optional ones).
4. Deploy, then send yourself a test message from the live site.

If you change environment variables later, redeploy for them to take effect. The production URL is detected automatically for link previews, robots.txt and sitemap.xml. If you add a custom domain, set `SITE_URL` to it.

Other static hosts (Netlify, GitHub Pages) can serve the site, but they won't run `api/contact.js`. Either port the function, or set `contact.formEndpoint` to a [Formspree](https://formspree.io) URL.

## Project structure

```
api/
  contact.js               ← contact-form email function (Vercel Function)
public/                    ← résumé, project screenshots, og.png, 404.html
src/
  data/content.js          ← all the text and links
  components/              ← page sections (Hero, Work, Experience, …)
  components/three/        ← the two 3D scenes + shared helpers
  hooks/                   ← scroll reveal, in-view detection, generative music
  styles/index.css         ← design tokens and all styles
```
