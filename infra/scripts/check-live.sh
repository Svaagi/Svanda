#!/bin/sh
# Health checks for every SVANDA Web host. `local` (on the box) goes through the local Caddy,
# `public` (the deploy workflow) through DNS. The list itself is check_live in lib/release.sh.
#
# Usage: check-live.sh local|public
set -eu

# shellcheck source=lib/release.sh
. "$(dirname "$0")/lib/release.sh"

case "${1:-}" in
  local | public) ;;
  *)
    log "usage: check-live.sh local|public"
    exit 2
    ;;
esac

check_live "$1"
log "ok ($1)"
