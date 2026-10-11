import type { ContactRequest } from '@svanda/shared';

import { buildConfirmationMail } from './confirmationMail.js';
import { buildInternalMail } from './internalMail.js';
import type { MailAddresses, MailTransport } from './mailTypes.js';

export type SendContactMailsResult = {
  isConfirmationSent: boolean;
};

// The internal mail is the one that matters: if it fails, this throws and the submit fails.
// A failed confirmation is reported but not fatal, so the visitor does not resend a request
// the team already has.
export async function sendContactMails(
  transport: MailTransport,
  addresses: MailAddresses,
  request: ContactRequest,
): Promise<SendContactMailsResult> {
  await transport.sendMail(buildInternalMail(request, addresses));

  try {
    await transport.sendMail(buildConfirmationMail(request, addresses));

    return { isConfirmationSent: true };
  } catch {
    return { isConfirmationSent: false };
  }
}
