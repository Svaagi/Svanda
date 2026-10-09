// Usage: node scripts/checkLegalTodos.mjs [file or directory ...]
//
// Runs before every build and warns, without failing it, while the legal identity or the
// legal texts still contain a TODO: a missing operator detail or a draft awaiting legal
// review. Both block launch, so the warning keeps them visible in every build log.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_DIR = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_TARGETS = [
  join(SITE_DIR, 'src/constants/legalIdentity.ts'),
  join(SITE_DIR, 'src/features/legal/content'),
];
const TODO_PATTERN = /\bTODO\b/;

function listFiles(target) {
  if (!statSync(target).isDirectory()) return [target];

  return readdirSync(target, { withFileTypes: true }).flatMap((entry) =>
    listFiles(join(target, entry.name)),
  );
}

function findTodos(file) {
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .flatMap((line, index) =>
      TODO_PATTERN.test(line)
        ? [`${relative(SITE_DIR, file)}:${index + 1}: ${line.trim()}`]
        : [],
    );
}

const [, , ...cliTargets] = process.argv;
const targets = cliTargets.length > 0 ? cliTargets : DEFAULT_TARGETS;
const todos = targets.flatMap(listFiles).flatMap(findTodos);

if (todos.length > 0) {
  process.stderr.write(
    `warning: ${todos.length} legal TODO(s) remain; resolve them before launch:\n${todos.join('\n')}\n`,
  );
}
