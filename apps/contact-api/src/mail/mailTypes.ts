import type { SendMailOptions } from 'nodemailer';

export type MailTransport = {
  sendMail: (message: SendMailOptions) => Promise<unknown>;
};

export type MailAddresses = {
  from: string;
  to: string;
};
