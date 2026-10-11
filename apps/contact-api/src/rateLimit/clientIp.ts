const UNKNOWN_CLIENT = 'unknown';

// The API only runs behind Caddy, which appends the address it saw to X-Forwarded-For. The
// last entry is therefore the real client; earlier entries are whatever the client sent.
export function resolveClientIp(
  forwardedFor: string | undefined,
  socketAddress: string | undefined,
): string {
  const lastForwarded = forwardedFor?.split(',').at(-1)?.trim();

  return lastForwarded || socketAddress || UNKNOWN_CLIENT;
}
