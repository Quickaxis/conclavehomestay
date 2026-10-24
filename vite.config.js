import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
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
export default defineConfig(({ mode }) => {
  // Load server-side HMS environment variables for the Node API middleware
  // Without exposing secrets to client code (no define, no VITE_* prefix, no client imports)
  const env = loadEnv(mode, process.cwd(), '');
  const serverKeys = [
    'HMS_SUPABASE_URL',
    'HMS_SERVICE_ROLE_KEY',
    'HMS_HOMESTAY_ID',
    'CONCLAVE_SUPABASE_URL',
    'CONCLAVE_SERVICE_ROLE_KEY',
    'CONCLAVE_HOMESTAY_ID',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PORT'
  ];

  for (const key of serverKeys) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }

  return {
    plugins: [react(), hmsApiPlugin()],
  };
})
