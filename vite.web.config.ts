import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Minimal config for Web Build (Render/GHPages)
export default defineConfig({
    base: './',
    resolve: {
        alias: {
            'kokoro-js': path.join(__dirname, 'node_modules/kokoro-js/dist/kokoro.web.js'),
        },
    },
    plugins: [
        react(),
        nodePolyfills(),
    ],
    build: {
        outDir: 'dist-web',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            },
        },
    }
})
