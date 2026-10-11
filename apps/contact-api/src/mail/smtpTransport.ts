import { createTransport } from 'nodemailer';

import type { Env } from '../config/index.js';
import { SMTPS_PORT } from '../constants/index.js';
import type { MailTransport } from './mailTypes.js';

// Port 465 speaks TLS from the first byte; any other port (587) must upgrade with STARTTLS.
export const createSmtpTransport = (env: Env): MailTransport =>
  createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === SMTPS_PORT,
    requireTLS: true,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
