import type { ContactRequest } from '@svanda/shared';
import type { SendMailOptions } from 'nodemailer';

import { CONFIRMATION_COPY, SITE_URL } from './confirmationCopy.js';
import { escapeHtml } from './escapeHtml.js';
import type { MailAddresses } from './mailTypes.js';

// Fixed copy only, nothing the visitor typed: the recipient address is unverified, so echoing
// any input would let anyone use the form to deliver their own text to a third party.
export function buildConfirmationMail(
  request: ContactRequest,
  addresses: MailAddresses,
): SendMailOptions {
  const copy = CONFIRMATION_COPY[request.locale];
  const paragraphs = [copy.greeting, ...copy.paragraphs];

  return {
    from: addresses.from,
    to: request.email,
    replyTo: addresses.to,
    subject: copy.subject,
    text: [...paragraphs, `${copy.signature}\n${SITE_URL}`].join('\n\n'),
    html: [
      ...paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
      `<p>${escapeHtml(copy.signature)}<br><a href="${SITE_URL}">${SITE_URL}</a></p>`,
    ].join('\n'),
  };
}
