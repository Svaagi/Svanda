import { memo } from 'react';
import { childTestId } from 'utils';

import styles from './markdown.module.css';
import { MarkdownInline } from './MarkdownInline';
import type { MarkdownBlock } from './parseMarkdown';

export type MarkdownBlocksProps = {
  blocks: MarkdownBlock[];
  testId?: string;
};

function renderBlock(block: MarkdownBlock, key: string, testId: string) {
  if (block.type === 'heading') {
    const Heading = block.tag;
    return (
      <Heading
        key={key}
        className={styles[Heading]}
        data-testid={
          Heading === 'h1' ? childTestId(testId, 'title') : undefined
        }
      >
        <MarkdownInline nodes={block.inlines} />
      </Heading>
    );
  }
  if (block.type === 'list') {
    return (
      <ul key={key} className={styles.list}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>
            <MarkdownInline nodes={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p key={key} className={styles.paragraph}>
      <MarkdownInline nodes={block.inlines} />
    </p>
  );
}

// The texts are static, so a block's position is a stable key.
export const MarkdownBlocks = memo(
  ({ blocks, testId = 'markdown-blocks' }: MarkdownBlocksProps) => (
    <div className={styles.blocks} data-testid={testId}>
      {blocks.map((block, index) =>
        renderBlock(block, `${block.type}-${index}`, testId),
      )}
    </div>
  ),
);

MarkdownBlocks.displayName = 'MarkdownBlocks';
