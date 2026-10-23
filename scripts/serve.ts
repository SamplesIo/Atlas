// Minimal static server for the built site (dist/).
// It serves the live root class.toml and injects a tiny polling reloader, so
// editing class.toml updates the page automatically — no rebuild required.
//
// Usage: bun scripts/serve.ts [port]
const root = new URL('../dist/', import.meta.url)
const indexFile = new URL('index.html', root)
const sourceConfig = new URL('../class.toml', import.meta.url)

if (!(await Bun.file(indexFile).exists())) {
  console.error('未找到 dist/index.html，请先运行 `bun run build`。')
  process.exit(1)
}

if (!(await Bun.file(sourceConfig).exists())) {
  console.error('未找到根目录 class.toml。')
  process.exit(1)
}

const liveReloadScript = `<script>
(() => {
  let last = null;
  const check = async () => {
    try {
      const response = await fetch('/class.toml', { cache: 'no-store' });
      if (!response.ok) return;
      const text = await response.text();
      if (last !== null && text !== last) window.location.reload();
      last = text;
    } catch {}
  };
  check();
  setInterval(check, 1200);
})();
</script>`

const htmlResponse = async () => {
  const html = await Bun.file(indexFile).text()
  return new Response(html.replace('</body>', `${liveReloadScript}</body>`), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}

const port = Number(Bun.argv[2] ?? Bun.env.PORT ?? 4173)
const hostname = Bun.env.HOST ?? '127.0.0.1'

const server = Bun.serve({
  port,
  hostname,
  async fetch(request) {
    const pathname = decodeURIComponent(new URL(request.url).pathname)

    // Always serve the live source TOML, not the build-time snapshot.
    if (pathname === '/class.toml') {
      const configFile = Bun.file(sourceConfig)
      if (await configFile.exists()) {
        return new Response(configFile, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        })
      }
      return new Response('class.toml not found', { status: 404 })
    }

    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')

    if (relative === 'index.html') {
      return htmlResponse()
    }

    const fileUrl = new URL(relative, root)
    if (!fileUrl.href.startsWith(root.href)) {
      return new Response('Forbidden', { status: 403 })
    }

    const file = Bun.file(fileUrl)
    if (await file.exists()) {
      return new Response(file, {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'Cache-Control': relative.startsWith('assets/')
            ? 'public, max-age=31536000, immutable'
            : 'no-cache',
        },
      })
    }

    // History fallback for extensionless paths; missing assets stay 404.
    if (!relative.includes('.')) {
      return htmlResponse()
    }

    return new Response('Not found', { status: 404 })
  },
})

console.log(`Serving dist at http://${hostname}:${server.port}/`)
console.log(`Live TOML: ${Bun.file(sourceConfig).name ?? 'class.toml'}`)
