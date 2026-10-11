// Usage: node scripts/cspHashes.mjs [client build directory] [output file]
//
// Runs after every build. React Router still writes inline <script> tags into the prerendered
// HTML (the router context, its stream, scroll restoration and the module bootstrap), so the
// Content-Security-Policy allows exactly those scripts by hash instead of 'unsafe-inline'.
// The hashes land next to the client build (not inside it); the deploy ships the file with the
// release and Caddy reads it into the CSP header on every request (infra/caddy).

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { listFiles } from './precompress.mjs';

const DEFAULT_DIR = fileURLToPath(new URL('../build/client', import.meta.url));
const DEFAULT_OUTPUT = fileURLToPath(
  new URL('../build/csp-script-hashes.txt', import.meta.url),
);
const INLINE_SCRIPT_PATTERN = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g;
const SRC_ATTRIBUTE = /\ssrc\s*=/i;
const TYPE_ATTRIBUTE = /\stype\s*=\s*["']?([^"'\s>]+)/i;
// Script types the browser executes, so the CSP applies to them; data blocks such as
// `application/ld+json` need no hash.
const EXECUTABLE_TYPES = new Set(['', 'module', 'text/javascript']);

function isExecutable(attributes) {
  const type = TYPE_ATTRIBUTE.exec(attributes)?.[1] ?? '';
  return EXECUTABLE_TYPES.has(type.toLowerCase());
}

export function inlineScripts(html) {
  return [...html.matchAll(INLINE_SCRIPT_PATTERN)]
    .filter(([, attributes = '', content]) => {
      return (
        content.length > 0 &&
        !SRC_ATTRIBUTE.test(attributes) &&
        isExecutable(attributes)
      );
    })
    .map(([, , content]) => content);
}

export function cspHash(content) {
  const digest = createHash('sha256').update(content, 'utf8').digest('base64');
  return `'sha256-${digest}'`;
}

export function collectCspHashes(dir) {
  const hashes = listFiles(dir)
    .filter((path) => path.endsWith('.html'))
    .flatMap((path) => inlineScripts(readFileSync(path, 'utf8')))
    .map(cspHash);
  return [...new Set(hashes)].sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , dir = DEFAULT_DIR, output = DEFAULT_OUTPUT] = process.argv;
  const hashes = collectCspHashes(dir);
  writeFileSync(output, `${hashes.join(' ')}\n`);
  process.stdout.write(
    `wrote ${hashes.length} CSP script hashes to ${output}\n`,
  );
}
