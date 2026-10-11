#!/bin/sh
# Switches SVANDA Web back to a release that is still on the box (deploy.sh keeps the last
# five): its Caddy snippet, its services and its site files. Run on the box as the deploy user,
# from any release, e.g. /var/www/svanda-web/current/infra/scripts/rollback.sh. Without an
# argument it lists the releases, newest first, with the live one marked.
#
# Usage: rollback.sh [<git-sha>]
set -eu

# shellcheck source=lib/release.sh
. "$(dirname "$0")/lib/release.sh"

sha="${1:-}"
live="$(current_release)"

if [ -z "$sha" ]; then
  # shellcheck disable=SC2012 # release names are git shas
  ls -1t "$RELEASES_DIR" | while read -r release; do
    if [ "$release" = "$live" ]; then
      echo "$release (live)"
    else
      echo "$release"
    fi
  done
  exit 0
fi

if ! is_sha "$sha" || [ ! -f "$RELEASES_DIR/$sha/release.env" ]; then
  log "no activated release $sha in $RELEASES_DIR"
  exit 1
fi

acquire_lock

install_caddy_snippet "$sha"
start_services "$sha"
activate_release "$sha"

if ! check_live local; then
  log "health checks still failing on $sha"
  exit 1
fi

log "ok ($sha, was ${live:-none})"
