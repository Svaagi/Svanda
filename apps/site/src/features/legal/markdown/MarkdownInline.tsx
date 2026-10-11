import { MarkdownLink } from './MarkdownLink';
import type { InlineNode } from './parseMarkdown';

export type MarkdownInlineProps = {
  nodes: InlineNode[];
};

// The texts are static, so a node's position is a stable key.
export function MarkdownInline({ nodes }: MarkdownInlineProps) {
  return nodes.map((node, index) => {
    const key = `${node.type}-${index}`;
    if (node.type === 'strong') return <strong key={key}>{node.text}</strong>;
    if (node.type === 'link') {
      return <MarkdownLink key={key} text={node.text} href={node.href} />;
    }
    return <span key={key}>{node.text}</span>;
  });
}
