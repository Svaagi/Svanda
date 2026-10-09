# shellcheck shell=sh
# Shared by deploy.sh, rollback.sh and check-live.sh (sourced, not run), and the single source
# of the box paths for .github/workflows/deploy.yml. Box layout:
#   /opt/svanda-web/infra/.env          server-only secrets (never in a release)
#   /var/www/svanda-web/releases/<sha>/ client/, csp-script-hashes.txt, infra/, release.env
#   /var/www/svanda-web/current         relative symlink to the live release
#   /etc/caddy/sites/svanda-web.caddy   the live release's Caddy snippet, imported by the
#                                       Manager Caddy
# Function locals carry a `_rel_` prefix: POSIX sh has no `local`, so this keeps them from
# overwriting the callers' variables.

WEB_ROOT=/var/www/svanda-web
RELEASES_DIR="$WEB_ROOT/releases"
SECRETS_FILE=/opt/svanda-web/infra/.env
SITES_DIR=/etc/caddy/sites
SITE_SNIPPET=svanda-web.caddy
CONTACT_API_IMAGE=ghcr.io/svaagi/svanda-web-contact-api
LOCK_FILE="$WEB_ROOT/.deploy.lock"
LOCK_TIMEOUT_SECONDS=600
# The Manager Caddy container (compose project `svanda`, service `caddy`).
CADDY_CONTAINER="${MANAGER_CADDY_CONTAINER:-svanda-caddy-1}"
CADDY_CONFIG=/etc/caddy/Caddyfile

log() {
  echo "$(basename "$0"): $*" >&2
}

is_sha() {
  case "$1" in
    '' | *[!0-9a-f]*) return 1 ;;
    *) return 0 ;;
  esac
}

# One deploy or rollback at a time: holds the lock on fd 9 until the script exits.
acquire_lock() {
  exec 9>"$LOCK_FILE"
  if ! flock -w "$LOCK_TIMEOUT_SECONDS" 9; then
    log "another deploy or rollback still holds $LOCK_FILE"
    exit 1
  fi
}

# The live release's directory name (a sha), or nothing before the first deploy.
current_release() {
  if [ -L "$WEB_ROOT/current" ]; then
    basename "$(readlink "$WEB_ROOT/current")"
  fi
}

# docker compose for one release: its own compose file, the secrets and its image tag.
compose_release() {
  _rel_dir="$RELEASES_DIR/$1"
  shift
  docker compose -f "$_rel_dir/infra/docker-compose.web.yml" \
    --env-file "$SECRETS_FILE" \
    --env-file "$_rel_dir/release.env" \
    "$@"
}

# Starts the release's services and waits until every one is healthy. Each release tags its
# contact API image with its own sha, so compose pulls it as a missing image.
start_services() {
  compose_release "$1" up -d --wait --remove-orphans
}

# Points `current` at the release in one rename, so Caddy never sees a half-switched site.
activate_release() {
  ln -sfn "releases/$1" "$WEB_ROOT/current.next"
  mv -Tf "$WEB_ROOT/current.next" "$WEB_ROOT/current"
}

reload_caddy() {
  docker exec "$CADDY_CONTAINER" caddy reload --adapter caddyfile --config "$CADDY_CONFIG"
}

# Installs the release's Caddy snippet when it differs from the live one: validated first,
# the previous one restored when the reload fails.
install_caddy_snippet() {
  _rel_source="$RELEASES_DIR/$1/infra/caddy/$SITE_SNIPPET"
  _rel_target="$SITES_DIR/$SITE_SNIPPET"
  if [ -f "$_rel_target" ] && cmp -s "$_rel_source" "$_rel_target"; then
    return 0
  fi
  # `.next` does not match the `*.caddy` import, so the live config never loads it early.
  cp "$_rel_source" "$_rel_target.next"
  if ! _rel_output="$(docker exec "$CADDY_CONTAINER" caddy validate --adapter caddyfile \
    --config "$_rel_target.next" 2>&1)"; then
    rm -f "$_rel_target.next"
    echo "$_rel_output" >&2
    log "the Caddy snippet of $1 does not validate"
    return 1
  fi
  if [ -f "$_rel_target" ]; then
    cp "$_rel_target" "$_rel_target.previous"
  fi
  mv -f "$_rel_target.next" "$_rel_target"
  if ! reload_caddy; then
    log "Caddy reload failed, restoring the previous snippet"
    if [ -f "$_rel_target.previous" ]; then
      mv -f "$_rel_target.previous" "$_rel_target"
    else
      rm -f "$_rel_target"
    fi
    reload_caddy || true
    return 1
  fi
  rm -f "$_rel_target.previous"
}

# Puts a release back in place after a failed deploy: its snippet, its services, `current`.
restore_release() {
  log "switching back to $1"
  install_caddy_snippet "$1" || true
  start_services "$1" || true
  activate_release "$1"
}

# Removes a release directory and its contact API image.
remove_release() {
  docker image rm "$CONTACT_API_IMAGE:$1" >/dev/null 2>&1 || true
  rm -rf "${RELEASES_DIR:?}/$1"
}

# Requests one URL and checks the status code. Mode `local` goes through the Caddy on this box,
# `public` through DNS (used by the deploy workflow).
expect_status() {
  _rel_mode="$1"
  _rel_expected="$2"
  _rel_url="$3"
  _rel_host="$(echo "$_rel_url" | sed -E 's#^https://([^/]+).*#\1#')"
  if [ "$_rel_mode" = local ]; then
    set -- --resolve "$_rel_host:443:127.0.0.1"
  else
    set --
  fi
  _rel_status="$(curl -sS -o /dev/null -w '%{http_code}' --retry 5 --retry-delay 3 \
    --retry-all-errors "$@" "$_rel_url" || true)"
  if [ "$_rel_status" != "$_rel_expected" ]; then
    log "health: $_rel_url answered $_rel_status, expected $_rel_expected"
    return 1
  fi
}

# The one list of health checks, for the box (`local`) and the workflow (`public`).
check_live() {
  expect_status "$1" 200 https://svanda.fun/ &&
    expect_status "$1" 200 https://svanda.fun/en &&
    expect_status "$1" 200 https://svanda.fun/sk &&
    expect_status "$1" 404 https://svanda.fun/404 &&
    expect_status "$1" 200 https://svanda.fun/api/health &&
    expect_status "$1" 301 https://www.svanda.fun/ &&
    expect_status "$1" 200 https://stats.svanda.fun/api/heartbeat
}
