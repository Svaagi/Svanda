---
name: commit-message
description: Draft a Conventional Commits-formatted commit message for the current uncommitted changes (staged, or unstaged if nothing's staged) by analyzing the actual diff. Prints the message as text for the user to copy and paste themselves — never runs `git commit`. Optionally enriches with the Jira ticket referenced in the branch name; skip Jira entirely if asked. Use when the user asks for a commit message, "what should I commit this as", or "write me a commit message".
---

# commit-message

Draft one or more Conventional Commits messages for the user's current uncommitted work. You
**never** run `git commit`, `git add`, or any other mutating git command — this skill only
produces text for the user to paste themselves, exactly as they asked.

## Step 1 — Get the right diff

1. `git status --porcelain` to see the full picture (staged, unstaged, untracked).
2. If anything is staged, diff **only the staged changes** (`git diff --staged`) — that's what
   would actually be committed. If nothing is staged, diff the unstaged working tree
   (`git diff`) instead, and say so ("nothing staged, drafting from your unstaged changes").
3. Untracked new files don't show content in `git diff` — read them directly to understand what
   they add.
4. If the user explicitly asks for a message for "the whole branch" (e.g. drafting a squash
   commit), diff `<base>...HEAD` instead of the working tree.
5. If the working tree is clean (nothing staged, nothing unstaged, nothing untracked), fall back
   automatically to the whole branch's diff (`<base>...HEAD`) instead — the user has likely
   already committed their work and wants a message reflecting what's on the branch. Only report
   "nothing to base a message on" if the branch also has no commits ahead of its base.

## Step 2 — Run the linter

This step is **mandatory, not optional** — always actually run a lint command before drafting
the message. Never assume or claim "no lint script found" without having checked; a repo
without a root `eslint.config.js`/`.eslintrc*` can still lint fine through an Nx project target
(`@nx/eslint:lint`) or a per-app config, so absence at the root proves nothing on its own.

1. Check `package.json` `scripts.lint` first. If present, that's the command to run (e.g.
   `npm run lint` / `yarn lint` / `nx run-many -t lint`) — it's usually already scoped or
   delegates to the right per-project tooling.
