import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const classTomlPath = fileURLToPath(new URL('./class.toml', import.meta.url))

// The class data is read at runtime so editing class.toml never requires a
// rebuild. During development this middleware serves it and triggers a full
// reload on save; production builds emit a snapshot into dist/.
const classTomlPlugin = (): Plugin => ({
  name: 'class-toml',
  configureServer(server) {
    server.middlewares.use('/class.toml', (_request, response) => {
      response.setHeader('Content-Type', 'text/plain; charset=utf-8')
      response.setHeader('Cache-Control', 'no-store')
      response.end(readFileSync(classTomlPath, 'utf8'))
    })

    server.watcher.add(classTomlPath)
    server.watcher.on('change', (file) => {
      if (file.endsWith('class.toml')) {
        server.ws.send({ type: 'full-reload' })
      }
    })
  },
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'class.toml',
      source: readFileSync(classTomlPath, 'utf8'),
    })
  },
})

const base = process.env.VITE_BASE_PATH?.trim() || '/'

export default defineConfig({
  base,
  plugins: [react(), classTomlPlugin()],
  build: {
    // The province GeoJSON is inlined so the hero map can render immediately.
    chunkSizeWarningLimit: 1100,
  },
})
