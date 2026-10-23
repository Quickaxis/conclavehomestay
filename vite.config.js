import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { handleHmsApiRequest } from './server/apiRouter.js'

function hmsApiPlugin() {
  return {
    name: 'hms-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/hms')) {
          try {
            await handleHmsApiRequest(req, res, next);
          } catch (err) {
            console.error('[Vite HMS Middleware Error]', err);
            next(err);
          }
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), hmsApiPlugin()],
})
