"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const path_1 = __importDefault(require("path"));
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/index.ts'],
        },
    },
    resolve: {
        alias: {
            '@skill-map/contracts': path_1.default.resolve(__dirname, '../../packages/contracts/src'),
            '@skill-map/config': path_1.default.resolve(__dirname, '../../packages/config/src'),
            '@skill-map/utils': path_1.default.resolve(__dirname, '../../packages/utils/src'),
        },
    },
});
