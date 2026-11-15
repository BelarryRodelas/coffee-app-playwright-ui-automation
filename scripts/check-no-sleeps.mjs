// Fails the build if anyone adds a hard-coded wait. Works on Windows, macOS and Linux.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = /waitForTimeout|setTimeout|\bsleep\s*\(/;
const FOLDERS = ['src', 'tests'];
const offenders = [];

function scan(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) scan(path);
    else if (path.endsWith('.ts')) {
      readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
        if (FORBIDDEN.test(line)) offenders.push(`${path}:${i + 1}  ${line.trim()}`);
      });
    }
  }
}

FOLDERS.forEach(scan);

if (offenders.length) {
  console.error('Hard-coded waits are not allowed. Use auto-waiting locators and web-first assertions instead:\n');
  console.error(offenders.join('\n'));
  process.exit(1);
}
console.log('No hard-coded waits found.');
