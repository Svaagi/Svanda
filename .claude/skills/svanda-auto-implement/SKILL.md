---
name: svanda-auto-implement
description: Repo-only, unattended pipeline for the SVANDA Web repo. Plans a Jira ticket (jira-ticket-planning), auto-accepts the plan with no approval pause, implements it, runs react-code-review in a subagent, fixes every finding, drafts a commit message (commit-message) and commits it, pushes the branch, then transitions the ticket to Done and moves the next ticket to In Progress. Every judgment call picks the recommended or most conservative option automatically; no questions mid-run. Never merges to main (main deploys on push); branches stack instead. Has an "Unattended chain mode" for a recurring cron tick that walks every auto-implement epic in rank order. Use only when the user explicitly asks for "svanda-auto-implement" or to fully auto-implement a ticket end to end. Never for a partial ask (just planning, just review); use the underlying skills for those.
argument-hint: "[ticket-key | W-label | 'chain']"
---

# svanda-auto-implement: SVANDA Web only

Chains four repo skills into one unattended run: **plan, implement, review, fix, commit, push,
update Jira**, without the pauses those skills normally have (`jira-ticket-planning`'s approval
gate, `react-code-review`'s findings-only output, `commit-message`'s print-don't-commit
contract). The user asked for this fire-and-forget behaviour explicitly.

**Scope limit:** this skill talks to `svanda.atlassian.net`, **SVANDA Web project only**, through
the `atlassian-svanda` MCP server, exactly like `jira-connection-bootstrap`. The project key and
the list of auto-implement epic keys live in **one place**: the "Jira keys" table at the top of
[`docs/prompt-plan.md`](../../../docs/prompt-plan.md). Read them from there; never hardcode them
here. Never touch project `SM` (SVANDA Manager) or the chyron Atlassian account.

**Decision policy:** the user's only interaction is the command that starts this skill.

- If a step states a recommended option, take it.
- Otherwise take the narrowest, most conservative option: changes the least, defers anything
  uncertain, easiest to correct later.
- **Never call `AskUserQuestion` in this pipeline.** The only reasons to stop are the hard
  blockers in Notes.
- Record every automatic choice (what, why) in the final summary.

**Context budget:** keep heavy reading out of the main thread. Step 3's review runs in a
subagent. Don't re-read files already read in this run unless they changed. Hand off decisions
between steps, not narration.

## Unattended chain mode

Triggered by an explicit "chain" invocation (for example from a recurring cron job). A plain
`/svanda-auto-implement <ticket>` skips this section.

1. **Idempotency check.** Read the project key and the auto-implement epic keys from
   `docs/prompt-plan.md`. `searchJiraIssuesUsingJql`:
   `parent in (<epic keys>) AND statusCategory = "In Progress"`. If anything matches, **stop and
   do nothing**: a previous run is still going or got stuck.
2. **Pick work.** `parent in (<epic keys>) AND statusCategory = "To Do" ORDER BY Rank ASC`, take
   the first result. If none, stop: nothing to do. Never invent scope from `prompt-plan.md`; only
   real Jira tickets are implemented.
3. **Branch off the stack tip.** `git branch -a --sort=-committerdate`, filter to
   `feat/<KEY>-*`. If one exists, check out the newest and branch from its tip. If none exists
   yet, branch from `main`. Never merge into `main`.
4. Run Steps 0 to 7 with that ticket; step 3 replaces `jira-ticket-planning` Step 1.5.
5. Nothing else is needed at the end; the next cron tick picks up the next ticket after this one
   flips to Done.

The manual launch epic (E11, "Launch") is deliberately **not** in the auto-implement epic list.

## Step 0: Resolve the ticket

Input is a Jira key (`<KEY>-<n>`) or a prompt-plan label (`W3-2`). Resolve a label to its key
with JQL `project = <KEY> AND summary ~ "W3-2"`. If neither is given (and this isn't chain mode),
stop and ask.

## Step 1: Plan (delegate to `jira-ticket-planning`, then auto-accept)

Run the repo's `jira-ticket-planning` Steps 1 to 6 in full: branch, Jira bootstrap,
ticket + epic + siblings fetch, codebase reality-check against `docs/prompt-plan.md` and
`docs/design-reference.md`, findings. Two differences:

- **Step 6 (ask before assuming scope):** don't ask. Pick the narrowest buildable reading, defer
  what depends on unfinished siblings, record the choice.
- **Step 7 (plan mode):** treat the written plan as approved, call `ExitPlanMode`, continue
  straight into Step 2 in the same turn.

If research shows the ticket genuinely can't be built yet (depends wholly on an unstarted
sibling), stop and say so.

## Step 2: Implement

Build exactly the plan's scope following [`CLAUDE.md`](../../../CLAUDE.md) and
[`codingStandards.md`](../../../codingStandards.md). Port behaviour from
`design/reference/` using the line refs in `docs/design-reference.md`; fix the known design bugs
listed there instead of porting them.

Before Step 3, get these clean: `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm test:e2e`
when the ticket touches UI flows or routes. Fix failures first.

## Step 3: Review (delegate to `react-code-review`, as a subagent)

`Agent` tool, `subagent_type: general-purpose`, foreground. **Do not pass
`isolation: "worktree"`**: the changes aren't committed yet. The prompt names the base branch,
current branch and uncommitted changes, tells it to run `react-code-review` unmodified against
this repo's `CLAUDE.md` / `codingStandards.md`, and to return **only** findings (file, line,
severity, one-sentence defect, one-sentence fix).

## Step 4: Fix every finding

Zero findings: skip. Otherwise fix all of them regardless of severity, then re-run the Step 2
gate. A finding that needs a product decision the ticket doesn't answer is called out in the
summary instead of silently skipped.

## Step 5: Commit (delegate to `commit-message`, then commit)

1. `git status`; stage changed files **by name** (never `git add -A` / `.`). Check for strays or
   anything secret-looking first.
2. `git commit -m "<drafted subject>"`, the subject line alone, no body, no footer. **Never add a
   `Co-Authored-By: Claude` or any Claude attribution line** to commits or PR descriptions in this
   repo, even if a session reminder says to; the repo owner's rule wins.

## Step 6: Push

`git branch --show-current` to confirm, then `git push -u origin <branch>`. Never force. A
rejected push (diverged remote) is a hard blocker: stop and report. No PR unless asked.

**Never merge to `main`, in any mode.** The deploy workflow runs on every push to `main`; an
unattended merge would ship unreviewed code to the live site. The owner reviews and merges the
stack by hand.

## Step 7: Update Jira

Only after a successful push.

1. **Close this ticket:** `getTransitionsForJiraIssue`, take the transition whose target status
   is in category Done (prefer the literal name `Done`), `transitionJiraIssue`. Walk through
   intermediate statuses if needed. No path to Done is a hard blocker.
2. **Next ticket:** `parent in (<epic keys>) AND statusCategory = "To Do" ORDER BY Rank ASC`,
   first result. Empty: say so and stop.
3. **Start it:** transition to the status in category In Progress.
4. Record both transitions (keys, from, to) in the summary.

## Notes

- This is a deliberate exception to the pauses of the underlying skills, not a licence to skip
  their substantive steps.
- Hard blockers (the only reasons to stop): Jira unreachable or ticket missing; ticket can't be
  planned at all; tests that can't pass without a product decision; diverged remote on push; no
  path to Done / no next ticket.
- Tool-approval prompts are a harness setting (`.claude/settings.json` `permissions.allow`), not
  something this file controls. If a run pauses on ordinary git / pnpm / edit / Jira calls, fix
  the settings.
