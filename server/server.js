import http from 'http';
import fs from 'fs';
import path from 'path';
import { handleHmsApiRequest } from './apiRouter.js';

// Automatically load local .env if present (zero-dependency)
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server', '.env')
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    } catch (e) {
      console.warn('[Server] Could not parse .env file:', e.message);
    }
  }
}

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = reqUrl.pathname;

    // 1. Check if this is an API request
    if (pathname.startsWith('/api/hms')) {
      return handleHmsApiRequest(req, res);
    }

    // 2. Safely resolve static files from dist/
    let decodedPath = '';
    try {
      decodedPath = decodeURIComponent(pathname);
    } catch {
      res.statusCode = 400;
      return res.end('Bad Request');
    }

    const safeRelativePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
    const targetFile = safeRelativePath === '/' || safeRelativePath === '\\' ? 'index.html' : safeRelativePath;
    const resolvedPath = path.resolve(DIST_DIR, targetFile);

    // Guard against directory traversal
    if (!resolvedPath.startsWith(DIST_DIR)) {
      res.statusCode = 403;
      return res.end('Forbidden');
    }

    if (fs.existsSync(resolvedPath)) {
      try {
        const stats = fs.statSync(resolvedPath);
        if (stats.isFile()) {
          const ext = path.extname(resolvedPath).toLowerCase();
          res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
          return fs.createReadStream(resolvedPath).pipe(res);
        }
      } catch (statErr) {
        console.error('[Static Server Stat Error]', statErr);
      }
    }

    // 3. SPA Fallback: serve index.html for client-side routing
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return fs.createReadStream(indexPath).pipe(res);
    }

    res.statusCode = 404;
    res.end('Not Found. Please run "npm run build" first.');
  } catch (err) {
    console.error('[Production Server Error]', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`[The Conclave] Production server running at http://localhost:${PORT}`);
});
