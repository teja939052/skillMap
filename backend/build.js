#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const tsc = path.resolve(__dirname, '..', 'node_modules', '.bin', 'tsc.cmd');
const args = ['--project', path.resolve(__dirname, 'tsconfig.json')];

const child = spawn(tsc, args, { stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code));
