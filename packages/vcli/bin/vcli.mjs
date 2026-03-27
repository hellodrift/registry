#!/usr/bin/env node

// Use Node's built-in TypeScript support
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entry = path.join(__dirname, '..', 'src', 'index.ts');

try {
  execFileSync(process.execPath, [
    '--experimental-strip-types',
    '--experimental-transform-types',
    '--no-warnings',
    entry,
    ...process.argv.slice(2),
  ], { stdio: 'inherit' });
} catch (e) {
  // execFileSync throws on non-zero exit — exit code already propagated via stdio
  process.exit(e.status ?? 1);
}
