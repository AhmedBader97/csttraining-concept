/**
 * @jest-environment node
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { metrics } from '../metrics';

function testFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return testFiles(full);
    return /\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

describe('metrics', () => {
  it('quotes the real number of tests on the How it was built page', () => {
    const count = testFiles(path.join(process.cwd(), 'src'))
      .map((file) => (readFileSync(file, 'utf8').match(/^\s*it\(/gm) ?? []).length)
      .reduce((sum, n) => sum + n, 0);
    expect(metrics.tests).toBe(count);
  });
});
