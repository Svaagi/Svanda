import { Link } from 'react-router';

import styles from './markdown.module.css';

export type MarkdownLinkProps = {
  text: string;
  href: string;
};

const EXTERNAL_PATTERN = /^https?:\/\//;

// Site paths navigate in the app; web links open a new tab; `mailto:` stays a plain link.
export function MarkdownLink({ text, href }: MarkdownLinkProps) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} className={styles.link}>
        {text}
      </Link>
    );
  }
  if (EXTERNAL_PATTERN.test(href)) {
    return (
      <a
        href={href}
        className={styles.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    );
  }

  return (
    <a href={href} className={styles.link}>
      {text}
    </a>
  );
}
