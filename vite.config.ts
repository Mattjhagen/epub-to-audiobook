import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isElectronMode = mode === 'electron'

  return {
    resolve: {
      alias: {
        'kokoro-js': path.join(__dirname, 'node_modules/kokoro-js/dist/kokoro.web.js'),
      },
    },
    plugins: [
      react(),
      ...(isElectronMode
        ? [
            electron({
              main: {
                entry: 'electron/main.ts',
              },
              preload: {
                input: path.join(__dirname, 'electron/preload.ts'),
              },
              renderer: process.env.NODE_ENV === 'test' ? undefined : {},
            }),
          ]
        : []),
    ],
  }
})
