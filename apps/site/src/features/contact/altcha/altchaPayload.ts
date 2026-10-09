import type { Challenge, Solution } from 'altcha-lib';

// The API reads the solved challenge as base64 encoded JSON, the format of the ALTCHA widget.
// Every value in it is ASCII (hex strings and numbers), so `btoa` encodes it as is.
export function encodeAltchaPayload(
  challenge: Challenge,
  solution: Solution,
): string {
  return btoa(JSON.stringify({ challenge, solution }));
}
