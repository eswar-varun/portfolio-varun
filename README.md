# eswarvarun.web.app

Personal site of **Eswar Varun S**, software engineer. Live at **https://eswarvarun.web.app**.

![Preview](public/og.png)

## What's interesting here

- **Live GitHub data.** Repositories, language breakdown and recent activity come straight from the public GitHub REST API, so the site updates itself as I ship. Responses are cached in `sessionStorage` (30 min TTL) to stay well inside the 60 requests/hour unauthenticated limit, the page renders fully if GitHub is unreachable, and one in-flight request is shared by every component.
- **Content is data.** Every word on the page lives in [`src/data/profile.ts`](src/data/profile.ts); components only render it. Adding a project is one object.
- **Command menu.** Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> for keyboard navigation, copy-email and theme switching.
- **Small and fast.** No UI framework or CSS library: about 57 KB of gzipped JS, one stylesheet, system-aware light/dark theme with no flash on load, and motion that respects `prefers-reduced-motion`.
- **Accessible.** Semantic landmarks, skip link, visible focus states, ARIA on the dialog and live regions.

## Stack

React 18 · TypeScript · Vite · plain CSS (design tokens, no framework) · Firebase Hosting

## Run locally

```bash
npm install
npm run dev
```

## Deploy

```bash
firebase login
firebase use --add      # pick the Firebase project that serves eswarvarun.web.app
npm run deploy          # type-check, build, deploy to Firebase Hosting
```

## Project structure

```
src/
  data/profile.ts        all site content
  lib/github.ts          GitHub API client, caching, event formatting
  lib/theme.ts           light/dark theme with persistence
  components/            one file per section, plus the command palette
public/                  favicon, social preview image, resume.pdf
```
