# SVANDA Web: Runbook

How `svanda.fun` runs in production and how to operate it. SVANDA Web shares the Hetzner box
with SVANDA Manager and sits behind the Manager's Caddy; box provisioning itself (users,
firewall, Docker) is in [`../../svanda-manager/infra/PROVISIONING.md`](../../svanda-manager/infra/PROVISIONING.md).

## What runs where

| Piece | Where | Defined in |
| --- | --- | --- |
| Static site (prerendered, `.br`/`.gz` copies) | `/var/www/svanda-web/current/client`, served by the Manager Caddy | `apps/site` build |
| Caddy sites `svanda.fun`, `www.svanda.fun`, `stats.svanda.fun` | `/etc/caddy/sites/svanda-web.caddy`, imported by the Manager Caddy | [`caddy/svanda-web.caddy`](caddy/svanda-web.caddy) |
| Contact API (`/api/*`, port 8787) | container `svanda-web-contact-api-1` | [`docker-compose.web.yml`](docker-compose.web.yml), image `ghcr.io/svaagi/svanda-web-contact-api:<sha>` |
| Umami (`stats.svanda.fun`) + Postgres | containers `svanda-web-umami-1`, `svanda-web-umami-db-1` | [`docker-compose.web.yml`](docker-compose.web.yml) |
| Secrets | `/opt/svanda-web/infra/.env` (server only, mode 600) | [`.env.example`](.env.example) |
| Deploy, rollback, health checks | `/var/www/svanda-web/releases/<sha>/infra/scripts/` | [`scripts/`](scripts/), [`../.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) |

Box layout:

```
/opt/svanda-web/infra/.env             server-only secrets, never part of a release
/var/www/svanda-web/releases/<sha>/    client/, csp-script-hashes.txt, infra/, release.env
/var/www/svanda-web/current            relative symlink to the live release
/var/www/svanda-web/.deploy.lock       flock held by deploy.sh and rollback.sh
/etc/caddy/sites/svanda-web.caddy      the live release's snippet, installed when it changes
```

Each release carries its own `infra/` (compose file, Caddy snippet, scripts), so a release's
site, config, scripts and contact API image always move together. The paths are defined once,
in [`scripts/lib/release.sh`](scripts/lib/release.sh), which the deploy workflow also reads.

The contact API and Umami reach the Manager Caddy over the shared Docker network
`svanda-edge` under the aliases `svanda-web-contact-api` and `svanda-web-umami`. Neither
publishes a host port; `umami-db` is only on the stack's internal network.

## One-time setup

### 1. Manager prerequisites (a change in the svanda-manager repo)

Not done from this repo. Merge this in `svanda-manager` before the first deploy:

- `infra/Caddyfile`: add `import /etc/caddy/sites/*.caddy` at the top level (outside the
  `{$SVANDA_DOMAIN}` block, after the global options).
- `infra/docker-compose.prod.yml`, service `caddy`:
  - join the shared network: add `edge` to its `networks`, and at the top level
    `edge: { name: svanda-edge, external: true }`;
  - mount `/etc/caddy/sites:/etc/caddy/sites:ro` and `/var/www/svanda-web:/var/www/svanda-web:ro`.
- The Manager Caddy container must be named `svanda-caddy-1` (compose project `svanda`,
  service `caddy`, the current default). If that changes, set `MANAGER_CADDY_CONTAINER` for
  the deploy user (see `scripts/lib/release.sh`).

### 2. Box

As the `deploy` user (already in the `docker` group per the Manager provisioning):

```sh
docker network create svanda-edge
sudo install -d -o deploy -g deploy /opt/svanda-web /opt/svanda-web/infra \
  /var/www/svanda-web /var/www/svanda-web/releases /etc/caddy/sites
# flock (util-linux) and rsync ship with Ubuntu; check with `command -v flock rsync`.
# Secrets: copy infra/.env.example from the repo, fill it in.
install -m 600 /dev/null /opt/svanda-web/infra/.env && nano /opt/svanda-web/infra/.env
```

Then restart the Manager stack once so Caddy picks up the new mounts and network
(`cd /opt/svanda && docker compose -f infra/docker-compose.prod.yml up -d caddy`).

Contact API image pulls: either make the GHCR package `svanda-web-contact-api` public (it holds
no secrets) after the first deploy pushed it, or log the box in once with a GitHub token that
only has `read:packages`: `docker login ghcr.io -u <github-user>`.

### 3. Deploy key

On the box, as `deploy`:

```sh
ssh-keygen -t ed25519 -f ~/.ssh/svanda_web_ci -N "" -C "svanda-web-ci"
```

Append the public half to `~/.ssh/authorized_keys` with the `restrict` option (no pty, no
forwarding): `restrict ssh-ed25519 AAAA... svanda-web-ci`. A forced command is not possible
here because the deploy uploads with rsync and then runs the release's `deploy.sh`; the key's reach is the
deploy user (Docker access), which is why its secrets live in a protected GitHub environment.
Copy the private half into the GitHub secret below, then `shred -u ~/.ssh/svanda_web_ci`.

### 4. GitHub

Settings > Environments > New environment **`production`**, deployment branches: **`main`
only**. Add to that environment:

| Kind | Name | Value |
| --- | --- | --- |
| Secret | `DEPLOY_HOST` | box IP or hostname |
| Secret | `DEPLOY_USER` | `deploy` |
| Secret | `DEPLOY_SSH_KEY` | private half of `svanda_web_ci` |
| Secret | `DEPLOY_KNOWN_HOSTS` | output of `ssh-keyscan -t ed25519 <box-ip>`, checked against `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the box |
| Variable | `UMAMI_WEBSITE_ID` | the website id from Umami (step 7); public, baked into the site build |

`GITHUB_TOKEN` pushes the contact API image (the deploy job has `packages: write`); nothing
else is needed.

### 5. DNS at WEDOS

In the `svanda.fun` zone (WEDOS > Domény > svanda.fun > DNS), next to the existing Manager
and Google Workspace records:

| Name | Type | Value |
| --- | --- | --- |
| `@` | A | box IPv4 |
| `@` | AAAA | box IPv6 |
| `www` | A / AAAA | box IPv4 / IPv6 (or CNAME `svanda.fun.`) |
| `stats` | A / AAAA | box IPv4 / IPv6 |

Create the `stats` records only after Umami's default password is changed (step 7): Umami
starts with a public `admin` / `umami` login.

Caddy obtains the certificates on the first request once the records resolve. Do not touch
the `MX`, `TXT` (SPF, verification) or `google._domainkey` records.

### 6. Mail (contact form to business@svanda.fun)

- SPF on `@`: `v=spf1 include:_spf.google.com ~all` (one SPF record only; merge if one exists).
- DKIM: Google Admin > Apps > Google Workspace > Gmail > Authenticate email, generate the key,
  publish `google._domainkey` TXT, then press **Start authentication**.
- DMARC: `_dmarc` TXT `v=DMARC1; p=quarantine; rua=mailto:business@svanda.fun` (start with
  `p=none` for a week if unsure).
- Sender mailbox (`MAIL_FROM`, also `SMTP_USER`): a Workspace user with 2-Step Verification and
  an **app password** in `SMTP_PASS`, host `smtp.gmail.com`, port `465`. Alternative: the
  Workspace SMTP relay (`smtp-relay.gmail.com`, restricted to the box IP); then set
  `SMTP_HOST` accordingly.
- `ALTCHA_HMAC_KEY`: `openssl rand -hex 32`. `ALLOWED_ORIGINS=https://svanda.fun`.

### 7. Umami

Umami starts with the well-known login `admin` / `umami`. **Change it before
`stats.svanda.fun` resolves publicly**, over an SSH tunnel to the container (no DNS or TLS
needed):

```sh
# on the box: the Umami container address on svanda-edge
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' svanda-web-umami-1
# on your machine, with one of those addresses, then open http://localhost:3000
ssh -N -L 3000:<umami-ip>:3000 deploy@<box-ip>
```

Log in, Settings > Profile > change password. If the `stats` record already exists and the
password is still the default, first enable the temporary `basic_auth` block in the
`stats.svanda.fun` site of [`caddy/svanda-web.caddy`](caddy/svanda-web.caddy) (hash with
`docker exec svanda-caddy-1 caddy hash-password`) and deploy; remove it again once the
password is changed, because it also blocks the tracker.

Then add a website `svanda.fun` (domain `svanda.fun`), copy its website id into the GitHub variable `UMAMI_WEBSITE_ID` and re-run the
latest deploy so the site build carries it. The tracker loads from
`https://stats.svanda.fun/script.js`, only after analytics consent.

### 8. Uptime monitor

In the uptime monitor already used for the Manager (UptimeRobot), add HTTPS monitors for
`https://svanda.fun/` and `https://svanda.fun/api/health` (expects `200`), alerting
`ops@svanda.fun`.

## Deploy

Automatic: every push to `main` runs CI; when CI is green, the **Deploy** workflow
(`.github/workflows/deploy.yml`) runs on that exact commit. If a newer commit reached `main`
meanwhile, it skips with a notice (the newer commit deploys after its own CI). Otherwise it:

1. builds the site (`pnpm build`: client build, `.br`/`.gz` copies, CSP script hashes);
2. builds and pushes `ghcr.io/svaagi/svanda-web-contact-api:<sha>`;
3. rsyncs the build and `infra/` to `/var/www/svanda-web/releases/<sha>/` (hard links to
   unchanged files of the live release);
4. runs that release's `infra/scripts/deploy.sh <sha>` on the box. Under the deploy lock it
   installs the release's Caddy snippet if it changed (validate, reload, restore on failure),
   starts the release's services and waits until all are healthy, switches `current` in one
   rename and runs `check-live.sh local` through the local Caddy. If any of these fails it puts
   the previous release back (snippet, services, `current`). It keeps the last five releases
   and removes the contact API images of the pruned ones;
5. runs `check-live.sh public` from the runner (the same list of checks, through DNS).

Feature branches and pull requests never deploy. A failed deploy is re-run from the Actions
tab ("Re-run jobs").

## Rollback

On the box as `deploy`:

```sh
sh /var/www/svanda-web/current/infra/scripts/rollback.sh          # list, live one marked
sh /var/www/svanda-web/current/infra/scripts/rollback.sh <sha>    # switch back to <sha>
sh /var/www/svanda-web/current/infra/scripts/check-live.sh local  # health checks only
```

A rollback reinstalls that release's Caddy snippet, starts its services (its contact API
image) and switches `current`, under the same lock as deploys. For a release no longer on the
box, `git revert` the commit on `main` and let the pipeline redeploy.

## Security headers

`svanda.fun` sends HSTS, a CSP, `X-Content-Type-Options`, `X-Frame-Options: DENY`,
`Referrer-Policy`, `Permissions-Policy` and COOP. CI asserts them statically
(`infra/scripts/check-security-headers.sh`); after a deploy that touches headers, scan
`https://svanda.fun` on securityheaders.com (target: grade A).

CSP notes:

- React Router writes inline `<script>` tags into the prerendered HTML. They are allowed by
  SHA-256 hash, not `'unsafe-inline'`: the build writes `csp-script-hashes.txt` next to the
  client build and Caddy reads it into the header on every request (`{file.*}`), so the
  hashes always match the live release without a Caddy reload.
- `'wasm-unsafe-eval'`: the meshopt decoder of the 3D model compiles WebAssembly.
- `style-src 'unsafe-inline'`: prerendered markup carries style attributes and Radix dialogs
  inject their scroll lock styles. Scripts stay hash-only.
- `worker-src 'self'`: the ALTCHA proof of work runs in same-origin module workers.
- Umami: `script-src` and `connect-src` allow `https://stats.svanda.fun`.

HSTS is `max-age=63072000; includeSubDomains` without `preload`. Submitting the domain to the
preload list is a one-way launch decision (it covers every subdomain); add `preload` only
together with that submission.

If Cloudflare is ever put in front (as the Manager provisioning plans), add its ranges as
`trusted_proxies` in the Caddy global options. The snippet passes `{client_ip}` as the only
`X-Forwarded-For` entry, and the contact API rate limits on that entry, so it then stays the
real visitor address.

## Backups

Only `umami-db` holds state (analytics). Nightly dump, kept 14 days, as the deploy user:

```
30 3 * * * docker exec svanda-web-umami-db-1 pg_dump -U umami -Fc umami > /var/backups/svanda-web/umami-$(date +\%F).dump && find /var/backups/svanda-web -name 'umami-*.dump' -mtime +14 -delete
```

(`sudo install -d -o deploy -g deploy /var/backups/svanda-web` once.) For off-box copies,
encrypt and upload them like the Manager backups (`svanda-manager/infra/scripts/backup.sh`,
age + B2). Restore: `docker exec -i svanda-web-umami-db-1 pg_restore -U umami -d umami --clean < umami-<date>.dump`.

## Situations

| Situation | First moves |
| --- | --- |
| Site down, Manager fine | `ls -l /var/www/svanda-web/current`; `docker logs svanda-caddy-1 --since 10m`; `cat /etc/caddy/sites/svanda-web.caddy`; roll back |
| `/api/health` failing | `cd /var/www/svanda-web/current && docker compose -f infra/docker-compose.web.yml --env-file /opt/svanda-web/infra/.env --env-file release.env ps`, then `logs contact-api` |
| Contact mails not arriving | contact API logs (`mail send failed`); app password revoked or 2SV off; SPF/DKIM/DMARC alignment in the received headers |
| Stats down | same `ps`/`logs umami umami-db`; disk space (`df -h`) |
| Deploy failed | the Deploy job log; on the box `rollback.sh` lists what is live |
| Deploy waits on the lock | another deploy or rollback is running; `fuser /var/www/svanda-web/.deploy.lock` shows it |

## Local dry run (no server)

The stack and the Caddy snippet can be exercised locally with Docker: create the
`svanda-edge` network, build the API image as `ghcr.io/svaagi/svanda-web-contact-api:<tag>`,
start `docker-compose.web.yml` with placeholder secrets, and run the Caddy image on
`svanda-edge` with a Caddyfile of `{ local_certs }` plus `import /etc/caddy/sites/*.caddy`,
`infra/caddy` mounted at `/etc/caddy/sites` and `apps/site/build` at
`/var/www/svanda-web/current`. Then `curl -k --resolve svanda.fun:443:127.0.0.1 ...` each
host and path. To exercise `deploy.sh` and `rollback.sh`, run them in a `docker:cli`
container (plus `curl coreutils util-linux`) with the Docker socket, shared volumes for
`/var/www/svanda-web` and `/etc/caddy/sites`, and `--network container:<caddy>`.
