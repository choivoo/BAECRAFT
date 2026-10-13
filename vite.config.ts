/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  test: { environment: 'jsdom', globals: true, include: ['tests/**/*.test.ts?(x)'] },
});
