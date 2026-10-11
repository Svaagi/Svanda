---
name: jira-ticket-planning
description: Plan the implementation of a Jira ticket in the SVANDA Web repo. Fetch it (plus its epic and siblings) from svanda.atlassian.net, reality-check it against the codebase, docs/prompt-plan.md and docs/design-reference.md, surface gaps or scope questions, then produce an implementation plan via Plan Mode. Use when the user asks to plan a ticket ("plan W3-2", "plan this ticket"). If no ticket is given, ask for one first.
argument-hint: "[ticket-key | W-label | description]"
---

# Jira Ticket Planning: SVANDA Web

Core habit: **a ticket's description is a hypothesis about the codebase, not ground truth.**
This repo's [`CLAUDE.md`](../../../CLAUDE.md) and
[`codingStandards.md`](../../../codingStandards.md) are the only authority for conventions.

## Step 1: Resolve the target ticket

- A key (`[A-Z]{2,}-\d+`) is used directly. The SVANDA Web project key is in the "Jira keys"
  table of [`docs/prompt-plan.md`](../../../docs/prompt-plan.md).
- A prompt-plan label (`W3-2`): JQL `project = <KEY> AND summary ~ "W3-2"`.
- Free text: search `project = <KEY> AND text ~ "<words>"` and confirm the best match.
- Nothing given: stop and ask.

## Step 1.5: Get on the ticket's branch first

1. `git status`; stash (`-u`) or commit anything in the way.
2. `git branch -a`; if a branch for this key exists, check it out.
3. Otherwise create `feat/<KEY>-<n>-short-kebab-description` **from the current HEAD** (that is
   what makes stacking work).

## Step 2: Jira connection

Run the repo-local `jira-connection-bootstrap` skill first. All calls go to
`svanda.atlassian.net` via `atlassian-svanda`. The chyron `atlassian` server is denied here;
never use the chyron cloudId. Never read or write project `SM` from this repo. If
`atlassian-svanda` isn't authorized, tell the user to run `/mcp` and log in as
`svagerko@svanda.fun`, then stop.

## Step 3: Fetch ticket, epic and siblings

1. `getJiraIssue`: `summary, description, status, issuetype, priority, parent, comment`.
2. The parent epic's summary and status.
3. Siblings: `parent = <EPIC> ORDER BY Rank ASC` (`summary, status`). Done siblings' work should
   be in the code; open siblings' work usually isn't.

Cross-check the ticket against its unit in `docs/prompt-plan.md` and surface any disagreement.

## Step 4: Reality-check against the codebase

- Grep for every component, hook, store, route, endpoint or config the ticket presumes.
- Read the design behaviour it ports in `design/reference/` using the line refs in
  [`docs/design-reference.md`](../../../docs/design-reference.md), including the "Known design
  bugs" section (fix those, don't port them).
- Check `git log --all --oneline` and branches for sibling work already landed.
- Read `CLAUDE.md` and `codingStandards.md` before designing anything.
- Reuse existing patterns (an existing primitive in `src/ui/`, an existing store slice, an
  existing i18n namespace) rather than inventing parallel ones.

## Step 5: Surface findings

State plainly what the ticket says versus what's true in the code, which presumed pieces don't
exist (and which sibling owns them), and any non-obvious design consequence.

## Step 6: Ask before assuming scope

For real ambiguity or unfinished dependencies, `AskUserQuestion` with concrete options and a
labelled recommendation. Prefer a plan covering exactly what's ready now with an explicit
extension point. Don't ask what you can check yourself.

## Step 7: Plan Mode

`EnterPlanMode`, explore, write the plan file, `ExitPlanMode`. The plan has:

- **Context:** why, what Steps 3 to 5 found, in/out of scope.
- **Approach:** one recommended design referencing real paths.
- **Critical files.**
- **Out of scope:** deferred items and the sibling that owns them.
- **Verification:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` where UI flows
  change, plus the specific specs this ticket adds.
- **Branch name** (from Step 1.5).

Never implement before approval. Re-check `git status` and `git branch --show-current` before
the first edit.

## Notes: this repo's conventions

- Components are `memo` / named `function`, props type named after the component, never
  `React.FC`, never a bare `Props`. Named exports only via `index.ts`; no `export default`
  (except where a tool requires it, such as React Router route modules and config files).
- Folders `camelCase`; `PascalCase` only for component files; `.tsx` only with JSX.
- Handlers `handleX`, props `onX`; `useState` pairs name the same thing.
- **SSR-safe modules:** routes are prerendered, so nothing touches `window` / `document` at
  module scope or during render; canvas, WebGL and storage access live in effects or
  client-only lazy components.
- **No raw colours outside `theme.css`; no static inline styles.**
- **i18n:** cs (default), en, sk. Every user-facing string, including `aria-label`, `alt` and
  meta, is a key present in all three catalogs.
- **Animation:** one rAF loop per scene, paused off-screen and in background tabs, reduced-motion
  path, three.js / R3F resources disposed.
- Tests co-located (`x.spec.ts` beside `x.ts`), query by `data-testid`.
- Comments only for a non-obvious why, one line, never a ticket key. Before finishing, grep
  changed files for `[A-Z]{2,}-\d+` inside comments and remove them.
- No em-dashes or en-dashes anywhere (copy, comments, commit messages).
