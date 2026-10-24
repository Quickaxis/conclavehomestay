import { 
  getHmsStatus, 
  getVerifiedRooms, 
  getRoomAvailability, 
  createReservation, 
  createEnquiry 
} from './hmsClient.js';

/**
 * Connect/Express compatible API middleware for HMS endpoints.
 */
export async function handleHmsApiRequest(req, res, next) {
  // Resolve requested URL across Vercel serverless, Vite dev, and Node server
  const rawUrl = req.headers?.['x-forwarded-uri'] || req.headers?.['x-matched-path'] || req.url || '';
  const reqUrl = new URL(rawUrl, 'http://localhost');
  let pathname = reqUrl.pathname;

  // If invoked via Vercel dynamic catch-all route (api/hms/[...slug].js)
  if (req.query && req.query.slug && (!pathname || pathname === '/api/hms' || pathname === '/api/hms/' || !pathname.startsWith('/api/hms'))) {
    const slugPath = Array.isArray(req.query.slug) ? req.query.slug.join('/') : req.query.slug;
    pathname = `/api/hms/${slugPath}`;
  }

  // Only handle /api/hms/* requests
  if (!pathname || !pathname.startsWith('/api/hms')) {
    if (next) return next();
    return false;
  }

  // Set standard JSON & CORS headers for broad compatibility
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight if needed
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  const sendJson = (statusCode, data) => {
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
  };

  try {
    // 1. GET /api/hms/status
    if (pathname === '/api/hms/status' && req.method === 'GET') {
      const status = await getHmsStatus();
      return sendJson(200, status);
    }

    // 2. GET /api/hms/rooms
    if (pathname === '/api/hms/rooms' && req.method === 'GET') {
      const result = await getVerifiedRooms();
      return sendJson(result.success ? 200 : 400, result);
    }

    // 3. GET /api/hms/availability
    if (pathname === '/api/hms/availability' && req.method === 'GET') {
      const checkIn = reqUrl.searchParams.get('checkIn') || req.query?.checkIn;
      const checkOut = reqUrl.searchParams.get('checkOut') || req.query?.checkOut;
      const guests = reqUrl.searchParams.get('guests') || req.query?.guests;
      const result = await getRoomAvailability({ checkIn, checkOut, guests });
      return sendJson(result.success ? 200 : 400, result);
    }

    // Parse JSON body for POST requests with size guard (max 64KB)
    // Supports both pre-parsed req.body (Vercel serverless) and streams (Node/Vite)
    const parseBody = () => new Promise((resolve, reject) => {
      if (req.body && typeof req.body === 'object') {
        return resolve(req.body);
      }
      if (typeof req.body === 'string' && req.body.trim()) {
        try {
          return resolve(JSON.parse(req.body));
        } catch {
          return resolve({});
        }
      }

      let body = '';
      let size = 0;
      const MAX_SIZE = 64 * 1024;

      req.on('data', chunk => {
        size += chunk.length;
        if (size > MAX_SIZE) {
          if (typeof req.destroy === 'function') req.destroy();
          return reject(new Error('Payload too large'));
        }
        body += chunk;
      });

      req.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch {
          resolve({});
        }
      });

      req.on('error', reject);
    });

    // 4. POST /api/hms/bookings
    if (pathname === '/api/hms/bookings' && req.method === 'POST') {
      const body = await parseBody();
      const result = await createReservation(body);
      const statusCode = result.success ? 201 : (result.requiresApproval ? 403 : 400);
      return sendJson(statusCode, result);
    }

    // 5. POST /api/hms/enquiries
    if (pathname === '/api/hms/enquiries' && req.method === 'POST') {
      const body = await parseBody();
      const result = await createEnquiry(body);
      return sendJson(result.success ? 200 : 400, result);
    }

    // 404 for unknown /api/hms routes
    return sendJson(404, { error: 'Not Found' });
  } catch (err) {
    console.error('[API Router Error]', err);
    return sendJson(500, { error: 'Internal server error', details: err.message });
  }
}
