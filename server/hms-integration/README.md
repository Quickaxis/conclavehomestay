# HMS WNG SHI — Website Booking Requests Integration

This directory contains the prepared files to show incoming website booking requests directly inside the existing **HMS WNG SHI** dashboard.

## 1. Database Migration (Run in Supabase SQL Editor)
Run `server/02_booking_requests_migration.sql` in your Supabase SQL Editor to create:
- `booking_requests` table with strict status constraint (`pending`, `approved`, `rejected`)
- Tenant isolation policies (`homestay_id = get_user_homestay_id()`)
- Realtime publication so incoming requests pop up in the dashboard automatically

## 2. HMS Dashboard Integration (3 simple files)

### File A: `src/lib/types.ts`
Append the contents of `types-addition.ts` (`DbBookingRequest` interface) to `HMS WNG SHI/src/lib/types.ts`.

### File B: `src/app/actions/booking-requests.ts`
Copy `booking-requests-actions.ts` to `HMS WNG SHI/src/app/actions/booking-requests.ts`.
This provides:
- `getBookingRequestsAction()`: Fetches requests for the partner's homestay.
- `approveBookingRequestAction(requestId)`: Converts the request to a confirmed booking using existing `createBookingAction` and marks request approved.
- `rejectBookingRequestAction(requestId)`: Declines the request.

### File C: `src/app/bookings/page.tsx`
Import and use `<BookingRequestsView />` inside `HMS WNG SHI/src/app/bookings/page.tsx` as a tab next to "All Bookings".
Copy `BookingRequestsView.tsx` into `HMS WNG SHI/src/components/dashboard/BookingRequestsView.tsx`.
