import { describe, expect, it } from 'vitest';

import { escapeHtml, escapeHtmlLines } from './escapeHtml.js';

describe('escapeHtml', () => {
  it('escapes every markup character', () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('keeps line breaks as <br> after escaping', () => {
    expect(escapeHtmlLines('one<br>\r\ntwo\nthree')).toBe(
      'one&lt;br&gt;<br>two<br>three',
    );
  });
});
