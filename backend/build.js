#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const tsc = path.resolve(__dirname, 'node_modules', 'typescript', 'bin', 'tsc');
const tsconfig = path.resolve(__dirname, 'tsconfig.json');

try {
  execSync('node "' + tsc + '" --build "' + tsconfig + '"', {
    cwd: __dirname,
    stdio: 'inherit',
  });
} catch (e) {
  process.exit(1);
}
