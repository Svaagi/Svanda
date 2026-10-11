#!/bin/sh
# Activates an uploaded SVANDA Web release on the box. Invoked over SSH by
# .github/workflows/deploy.yml as releases/<sha>/infra/scripts/deploy.sh <sha>, after it has
# uploaded the site and infra/ to /var/www/svanda-web/releases/<sha> and pushed the contact API
# image tagged <sha>. When any step fails it puts the previous release back. Manual rollback:
# rollback.sh (see infra/RUNBOOK.md).
#
# Usage: deploy.sh <git-sha>
set -eu

# shellcheck source=lib/release.sh
. "$(dirname "$0")/lib/release.sh"

KEEP_RELEASES=5

sha="${1:-}"
if ! is_sha "$sha"; then
  log "usage: deploy.sh <git-sha>"
  exit 2
fi

release="$RELEASES_DIR/$sha"
if [ ! -f "$release/client/index.html" ] || [ ! -s "$release/csp-script-hashes.txt" ] ||
  [ ! -f "$release/infra/docker-compose.web.yml" ]; then
  log "release $sha is incomplete or was not uploaded"
  exit 1
fi

acquire_lock

printf 'CONTACT_API_IMAGE=%s\nCONTACT_API_TAG=%s\n' "$CONTACT_API_IMAGE" "$sha" \
  >"$release/release.env"
previous="$(current_release)"

fail() {
  log "$1"
  if [ -n "$previous" ] && [ "$previous" != "$sha" ]; then
    restore_release "$previous"
  fi
  exit 1
}

install_caddy_snippet "$sha" || fail "installing the Caddy snippet failed"
start_services "$sha" || fail "the services of $sha did not become healthy"
activate_release "$sha"
check_live local || fail "health checks failed"

# Keep the newest releases (by upload time) for rollback; never the live one.
# shellcheck disable=SC2012 # release names are git shas
ls -1t "$RELEASES_DIR" | tail -n +"$((KEEP_RELEASES + 1))" | while read -r old; do
  if [ "$old" != "$sha" ]; then
    remove_release "$old"
  fi
done

log "ok ($sha)"
