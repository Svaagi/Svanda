import type { ContactRequest } from '@svanda/shared';

export const TEST_ADDRESSES = {
  from: 'web@example.com',
  to: 'business@example.com',
};

export const contactRequestFixture: ContactRequest = {
  name: 'Jana Novakova',
  venue: 'Bar U Lipy, Brno',
  email: 'jana@example.com',
  message: 'Hello\nsecond line',
  locale: 'cs',
  honeypot: '',
  altcha: 'payload',
};