2. If there's no root lint script, look for an Nx (or similar monorepo tool) project target
   named `lint` for the project(s) the changed files belong to — e.g. read the relevant
   `project.json`/`nx.json` and run `npx nx lint <project>`. Don't stop at "there's no bare
   `eslint.config.js` at the repo root" and conclude linting isn't set up; a bare `npx eslint
   <files>` can fail with a missing-config error even when the *project's own* lint target
   works fine (Nx/Vite-style setups often resolve config through the executor, not flat-config
   discovery) — treat that as a sign to find the project-scoped command, not as "no linting
   here."
3. Run it scoped to the changed files/projects when the tooling supports that, otherwise run the
   project-wide lint script.
4. Don't fix lint failures yourself and don't block drafting the message on them — this skill
   only produces commit-message text. Just surface any failures to the user in one short line
   before the commit message block(s) so they can decide whether to fix before committing.
5. Only skip this step silently if you've actually confirmed — by checking `package.json` and
   any Nx/monorepo project config for the changed files — that there is no lint script or lint
   target anywhere applicable. "I didn't find a config at the root" is not that confirmation.

## Step 3 — Learn this project's own commit convention

Run `git log -20 --oneline` (on the current branch and/or base branch) and look at how *this
project* actually writes its commits — don't assume a convention from another project. Things to
detect from real history:
- Does it put a Jira/ticket key in the type's scope position, e.g. `feat(WIC-90): …`? Or a plain
  word scope, e.g. `feat(layer-panel): …`? Or no scope at all?
- Capitalization/tense habits in the description
- Whether footers/bodies are commonly used here

Match whatever the project is actually doing. Only fall back to plain Conventional Commits 1.0.0
defaults (word scope, lowercase imperative description) if there's no established pattern yet.

## Step 4 — Ticket context

The diff is always the primary source for *what* the message says. Ticket context only supplies
the scope/reference and, optionally, sharper wording — it never overrides what the diff shows.

1. Always parse the current branch name for a ticket key pattern (e.g. `[A-Z]{2,}-\d+`, matching
   `WIC-170`-style branch names like `feat/WIC-170-EditActionbar`). If found and Step 2 showed
   this project uses ticket keys as the commit scope, use that key as the scope regardless of
   whether Jira is reachable — this is the baseline, not a Jira-dependent fallback.
2. If the user has said "no jira" / "skip jira" / similar, stop here — use the branch-name ticket
   key (if any) as-is and move straight to Step 5.
3. Otherwise, you may additionally look up the ticket (Atlassian MCP tools, or the
   `jira-connection-bootstrap` pattern if you need to resolve the cloud id first) purely to sharpen
   the description's wording against the ticket's real title/summary. If the connection isn't
   authorized or the lookup fails, silently continue with just the branch-name ticket key from
   step 1 and the diff — don't surface auth errors unless the user specifically asked for the Jira
   lookup and it failed.

## Step 5 — Classify the change

- **Always draft exactly one commit message**, even when the diff mixes several concerns (e.g. a
  real feature plus an incidental formatting sweep of an unrelated file, or two tickets sharing a
  branch). This user always commits as a single commit — never split into multiple messages,
  regardless of how many distinct concerns the diff touches.
- **Type**: pick the single Conventional Commits type (`feat`, `fix`, `refactor`, `docs`, `style`,
  `test`, `chore`, `build`, `ci`, `perf`, …) that best matches the *dominant* intent of the diff.
  When concerns are unrelated, pick the type for the larger/primary concern and let the
  description cover the whole; don't invent a type that fits nothing.
- **Scope**: a short noun for the affected area, following whatever Step 2 found this project
  actually does (ticket key, feature folder name, or omitted). If the branch name carries more
  than one ticket key (e.g. `feat/AXIS-7705-7706-Foo`), join them in the scope in the same order
  the branch uses (e.g. `(AXIS-7705-7706)`) rather than picking just one or splitting commits.
- **Breaking change**: does the diff remove/rename something other code or consumers depend on
  (a public export, a function signature, a route, a config key)? If yes, use `!` after the
  type/scope and/or a `BREAKING CHANGE:` footer per the spec.

## Step 6 — Write it

**The output is a single subject line and nothing else.** Format:

```
<type>[(scope)][!]: <imperative, lowercase, no trailing period>
```

Keep it short (aim ≤72 chars) and specific — not "update layer panel" but what actually changed
and why it's a `feat`/`fix`/`refactor`. One line has to carry the whole diff, so choose the
description for the dominant change and let it stand for the rest; do **not** reach for a body to
cover the other concerns.

**Never write a body.** Not a bulleted body, not a one-paragraph body, not a "just this once
because the diff is big" body. This user has repeatedly rejected multi-line commit messages — a
body is a defect in the output, not extra helpfulness. The subject line is the deliverable.

The only permitted content below the subject line is a footer that is **structurally required**:
- a `BREAKING CHANGE: <description>` footer when Step 5 identified a breaking change, or
- a ticket/co-author footer **only if Step 3 found this project's own history consistently uses one**.

If you catch yourself writing prose to explain rationale, tradeoffs, what else changed, or "why"
— stop and delete it. That belongs in the PR description or the chat reply, never the commit
message. When unsure whether something is a required footer or just explanation, it's explanation
— leave it out.

## Step 7 — Output

Output **only** the drafted subject line — no restated diff summary, no explanation of your
reasoning, no "here's what I found" preamble. Print it in a single fenced code block, ready to
copy-paste. The code block should contain one line (plus a required footer only in the rare cases
Step 6 allows). The only prose allowed outside the code block is a short line when it changes what
the user should do next — e.g. noting you fell back to the whole-branch diff (Step 1.5), or
flagging lint failures from Step 2. Do not call `git commit` yourself.
