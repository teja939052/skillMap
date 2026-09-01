#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const tsconfig = path.resolve(__dirname, 'tsconfig.json');

try {
  execSync('npx tsc --build "' + tsconfig + '"', {
    cwd: __dirname,
    stdio: 'inherit',
  });
} catch (e) {
  process.exit(1);
}
