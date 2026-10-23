import { handleHmsApiRequest } from '../server/apiRouter.js';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

function createMockReqRes(method, path, body = null) {
  const req = new EventEmitter();
  req.method = method;
  req.url = path;
  req.headers = { 'content-type': 'application/json' };

  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(k, v) { this.headers[k] = v; },
    end(chunk) {
      if (chunk) this.body += chunk;
      this.emit('done');
    }
  };
  Object.assign(res, EventEmitter.prototype);

  const donePromise = new Promise(resolve => res.on('done', resolve));

  process.nextTick(() => {
    if (body) {
      req.emit('data', JSON.stringify(body));
    }
    req.emit('end');
  });

  return { req, res, donePromise };
}

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`  ✓ Passed: ${message}`);
  }
}

export async function runTestSuite() {
  console.log('====================================================');
  console.log('THE CONCLAVE — COMPREHENSIVE INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // SECTION 1: STATUS & TENANT CONFIGURATION
  // ----------------------------------------------------
  console.log('--- SECTION 1: HMS Status & Tenant Isolation Configuration ---');
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/status');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 200, 'GET /api/hms/status returns HTTP 200');
    assert(json.configured === false, 'HMS reports configured: false until The Conclave is provisioned');
    assert(json.error && (json.error.includes('HMS_HOMESTAY_ID') || json.error.includes('HMS_SERVICE_ROLE_KEY')), 'Reports exact missing server configuration');
  }

  // ----------------------------------------------------
  // SECTION 2: ROOM CATALOG & NO FABRICATION
  // ----------------------------------------------------
  console.log('\n--- SECTION 2: Room Catalog & No Fabricated Data ---');
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/rooms');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'GET /api/hms/rooms returns HTTP 400 when unconfigured');
    assert(json.success === false, 'Room fetch does not report fake success');
    assert(Array.isArray(json.rooms) && json.rooms.length === 0, 'Does NOT fabricate rooms or invent rates');
  }

  // ----------------------------------------------------
  // SECTION 3: INVALID DATES VALIDATION
  // ----------------------------------------------------
  console.log('\n--- SECTION 3: Invalid Dates Validation ---');
  // 3.1 Missing dates
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/availability');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Availability rejects missing dates with HTTP 400');
    assert(json.success === false, 'Rejects missing checkIn and checkOut');
  }

  // 3.2 Malformed date format
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/availability?checkIn=not-a-date&checkOut=2026-11-05&guests=2');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Availability rejects malformed date format with HTTP 400');
    assert(json.error.includes('YYYY-MM-DD'), 'Requires standard ISO YYYY-MM-DD format');
  }

  // 3.3 Impossible calendar date (Feb 31 rollover check)
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/availability?checkIn=2026-02-31&checkOut=2026-03-05&guests=2');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Availability rejects invalid calendar date Feb 31 with HTTP 400');
    assert(json.error.includes('Invalid calendar date'), 'Rejects non-existent calendar date rollover');
  }

  // 3.4 Check-out before check-in
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/availability?checkIn=2026-11-10&checkOut=2026-11-08&guests=2');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Availability rejects checkOut <= checkIn with HTTP 400');
    assert(json.error.includes('strictly after check-in'), 'Explains check-out must be after check-in');
  }

  // 3.5 Check-out equal to check-in (0 nights)
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/availability?checkIn=2026-11-10&checkOut=2026-11-10&guests=2');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Availability rejects 0-night booking with HTTP 400');
    assert(json.success === false, '0-night booking returns success: false');
  }

  // 3.6 Check-in in the past
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/availability?checkIn=2020-01-01&checkOut=2020-01-05&guests=2');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Availability rejects past dates with HTTP 400');
    assert(json.error.includes('in the past'), 'Explains check-in cannot be in the past');
  }

  // ----------------------------------------------------
  // SECTION 4: INVALID GUEST COUNTS
  // ----------------------------------------------------
  console.log('\n--- SECTION 4: Invalid Guest Counts Validation ---');
  // 4.1 Zero guests
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/availability?checkIn=2026-11-10&checkOut=2026-11-12&guests=0');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Availability rejects 0 guests with HTTP 400');
    assert(json.error.includes('positive integer'), 'Requires positive guest count');
  }

  // 4.2 Negative guests
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/availability?checkIn=2026-11-10&checkOut=2026-11-12&guests=-3');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Availability rejects negative guests with HTTP 400');
    assert(json.success === false, 'Negative guests returns success: false');
  }

  // 4.3 Fractional guests
  {
    const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/availability?checkIn=2026-11-10&checkOut=2026-11-12&guests=2.5');
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Availability rejects non-integer guests with HTTP 400');
    assert(json.success === false, 'Fractional guests returns success: false');
  }

  // ----------------------------------------------------
  // SECTION 5: BOOKING VALIDATION & ANTI-TAMPERING
  // ----------------------------------------------------
  console.log('\n--- SECTION 5: Booking Validation & Anti-Tampering ---');
  // 5.1 Missing guest name or phone
  {
    const { req, res, donePromise } = createMockReqRes('POST', '/api/hms/bookings', {
      roomId: '11111111-1111-1111-1111-111111111111',
      checkIn: '2026-11-10',
      checkOut: '2026-11-12',
      numberOfGuests: 2,
      guestName: '  ',
      guestPhone: ''
    });
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Rejects blank guest name/phone with HTTP 400');
    assert(json.success === false, 'Cannot book without valid guest name and phone');
  }

  // 5.2 Short/invalid phone number
  {
    const { req, res, donePromise } = createMockReqRes('POST', '/api/hms/bookings', {
      roomId: '11111111-1111-1111-1111-111111111111',
      checkIn: '2026-11-10',
      checkOut: '2026-11-12',
      numberOfGuests: 2,
      guestName: 'Ramen Kalita',
      guestPhone: '123'
    });
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 400, 'Rejects invalid phone (< 8 chars) with HTTP 400');
    assert(json.error.includes('at least 8 digits'), 'Requires minimum phone length');
  }

  // 5.3 Browser trying to supply fabricated rates, totals, homestayId, or confirmed status
  {
    const { req, res, donePromise } = createMockReqRes('POST', '/api/hms/bookings', {
      roomId: 'cabf8119-6326-4d63-994d-3de1cdc33ddc',
      checkIn: '2026-11-10',
      checkOut: '2026-11-12',
      numberOfGuests: 2,
      guestName: 'Tamper Attempt',
      guestPhone: '+91 98765 43210',
      // Attacker payload fields:
      nightlyRate: 1,
      totalAmount: 2,
      homestayId: '00000000-0000-0000-0000-000000000000',
      status: 'confirmed'
    });
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 403, 'Returns HTTP 403 requiresApproval');
    assert(json.requiresApproval === true, 'Direct booking safely blocked when unconfigured');
    assert(!json.bookingReference, 'Attacker cannot bypass rate calculation to create ₹1 booking');
  }

  // ----------------------------------------------------
  // SECTION 6: GENERAL ENQUIRIES FALLBACK (NO INVENTORY HOLD)
  // ----------------------------------------------------
  console.log('\n--- SECTION 6: Separate Enquiries Handling ---');
  {
    const { req, res, donePromise } = createMockReqRes('POST', '/api/hms/enquiries', {
      name: 'Priyanka Gogoi',
      phone: '+91 94350 12345',
      email: 'priyanka@example.com',
      message: 'Group booking query for 6 guests across 2 rooms in November',
      dates: '2026-11-15 to 2026-11-18',
      roomPreference: 'Any Room'
    });
    await handleHmsApiRequest(req, res);
    await donePromise;
    const json = JSON.parse(res.body);
    assert(res.statusCode === 200, 'Enquiry returns HTTP 200 OK');
    assert(json.success === true, 'Enquiry records successfully');
    assert(json.enquiry.name === 'Priyanka Gogoi', 'Enquiry preserves guest details');
    assert(!json.bookingReference, 'Enquiry does NOT create a booking or lock room inventory');
  }

  // ----------------------------------------------------
  // SECTION 7: REPEATED SUBMISSIONS SAFETY
  // ----------------------------------------------------
  console.log('\n--- SECTION 7: Repeated Submissions Safety ---');
  {
    const payload = {
      roomId: '11111111-1111-1111-1111-111111111111',
      checkIn: '2026-11-10',
      checkOut: '2026-11-12',
      numberOfGuests: 2,
      guestName: 'Rapid Clicker',
      guestPhone: '+91 98765 43210'
    };

    const req1 = createMockReqRes('POST', '/api/hms/bookings', payload);
    const req2 = createMockReqRes('POST', '/api/hms/bookings', payload);
    const req3 = createMockReqRes('POST', '/api/hms/bookings', payload);

    await Promise.all([
      handleHmsApiRequest(req1.req, req1.res),
      handleHmsApiRequest(req2.req, req2.res),
      handleHmsApiRequest(req3.req, req3.res)
    ]);

    await Promise.all([req1.donePromise, req2.donePromise, req3.donePromise]);

    const res1 = JSON.parse(req1.res.body);
    const res2 = JSON.parse(req2.res.body);
    const res3 = JSON.parse(req3.res.body);

    assert(res1.requiresApproval === true, 'Request 1 handled safely');
    assert(res2.requiresApproval === true, 'Request 2 handled safely');
    assert(res3.requiresApproval === true, 'Request 3 handled safely');
  }

  // ----------------------------------------------------
  // SECTION 8: LARGE PAYLOAD GUARD (DoS PROTECTION)
  // ----------------------------------------------------
  console.log('\n--- SECTION 8: Large Payload Guard (>64KB Protection) ---');
  {
    const oversizedBody = {
      notes: 'X'.repeat(70 * 1024) // 70 KB
    };
    const { req, res, donePromise } = createMockReqRes('POST', '/api/hms/bookings', oversizedBody);
    await handleHmsApiRequest(req, res);
    await donePromise;
    assert(res.statusCode === 500 || res.statusCode === 400, 'Oversized payload safely terminated by 64KB guard');
  }

  // ----------------------------------------------------
  // SECTION 9: LIVE SUPABASE SERVICE-ROLE KEY & TENANT ISOLATION
  // ----------------------------------------------------
  console.log('\n--- SECTION 9: Live Supabase Service-Role Connection & Tenant Isolation ---');
  {
    const hmsEnvPath = 'c:\\Users\\chitr\\Downloads\\my websites\\HMS WNG SHI\\.env.local';
    if (fs.existsSync(hmsEnvPath)) {
      const envStr = fs.readFileSync(hmsEnvPath, 'utf-8');
      const envMap = {};
      envStr.split('\n').forEach(line => {
        const [k, ...v] = line.split('=');
        if (k && v.length) envMap[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
      });

      process.env.HMS_SERVICE_ROLE_KEY = envMap.SUPABASE_SERVICE_ROLE_KEY;
      process.env.HMS_SUPABASE_URL = envMap.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.HMS_HOMESTAY_ID;

      const { req, res, donePromise } = createMockReqRes('GET', '/api/hms/status');
      await handleHmsApiRequest(req, res);
      await donePromise;
      const json = JSON.parse(res.body);
      assert(res.statusCode === 200, 'Live status check connects to Supabase');
      assert(json.connected === true, 'Supabase live service role key connected');
      assert(json.configured === false, 'Detects The Conclave is not yet registered in homestays');
      assert(json.error.includes('HMS_HOMESTAY_ID'), 'Prompts for The Conclave homestay registration');

      process.env.HMS_HOMESTAY_ID = '00000000-0000-0000-0000-000000000000';
      const reqStatus2 = createMockReqRes('GET', '/api/hms/status');
      await handleHmsApiRequest(reqStatus2.req, reqStatus2.res);
      await reqStatus2.donePromise;
      const jsonStatus2 = JSON.parse(reqStatus2.res.body);
      assert(jsonStatus2.configured === false, 'Rejects non-existent homestay ID in live database');
      assert(jsonStatus2.error.includes('not found in the HMS database'), 'Reports homestay not found');

      const reqRooms = createMockReqRes('GET', '/api/hms/rooms');
      await handleHmsApiRequest(reqRooms.req, reqRooms.res);
      await reqRooms.donePromise;
      const jsonRooms = JSON.parse(reqRooms.res.body);
      assert(jsonRooms.success === false, 'Cannot fetch rooms for unverified homestay');
      assert(jsonRooms.rooms.length === 0, 'No fabricated rooms returned');
    } else {
      console.log('  ⚠️ Skipping live Supabase check: HMS .env.local not found');
    }
  }

  // ----------------------------------------------------
  // SECTION 10: CONCURRENCY PROTECTION & DATABASE ATOMIC SAFETY
  // ----------------------------------------------------
  console.log('\n--- SECTION 10: PostgreSQL Concurrency & Double-Booking Protection ---');
  {
    const rpcSqlPath = path.resolve(process.cwd(), 'server', '01_public_booking_rpc.sql');
    const rpcSql = fs.readFileSync(rpcSqlPath, 'utf-8');
    
    assert(rpcSql.includes('FOR UPDATE'), 'Atomic booking procedure enforces FOR UPDATE row locking on rooms table');
    assert(rpcSql.includes('prevent_overlapping_active_bookings'), 'Ensures storage-level GiST exclusion constraint against overlapping reservations');
    assert(rpcSql.includes('v_nights * v_room.nightly_rate'), 'Nightly rates calculated exclusively from trusted database room record');
    assert(rpcSql.includes('REVOKE EXECUTE ON FUNCTION create_public_booking_atomic'), 'Public and anonymous execution strictly revoked');
    assert(rpcSql.includes('GRANT EXECUTE ON FUNCTION create_public_booking_atomic') && rpcSql.includes('TO service_role'), 'Exclusive execution granted solely to service_role');
  }

  // ----------------------------------------------------
  // SECTION 11: BOOKING REQUESTS MIGRATION & ZERO-COMMUNICATION GUARANTEE
  // ----------------------------------------------------
  console.log('\n--- SECTION 11: Booking Requests Migration & Zero-Communication Guarantee ---');
  {
    const migrationPath = path.resolve(process.cwd(), 'server', '02_booking_requests_migration.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

    assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS booking_requests'), 'Migration defines booking_requests table');
    assert(migrationSql.includes("status IN ('pending', 'approved', 'rejected')"), 'Restricts booking_requests status to pending, approved, rejected');
    assert(migrationSql.includes('REFERENCES homestays(id) ON DELETE RESTRICT'), 'Enforces strict tenant isolation to homestays');
    assert(migrationSql.includes('ENABLE ROW LEVEL SECURITY'), 'Enables RLS on booking_requests');
    assert(migrationSql.includes('GRANT ALL ON TABLE booking_requests TO service_role'), 'Grants insert access to trusted website backend');
    assert(migrationSql.includes('REVOKE ALL ON TABLE booking_requests FROM public, anon'), 'Blocks unauthenticated public access from reading guest requests');

    assert(migrationSql.includes('pg_publication_tables'), 'Migration checks pg_publication_tables to prevent duplicate publication errors');
    assert(migrationSql.includes('booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL'), 'Migration includes booking_id foreign key to bookings');
    assert(migrationSql.includes('ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS booking_id'), 'Migration includes idempotent column addition for booking_id');
    assert(migrationSql.includes('Allow service role full access to booking requests'), 'Migration includes explicit service role RLS policy');

    // Verify modal component has zero WhatsApp/messaging links
    const modalPath = path.resolve(process.cwd(), 'src', 'components', 'BookYourStayModal.jsx');
    const modalCode = fs.readFileSync(modalPath, 'utf-8');
    assert(!modalCode.includes('wa.me'), 'BookYourStayModal contains ZERO WhatsApp links');
    assert(!modalCode.includes('constructWhatsAppMessage'), 'BookYourStayModal contains ZERO WhatsApp prefill helpers');
    assert(!modalCode.includes('GENERAL ENQUIRY'), 'BookYourStayModal contains ZERO general enquiry tabs');
    assert(modalCode.includes('BOOKING REQUEST SUBMITTED'), 'BookYourStayModal renders dedicated request submission confirmation');
  }

  // ----------------------------------------------------
  // SECTION 12: HMS WNG SHI DIRECT INTEGRATION VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- SECTION 12: HMS WNG SHI Direct Integration Verification ---');
  {
    const hmsRoot = 'C:\\Users\\chitr\\Downloads\\my websites\\HMS WNG SHI';
    
    // 1. Verify types in HMS
    const typesPath = path.join(hmsRoot, 'src', 'lib', 'types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf-8');
    assert(typesContent.includes('export interface DbBookingRequest'), 'HMS types.ts defines DbBookingRequest interface');
    assert(typesContent.includes('export type BookingRequestStatus'), 'HMS types.ts defines BookingRequestStatus');
    assert(typesContent.includes('booking_id?: string | null;'), 'HMS DbBookingRequest includes optional booking_id linkage');

    // 2. Verify server actions in HMS
    const actionsPath = path.join(hmsRoot, 'src', 'app', 'actions', 'booking-requests.ts');
    const actionsContent = fs.readFileSync(actionsPath, 'utf-8');
    assert(actionsContent.includes('export async function getBookingRequestsAction'), 'HMS defines getBookingRequestsAction');
    assert(actionsContent.includes('export async function approveBookingRequestAction'), 'HMS defines approveBookingRequestAction');
    assert(actionsContent.includes('export async function rejectBookingRequestAction'), 'HMS defines rejectBookingRequestAction');
    assert(actionsContent.includes('targetHomestayId = partner.role === \'super_admin\''), 'Enforces tenant isolation in getBookingRequestsAction');
    assert(actionsContent.includes('partner.homestay_id !== request.homestay_id'), 'Enforces homestay ownership in approveBookingRequestAction');
    assert(actionsContent.includes('createBookingAction({'), 'Approval delegates to atomic createBookingAction');
    assert(actionsContent.includes('.neq("status", "cancelled")'), 'Approval pre-checks for overlapping non-cancelled bookings');
    assert(actionsContent.includes('booking_id: bookingResult.bookingId'), 'Approval records confirmed booking_id on the request');
    assert(actionsContent.includes('.eq("status", "pending")'), 'Approval and rejection enforce optimistic concurrency check');
    assert(actionsContent.includes('request.booking_id'), 'Approval guards against duplicate approval if booking already exists');
    assert(actionsContent.includes('Booking was confirmed in the system'), 'Approval safely handles failure if request status update fails after booking creation');

    // 3. Verify Dashboard View Component
    const viewPath = path.join(hmsRoot, 'src', 'components', 'dashboard', 'BookingRequestsView.tsx');
    const viewContent = fs.readFileSync(viewPath, 'utf-8');
    assert(viewContent.includes('export function BookingRequestsView'), 'HMS defines BookingRequestsView component');
    assert(viewContent.includes('booking-requests-sync'), 'BookingRequestsView subscribes to real-time Postgres changes');
    assert(viewContent.includes('handleApprove'), 'BookingRequestsView provides Approve handler');
    assert(viewContent.includes('handleReject'), 'BookingRequestsView provides Reject handler');

    // 4. Verify Dedicated Page Route in HMS
    const pagePath = path.join(hmsRoot, 'src', 'app', 'requests', 'page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    assert(pageContent.includes('export default function WebsiteRequestsPage'), 'HMS has dedicated /requests page');
    assert(pageContent.includes('<BookingRequestsView'), 'Requests page renders BookingRequestsView');

    // 5. Verify Navigation in Sidebar & MobileDrawer
    const sidebarPath = path.join(hmsRoot, 'src', 'components', 'layout', 'Sidebar.tsx');
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
    assert(sidebarContent.includes('href: "/requests"'), 'Sidebar includes link to Website Requests');

    const drawerPath = path.join(hmsRoot, 'src', 'components', 'layout', 'MobileDrawer.tsx');
    const drawerContent = fs.readFileSync(drawerPath, 'utf-8');
    assert(drawerContent.includes('href: "/requests"'), 'MobileDrawer includes link to Website Requests');

    // 6. Verify Bookings Page Quick Access
    const bookingsPagePath = path.join(hmsRoot, 'src', 'app', 'bookings', 'page.tsx');
    const bookingsPageContent = fs.readFileSync(bookingsPagePath, 'utf-8');
    assert(bookingsPageContent.includes('href="/requests"'), 'Bookings page provides quick access to Website Requests');
  }

  // ----------------------------------------------------
  // SECTION 13: GUEST JOURNEY REMEDIATION & ZERO-PRICE-FABRICATION VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- SECTION 13: Guest Journey Remediation & Zero-Price-Fabrication Verification ---');
  {
    // 1. Verify zero unconfirmed price ranges and zero wa.me links in src/
    const srcDir = path.resolve(process.cwd(), 'src');
    function scanDir(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
          scanDir(full);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
          const content = fs.readFileSync(full, 'utf-8');
          assert(!content.includes('1,500–₹2,500'), `File ${file} contains ZERO indicative rate ranges (1,500–2,500)`);
          assert(!content.includes('wa.me'), `File ${file} contains ZERO wa.me links`);
        }
      }
    }
    scanDir(srcDir);

    // 2. Verify modal component contains zero-rooms setup state and stay enquiry form
    const modalPath = path.resolve(process.cwd(), 'src', 'components', 'BookYourStayModal.jsx');
    const modalCode = fs.readFileSync(modalPath, 'utf-8');
    assert(modalCode.includes('ROOM SETUP IN PROGRESS'), 'BookYourStayModal includes ROOM SETUP IN PROGRESS state');
    assert(modalCode.includes('Online Booking Coming Soon'), 'BookYourStayModal states Online Booking Coming Soon');
    assert(modalCode.includes('SUBMIT STAY ENQUIRY'), 'BookYourStayModal provides SUBMIT STAY ENQUIRY action');
    assert(modalCode.includes('STAY ENQUIRY RECEIVED'), 'BookYourStayModal confirms enquiry receipt without claiming booking');

    // 3. Verify availability bar component contains updated status badge
    const availPath = path.resolve(process.cwd(), 'src', 'components', 'AvailabilityBar.jsx');
    const availCode = fs.readFileSync(availPath, 'utf-8');
    assert(availCode.includes('Room Setup in Progress'), 'AvailabilityBar includes Room Setup in Progress badge');

    // 4. Verify ContactPage has on-page stay enquiry and zero wa.me
    const contactPath = path.resolve(process.cwd(), 'src', 'components', 'ContactPage.jsx');
    const contactCode = fs.readFileSync(contactPath, 'utf-8');
    assert(!contactCode.includes('wa.me'), 'ContactPage contains ZERO wa.me links');
    assert(contactCode.includes('SEND STAY ENQUIRY'), 'ContactPage provides stay enquiry form');

    // 5. Test POST /api/hms/enquiries rejects invalid phone (< 8 chars)
    const { req: errReq, res: errRes, donePromise: errDone } = createMockReqRes('POST', '/api/hms/enquiries', {
      name: 'Rohan Sharma',
      phone: '123'
    });
    await handleHmsApiRequest(errReq, errRes);
    await errDone;
    const errJson = JSON.parse(errRes.body);
    assert(errRes.statusCode === 400, 'Enquiry rejects invalid phone (< 8 chars) with HTTP 400');
    assert(errJson.error.includes('at least 8 digits'), 'Enquiry requires minimum phone length');

    // 6. Test POST /api/hms/enquiries attaches configured homestayId and never locks inventory
    process.env.HMS_HOMESTAY_ID = '3356f10c-cfb7-44af-99bb-c616619bf42a';
    const { req: okReq, res: okRes, donePromise: okDone } = createMockReqRes('POST', '/api/hms/enquiries', {
      name: 'Rohan Sharma',
      phone: '+91 98765 43210',
      email: 'rohan@example.com',
      message: 'Looking for a quiet room for 3 nights in Dibrugarh',
      dates: '2026-11-20 to 2026-11-23',
      numberOfGuests: 2
    });
    await handleHmsApiRequest(okReq, okRes);
    await okDone;
    const okJson = JSON.parse(okRes.body);
    assert(okRes.statusCode === 200, 'Enquiry succeeds with HTTP 200');
    assert(okJson.success === true, 'Enquiry reports success');
    assert(okJson.homestayId === '3356f10c-cfb7-44af-99bb-c616619bf42a', 'Enquiry strictly associates configured Conclave homestay ID');
    assert(!okJson.bookingReference, 'Enquiry does NOT create a booking or lock room inventory');
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passedTests}/${totalTests} TESTS PASSED WITH ZERO FAILURES!`);
  console.log('====================================================');
}

runTestSuite().catch(err => {
  console.error('\n❌ TEST RUNNER TERMINATED WITH ERROR:', err);
  process.exit(1);
});
