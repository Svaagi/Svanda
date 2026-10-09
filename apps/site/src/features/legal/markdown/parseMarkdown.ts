// A deliberately small Markdown subset, enough for the legal texts: `#` to `###` headings,
// paragraphs, `-` lists (an indented line continues the item), `**strong**` and
// `[text](href)`. HTML comments are notes for editors and never render.

export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'link'; text: string; href: string };

// One `#` per level: `#` is h1, `###` is h3.
const HEADING_TAGS = ['h1', 'h2', 'h3'] as const;

type HeadingTag = (typeof HEADING_TAGS)[number];

export type MarkdownBlock =
  | { type: 'heading'; tag: HeadingTag; inlines: InlineNode[] }
  | { type: 'paragraph'; inlines: InlineNode[] }
  | { type: 'list'; items: InlineNode[][] };

const COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const HEADING_PATTERN = /^(#{1,3})\s+(.+)$/;
const LIST_ITEM_PATTERN = /^-\s+(.+)$/;
const CONTINUATION_PATTERN = /^\s+(\S.*)$/;
const INLINE_PATTERN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(source: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let cursor = 0;

  for (const match of source.matchAll(INLINE_PATTERN)) {
    const [whole, strongText, linkText, href] = match;
    if (match.index > cursor) {
      nodes.push({ type: 'text', text: source.slice(cursor, match.index) });
    }
    if (strongText !== undefined) {
      nodes.push({ type: 'strong', text: strongText });
    } else if (linkText !== undefined && href !== undefined) {
      nodes.push({ type: 'link', text: linkText, href });
    }
    cursor = match.index + whole.length;
  }
  if (cursor < source.length) {
    nodes.push({ type: 'text', text: source.slice(cursor) });
  }

  return nodes;
}

type ParserState = {
  blocks: MarkdownBlock[];
  paragraph: string[];
  listItems: string[];
};

function flush(state: ParserState) {
  if (state.paragraph.length > 0) {
    state.blocks.push({
      type: 'paragraph',
      inlines: parseInline(state.paragraph.join(' ')),
    });
    state.paragraph = [];
  }
  if (state.listItems.length > 0) {
    state.blocks.push({
      type: 'list',
      items: state.listItems.map(parseInline),
    });
    state.listItems = [];
  }
}

function readLine(state: ParserState, line: string) {
  const heading = HEADING_PATTERN.exec(line);
  const headingTag = heading?.[1] && HEADING_TAGS[heading[1].length - 1];
  const listItem = LIST_ITEM_PATTERN.exec(line);
  const continuation = CONTINUATION_PATTERN.exec(line);
  const lastItemIndex = state.listItems.length - 1;

  if (headingTag && heading[2]) {
    flush(state);
    state.blocks.push({
      type: 'heading',
      tag: headingTag,
      inlines: parseInline(heading[2].trim()),
    });
  } else if (listItem?.[1]) {
    if (state.paragraph.length > 0) flush(state);
    state.listItems.push(listItem[1].trim());
  } else if (continuation?.[1] && lastItemIndex >= 0) {
    state.listItems[lastItemIndex] += ` ${continuation[1].trim()}`;
  } else {
    if (state.listItems.length > 0) flush(state);
    state.paragraph.push(line.trim());
  }
}

export function parseMarkdown(source: string): MarkdownBlock[] {
  const state: ParserState = { blocks: [], paragraph: [], listItems: [] };

  source
    .replace(COMMENT_PATTERN, '')
    .split(/\r?\n/)
    .forEach((line) => {
      if (line.trim() === '') flush(state);
      else readLine(state, line);
    });
  flush(state);

  return state.blocks;
}
