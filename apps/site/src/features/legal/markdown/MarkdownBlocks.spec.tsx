import { screen } from '@testing-library/react';
import { renderAtPath } from 'utils/testing';
import { describe, expect, it } from 'vitest';

import { MarkdownBlocks } from './MarkdownBlocks';
import { parseMarkdown } from './parseMarkdown';

const SOURCE = [
  '# Title',
  '',
  '## Section',
  '',
  'See [the policy](/en/privacy), [the authority](https://www.uoou.gov.cz) or [mail us](mailto:a@b.cz).',
  '',
  '- **Name:** Jana',
].join('\n');

function renderSource() {
  return renderAtPath(<MarkdownBlocks blocks={parseMarkdown(SOURCE)} />, '/en');
}

describe('MarkdownBlocks', () => {
  it('renders the heading levels, paragraphs and lists', () => {
    renderSource();

    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBe(
      screen.getByTestId('markdown-blocks-title'),
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Section' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('Name: Jana');
    expect(screen.getByText('Name:').tagName).toBe('STRONG');
  });

  it('opens web links in a new tab and keeps site and mail links in place', () => {
    renderSource();

    const siteLink = screen.getByRole('link', { name: 'the policy' });
    const webLink = screen.getByRole('link', { name: 'the authority' });
    const mailLink = screen.getByRole('link', { name: 'mail us' });

    expect(siteLink).toHaveAttribute('href', '/en/privacy');
    expect(siteLink).not.toHaveAttribute('target');
    expect(webLink).toHaveAttribute('target', '_blank');
    expect(webLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(mailLink).toHaveAttribute('href', 'mailto:a@b.cz');
    expect(mailLink).not.toHaveAttribute('target');
  });
});
