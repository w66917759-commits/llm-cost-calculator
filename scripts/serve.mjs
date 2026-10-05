import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const files = new Map([
  ['/', ['../index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['../index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['../styles.css', 'text/css; charset=utf-8']],
  ['/src/app.mjs', ['../src/app.mjs', 'text/javascript; charset=utf-8']],
  ['/src/cost.mjs', ['../src/cost.mjs', 'text/javascript; charset=utf-8']],
]);
export function createPreviewServer() {
  return createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
    }
    let path;
    try { path = new URL(request.url, 'http://localhost').pathname; }
    catch { response.writeHead(400); response.end(); return; }
    const entry = files.get(path);
    if (!entry) { response.writeHead(404); response.end('Not found'); return; }
    try {
      const data = await readFile(new URL(entry[0], import.meta.url));
      response.writeHead(200, { 'Content-Type': entry[1], 'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'" });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch { response.writeHead(500); response.end('Unable to read preview asset'); }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
  const server = createPreviewServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`LLM Cost Calculator: http://127.0.0.1:${port}`));
}
