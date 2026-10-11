# eswarvarun.web.app

Personal site of **Eswar Varun S**, software engineer. Live at **https://eswarvarun.web.app**.

![Preview](public/og.png)

The site is a code editor: an explorer with my projects as Markdown files, `experience.ts`, `skills.json`, a live `github.log`, tabs, and a terminal that takes commands (`help`, `ls`, `open <file>`, `resume`, `email`).

## How it works

- **Content is data.** Everything on the site lives in [`src/data/profile.ts`](src/data/profile.ts). Files in the editor are rendered from it, so adding a project is one object.
- **No syntax highlighter.** Each "file" is written as JSX lines built from small token components ([`src/editor/syntax.tsx`](src/editor/syntax.tsx)). Line numbers come from a CSS counter, and wrapped lines keep a hanging indent.
- **Live GitHub data.** `github.log` reads repos, languages and recent activity from the public GitHub REST API. Responses are cached in `sessionStorage` for 30 minutes to stay under the 60 requests/hour unauthenticated limit, one in-flight request is shared across the page, and the file shows a fallback if GitHub is unreachable.
- **Deep links.** The open file is kept in the URL hash, so `/#projects/dependency-tracker.md` opens that project directly.
- **Keyboard first.** <kbd>Ctrl</kbd>+<kbd>P</kbd> quick open, <kbd>Ctrl</kbd>+<kbd>`</kbd> terminal, <kbd>Ctrl</kbd>+<kbd>B</kbd> explorer; the terminal has history and Tab completion.
- **Works on phones.** The explorer becomes a drawer and the terminal opens on demand.

## Stack

React 18 · TypeScript · Vite · plain CSS · Firebase Hosting. About 57 KB of gzipped JS, no UI libraries.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy   # type-check, build, firebase deploy --only hosting
```

## Structure

```
src/
  data/profile.ts     all site content
  editor/IdeApp.tsx   layout: title bar, explorer, tabs, panel, status bar
  editor/files.tsx    the files shown in the editor
  editor/syntax.tsx   token and line components
  editor/Terminal.tsx terminal commands, history, completion
  lib/github.ts       GitHub API client with caching
public/               favicon, social preview image, resume.pdf
```
