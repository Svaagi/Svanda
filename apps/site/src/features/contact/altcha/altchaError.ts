export type AltchaFailure =
  | { reason: 'network' }
  | { reason: 'rate_limited'; retryAfterSeconds?: number }
  | { reason: 'not_solved' };

// Why no proof of work could be made, so the form can say what to do about it.
export class AltchaError extends Error {
  readonly failure: AltchaFailure;

  constructor(failure: AltchaFailure) {
    super(`altcha failed: ${failure.reason}`);
    this.name = 'AltchaError';
    this.failure = failure;
  }
}

export const toAltchaFailure = (error: unknown): AltchaFailure =>
  error instanceof AltchaError ? error.failure : { reason: 'not_solved' };
