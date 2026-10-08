// sql.js runs SQLite in the browser from a WebAssembly file. Copy the files into
// public/ so the compliance dashboard can load them from the site itself.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'node_modules', 'sql.js', 'dist');
const publicDir = join(root, 'public');

for (const file of ['sql-wasm.wasm', 'sql-wasm-browser.wasm']) {
  const source = join(dist, file);
  if (!existsSync(source)) continue;
  mkdirSync(publicDir, { recursive: true });
  copyFileSync(source, join(publicDir, file));
}
