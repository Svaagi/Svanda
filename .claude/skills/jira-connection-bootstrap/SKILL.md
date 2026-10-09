---
name: jira-connection-bootstrap
description: "Reusable Jira MCP preflight for the SVANDA Web repo. Validates Atlassian MCP access against the personal svanda.atlassian.net site, resolves and confirms cloudId, scopes queries to the SVANDA Web space, and provides standardized failure guidance for Jira skills."
argument-hint: "Optional: expected cloudId override"
---

# Jira Connection Bootstrap: SVANDA Web

**Repo-scoped override.** This repo uses the same personal Atlassian site as SVANDA Manager,
in a different space. Every Jira skill invoked inside this repo must use the connection
described here and **must never** fall back to the chyron cloudId
`5698a14d-0ba2-48ab-a78e-6c1f354067bc`: that is a different company's tracker.

The global chyron `atlassian` MCP server is **hard-blocked in this repo** by
`permissions.deny: ["mcp__atlassian"]` in `.claude/settings.json`. If a chyron
`mcp__atlassian__*` tool ever succeeds here, that deny rule has been removed and must be
restored.

## Standard Context

- site: https://svanda.atlassian.net
- account: svagerko@svanda.fun
- space / project: **SVANDA Web**. The project key and epic keys are recorded in the
  "Jira keys" table of `docs/prompt-plan.md` (single source). If it still says `TBD`, resolve
  the key with `getVisibleJiraProjects` (match the name "SVANDA Web"), confirm with the user,
  and write it into that table.
- **Not** project `SM`: that is SVANDA Manager. Never create or edit SVANDA Web tickets there.
- cloudId: pass the hostname `svanda.atlassian.net` as `cloudId` on every call. Resolve the
  UUID via `getAccessibleAtlassianResources` only if a hostname call is rejected.
- MCP server: **`atlassian-svanda`** (this repo's `.mcp.json`).

## Workflow

Refer to Atlassian MCP tools by base name; the runtime prefix varies by client.

### Step 1: Verify MCP reachability

Call `getAccessibleAtlassianResources`. If it fails or returns nothing, stop and tell the
user: "The `atlassian-svanda` MCP server isn't authorized yet. Run `/mcp`, pick
`atlassian-svanda`, and log in as **svagerko@svanda.fun**. Then retry."

### Step 2: Resolve cloudId

- Use the resource whose `url` is `https://svanda.atlassian.net`.
- If only `chyron.atlassian.net` is returned, **stop**: the wrong account is connected. Do not
  query the chyron cloudId.
- If neither site is present, list what was returned and ask the user to fix the connection.

### Step 3: Resolve the project key (until it is filled in above)

Call `getVisibleJiraProjects` on the svanda cloudId, pick the project named "SVANDA Web",
confirm the key with the user.

### Step 4: Query guardrails

- svanda cloudId on every call; default `project = <SVANDA Web key>` scoping.
- Pagination: `maxResults: 100`; follow `nextPageToken` until none is returned.

### Step 5: Failure message contract

Report the failing call, say whether a wrong-account / cloudId mismatch is suspected, and ask
whether to list visible projects on `svanda.atlassian.net` next.

## Reuse Contract

Other Jira skills call this one first. Inside this repo this override runs, and their chyron
fallback **does not apply**.
