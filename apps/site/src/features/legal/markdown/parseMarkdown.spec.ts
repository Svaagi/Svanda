import { describe, expect, it } from 'vitest';

import { parseInline, parseMarkdown } from './parseMarkdown';

describe('parseInline', () => {
  it('splits text, strong runs and links', () => {
    expect(
      parseInline('Write to **us** at [mail](mailto:a@b.cz) today'),
    ).toEqual([
      { type: 'text', text: 'Write to ' },
      { type: 'strong', text: 'us' },
      { type: 'text', text: ' at ' },
      { type: 'link', text: 'mail', href: 'mailto:a@b.cz' },
      { type: 'text', text: ' today' },
    ]);
  });

  it('keeps parentheses that are not a link', () => {
    expect(parseInline('Art. 6(1)(b) GDPR')).toEqual([
      { type: 'text', text: 'Art. 6(1)(b) GDPR' },
    ]);
  });
});

describe('parseMarkdown', () => {
  it('reads headings, paragraphs and lists', () => {
    const source = [
      '# Title',
      '',
      'First line',
      'joins the paragraph.',
      '',
      '## Section',
      '- one',
      '- two',
      '  continued',
      '',
      '### Detail',
    ].join('\n');

    expect(parseMarkdown(source)).toEqual([
      {
        type: 'heading',
        tag: 'h1',
        inlines: [{ type: 'text', text: 'Title' }],
      },
      {
        type: 'paragraph',
        inlines: [{ type: 'text', text: 'First line joins the paragraph.' }],
      },
      {
        type: 'heading',
        tag: 'h2',
        inlines: [{ type: 'text', text: 'Section' }],
      },
      {
        type: 'list',
        items: [
          [{ type: 'text', text: 'one' }],
          [{ type: 'text', text: 'two continued' }],
        ],
      },
      {
        type: 'heading',
        tag: 'h3',
        inlines: [{ type: 'text', text: 'Detail' }],
      },
    ]);
  });

  it('drops editor comments, also across lines', () => {
    const source = '<!-- TODO review\nstill a note -->\n\n# Title\r\n\r\nText';

    expect(parseMarkdown(source)).toEqual([
      {
        type: 'heading',
        tag: 'h1',
        inlines: [{ type: 'text', text: 'Title' }],
      },
      { type: 'paragraph', inlines: [{ type: 'text', text: 'Text' }] },
    ]);
  });

  it('ends a list when a paragraph line follows it', () => {
    expect(parseMarkdown('- item\nAfter')).toEqual([
      { type: 'list', items: [[{ type: 'text', text: 'item' }]] },
      { type: 'paragraph', inlines: [{ type: 'text', text: 'After' }] },
    ]);
  });
});
