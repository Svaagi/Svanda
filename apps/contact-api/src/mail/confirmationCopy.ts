import type { ContactLocale } from '@svanda/shared';

export type ConfirmationCopy = {
  subject: string;
  greeting: string;
  paragraphs: readonly string[];
  signature: string;
};

export const SITE_URL = 'https://svanda.fun';

export const CONFIRMATION_COPY: Record<ContactLocale, ConfirmationCopy> = {
  cs: {
    subject: 'SVANDA: děkujeme za zprávu',
    greeting: 'Dobrý den,',
    paragraphs: [
      'děkujeme za zprávu. Ozveme se do dvou dnů.',
      'Na tento e-mail můžete rovnou odpovědět.',
    ],
    signature: 'Tým SVANDA',
  },
  en: {
    subject: 'SVANDA: thanks for your message',
    greeting: 'Hello,',
    paragraphs: [
      'thanks for your message. We will get back to you within two days.',
      'You can reply to this e-mail directly.',
    ],
    signature: 'The SVANDA team',
  },
  sk: {
    subject: 'SVANDA: ďakujeme za správu',
    greeting: 'Dobrý deň,',
    paragraphs: [
      'ďakujeme za správu. Ozveme sa do dvoch dní.',
      'Na tento e-mail môžete rovno odpovedať.',
    ],
    signature: 'Tím SVANDA',
  },
};
