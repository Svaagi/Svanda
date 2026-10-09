import { CONTACT_LOCALES, JUKEBOX_CONFIG_DEFAULTS } from '@svanda/shared';
import { describe, expect, it } from 'vitest';

import {
  contactRequestFixture,
  TEST_ADDRESSES,
} from '../testing/contactRequestFixture.js';
import { CONFIRMATION_COPY } from './confirmationCopy.js';
import { buildConfirmationMail } from './confirmationMail.js';
import { buildInternalMail } from './internalMail.js';

const hostileRequest = {
  ...contactRequestFixture,
  name: '<script>alert(1)</script>',
  venue: 'Bar "&" <b>Brno</b>',
  message: '<img src=x onerror=alert(1)>\nline',
};

describe('buildInternalMail', () => {
  it('goes to the configured inbox with the visitor as Reply-To', () => {
    const mail = buildInternalMail(contactRequestFixture, TEST_ADDRESSES);

    expect(mail.from).toBe(TEST_ADDRESSES.from);
    expect(mail.to).toBe(TEST_ADDRESSES.to);
    expect(mail.replyTo).toEqual({
      name: contactRequestFixture.name,
      address: contactRequestFixture.email,
    });
    expect(mail.subject).toContain(contactRequestFixture.venue);
    expect(mail.text).toContain(contactRequestFixture.message);
    expect(mail.attachments).toEqual([]);
  });

  it('attaches the configuration as config.json', () => {
    const mail = buildInternalMail(
      { ...contactRequestFixture, config: JUKEBOX_CONFIG_DEFAULTS },
      TEST_ADDRESSES,
    );

    expect(mail.attachments).toEqual([
      expect.objectContaining({
        filename: 'config.json',
        contentType: 'application/json',
      }),
    ]);
    const [attachment] = mail.attachments ?? [];
    expect(JSON.parse(String(attachment?.content))).toEqual(
      JUKEBOX_CONFIG_DEFAULTS,
    );
  });

  it('escapes every visitor value in the HTML part', () => {
    const html = String(buildInternalMail(hostileRequest, TEST_ADDRESSES).html);

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('Bar &quot;&amp;&quot; &lt;b&gt;Brno&lt;/b&gt;');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;<br>line');
  });
});

describe('buildConfirmationMail', () => {
  it.each(CONTACT_LOCALES)(
    'sends the %s copy to the visitor, replies going to the team',
    (locale) => {
      const mail = buildConfirmationMail(
        { ...contactRequestFixture, locale },
        TEST_ADDRESSES,
      );
      const copy = CONFIRMATION_COPY[locale];

      expect(mail.from).toBe(TEST_ADDRESSES.from);
      expect(mail.to).toBe(contactRequestFixture.email);
      expect(mail.replyTo).toBe(TEST_ADDRESSES.to);
      expect(mail.subject).toBe(copy.subject);
      expect(mail.text).toContain(copy.greeting);
      expect(mail.html).toContain(copy.paragraphs[0]);
    },
  );

  it('echoes nothing the visitor typed', () => {
    const mail = buildConfirmationMail(hostileRequest, TEST_ADDRESSES);
    const body = `${String(mail.subject)}${String(mail.text)}${String(mail.html)}`;

    for (const typed of ['script', 'Brno', 'onerror']) {
      expect(body).not.toContain(typed);
    }
  });
});
