#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const tscBin = path.resolve(__dirname, 'node_modules', '.bin', os.platform() === 'win32' ? 'tsc.cmd' : 'tsc');
const tsconfig = path.resolve(__dirname, 'tsconfig.json');

try {
  execSync(`"${tscBin}" --build "${tsconfig}"`, {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });
} catch (e) {
  process.exit(1);
}
