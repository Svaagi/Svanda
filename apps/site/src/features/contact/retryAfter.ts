// Seconds from a `Retry-After` header; the API sends whole seconds, never a date.
export function readRetryAfterSeconds(response: Response): number | undefined {
  const seconds = Number(response.headers.get('Retry-After'));
  return Number.isInteger(seconds) && seconds > 0 ? seconds : undefined;
}
