// Usage: node scripts/checkEnvFiles.mjs [repoDir]

import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';

const ENV_FILE_PATTERN = /^\.env(\..+)?$/;
const ALLOWED_ENV_FILE = '.env.example';

function listTrackedFiles(repoDir) {
  return execFileSync('git', ['ls-files', '-z'], {
    cwd: repoDir,
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean);
}

function isRealEnvFile(path) {
  const name = basename(path);

  return ENV_FILE_PATTERN.test(name) && name !== ALLOWED_ENV_FILE;
}

const repoDir = process.argv[2] ?? process.cwd();
const trackedEnvFiles = listTrackedFiles(repoDir).filter(isRealEnvFile);

if (trackedEnvFiles.length > 0) {
  process.stderr.write(
    `env check failed, tracked env files:\n${trackedEnvFiles.join('\n')}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write('env check passed\n');
}
