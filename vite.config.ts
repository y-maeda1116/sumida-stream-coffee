import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: '/sumida-stream-coffee/',
  build: {
    target: 'esnext',
  },
});
