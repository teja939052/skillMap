#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const tscBin = path.resolve(__dirname, 'node_modules', '.bin', os.platform() === 'win32' ? 'tsc.cmd' : 'tsc');
const args = ['--project', path.resolve(__dirname, 'tsconfig.json')];

const child = spawn(tscBin, args, { stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code));
