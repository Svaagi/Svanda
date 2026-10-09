#!/bin/sh
# Static check that the Caddy snippet still sends the headers the securityheaders.com grade
# relies on, and that the script policy stays strict. `caddy validate` only checks syntax; this
# checks content, so a weakened header cannot merge silently. Run in CI (infra job).
#
# Usage: check-security-headers.sh [caddy snippet]
set -eu

SNIPPET="${1:-infra/caddy/svanda-web.caddy}"
fail=0

csp="$(grep -E '^\s*Content-Security-Policy "default-src' "$SNIPPET" || true)"
script_src="$(echo "$csp" | sed -nE "s/.*script-src ([^;]*);.*/\1/p")"

require() {
  if ! echo "$2" | grep -qE -- "$3"; then
    echo "check-security-headers: missing or weakened: $1" >&2
    fail=1
  fi
}

forbid() {
  if echo "$2" | grep -qE -- "$3"; then
    echo "check-security-headers: forbidden: $1" >&2
    fail=1
  fi
}

snippet="$(cat "$SNIPPET")"

require "site Content-Security-Policy" "$csp" "default-src 'self'"
require "frame-ancestors 'none'" "$csp" "frame-ancestors 'none'"
require "object-src 'none'" "$csp" "object-src 'none'"
require "inline script hashes read from the release" "$script_src" "\{file\./var/www/svanda-web/current/csp-script-hashes\.txt\}"
forbid "'unsafe-inline' in script-src" "$script_src" "unsafe-inline"
forbid "'unsafe-eval' in script-src" "$script_src" "'unsafe-eval'"
require "Strict-Transport-Security" "$snippet" 'Strict-Transport-Security "max-age=[0-9]{8}'
require "X-Content-Type-Options: nosniff" "$snippet" 'X-Content-Type-Options "nosniff"'
require "X-Frame-Options: DENY" "$snippet" 'X-Frame-Options "DENY"'
require "Referrer-Policy" "$snippet" 'Referrer-Policy "strict-origin-when-cross-origin"'
require "Permissions-Policy" "$snippet" 'Permissions-Policy "camera=\(\)'

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "check-security-headers: all required headers present in $SNIPPET"
