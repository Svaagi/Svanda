import { describe, expect, it, vi } from 'vitest';

import {
  contactRequestFixture,
  TEST_ADDRESSES,
} from '../testing/contactRequestFixture.js';
import { sendContactMails } from './sendContactMails.js';

describe('sendContactMails', () => {
  it('sends the internal mail, then the confirmation', async () => {
    const sendMail = vi.fn().mockResolvedValue({});

    const result = await sendContactMails(
      { sendMail },
      TEST_ADDRESSES,
      contactRequestFixture,
    );

    expect(result).toEqual({ isConfirmationSent: true });
    expect(sendMail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ to: TEST_ADDRESSES.to }),
    );
    expect(sendMail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ to: contactRequestFixture.email }),
    );
  });

  it('fails without a confirmation when the internal mail fails', async () => {
    const sendMail = vi.fn().mockRejectedValue(new Error('smtp down'));

    await expect(
      sendContactMails({ sendMail }, TEST_ADDRESSES, contactRequestFixture),
    ).rejects.toThrow('smtp down');
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it('reports a failed confirmation without failing', async () => {
    const sendMail = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('mailbox full'));

    const result = await sendContactMails(
      { sendMail },
      TEST_ADDRESSES,
      contactRequestFixture,
    );

    expect(result).toEqual({ isConfirmationSent: false });
  });
});
