import { contactRequestSchema, isRecord } from '@svanda/shared';
import { type Context, Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import type { Logger } from 'pino';

import type { AppEnv } from '../appEnv.js';
import type { Captcha, CaptchaVerification } from '../captcha/index.js';
import { BODY_LIMIT_BYTES, MIN_FILL_TIME_MS } from '../constants/index.js';
import { respondWithError } from '../errors/index.js';
import {
  type MailAddresses,
  type MailTransport,
  sendContactMails,
} from '../mail/index.js';
import { limitRate, type RateLimiter } from '../rateLimit/index.js';

const PAYLOAD_TOO_LARGE = 413;

export type ContactRouteDeps = {
  captcha: Captcha;
  submitRateLimiter: RateLimiter;
  challengeRateLimiter: RateLimiter;
  getClientIp: (context: Context) => string;
  mailTransport: MailTransport;
  mailAddresses: MailAddresses;
  logger: Logger;
  now: () => number;
};

async function readJson(context: Context): Promise<unknown> {
  try {
    return await context.req.json<unknown>();
  } catch {
    return undefined;
  }
}

// Nodemailer's error code (EAUTH, ECONNECTION) tells an operator what broke; the message may
// quote addresses, so it is never logged.
const smtpErrorCode = (error: unknown) =>
  isRecord(error) && typeof error.code === 'string' ? error.code : undefined;

// The fill time runs from when the server issued the challenge, so the client cannot fake it.
const isFilledTooFast = (verification: CaptchaVerification, now: number) =>
  now - verification.issuedAt < MIN_FILL_TIME_MS;

const limitBody = bodyLimit({
  maxSize: BODY_LIMIT_BYTES,
  onError: (context) =>
    respondWithError(context, 'contact.invalid', PAYLOAD_TOO_LARGE),
});

export function createContactRoute(deps: ContactRouteDeps) {
  return new Hono<AppEnv>()
    .get(
      '/challenge',
      limitRate(deps.challengeRateLimiter, deps.getClientIp),
      async (context) => {
        context.header('Cache-Control', 'no-store');

        return context.json(await deps.captcha.createChallenge());
      },
    )
    .post(
      '/',
      limitRate(deps.submitRateLimiter, deps.getClientIp),
      limitBody,
      async (context) => {
        const parsed = contactRequestSchema.safeParse(await readJson(context));

        if (!parsed.success) {
          return respondWithError(context, 'contact.invalid');
        }

        const request = parsed.data;
        // A filled honeypot is a bot, so its proof of work is not even checked.
        const verification =
          request.honeypot === ''
            ? await deps.captcha.verify(request.altcha)
            : null;

        if (!verification || isFilledTooFast(verification, deps.now())) {
          return respondWithError(context, 'contact.captcha_failed');
        }

        try {
          const { isConfirmationSent } = await sendContactMails(
            deps.mailTransport,
            deps.mailAddresses,
            request,
          );

          if (!isConfirmationSent) {
            deps.logger.warn(
              { requestId: context.get('requestId') },
              'confirmation mail failed',
            );
          }
        } catch (error) {
          deps.logger.error(
            {
              requestId: context.get('requestId'),
              smtpCode: smtpErrorCode(error),
            },
            'contact mail failed',
          );

          return respondWithError(context, 'contact.send_failed');
        }

        return context.json({ status: 'sent' });
      },
    );
}
