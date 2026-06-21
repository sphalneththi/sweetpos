import { defineConfig } from 'electron-vite';
import { join } from 'path';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        external: ['bcrypt', 'better-sqlite3'],
        input: {
          index: join(__dirname, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: join(__dirname, 'src/preload/index.ts')
        }
      }
    }
  }
});
