import { describe, it, expect, beforeEach } from 'vitest';
import { createBookingAtomic, dbStore, getEventSeats } from '@/server/repositories/db';
import { SeatAlreadyBookedError } from '@/server/utils/errors';

describe('CRITICAL BOOKING LOGIC: Concurrency & Race-Condition Prevention', () => {
  beforeEach(() => {
    dbStore.seedDefaults();
  });

  it('SIMULTANEOUS BOOKING TEST: Only one user succeeds when two users book the same seat concurrently', async () => {
    const eventId = '11111111-1111-1111-1111-111111111111';
    const userA = '00000000-0000-0000-0000-000000000002';
    const userB = '00000000-0000-0000-0000-000000000001';

    // Get seat A1 ID for event 1
    const seats = await getEventSeats(eventId);
    const targetSeat = seats.find((s) => s.seatNumber === 'A1')!;
    expect(targetSeat).toBeDefined();

    // Fire SIMULTANEOUS booking requests for User A and User B for the EXACT SAME seat ID
    const promiseA = createBookingAtomic({
      userId: userA,
      eventId,
      seatIds: [targetSeat.id],
    });

    const promiseB = createBookingAtomic({
      userId: userB,
      eventId,
      seatIds: [targetSeat.id],
    });

    // Execute concurrently using Promise.allSettled
    const results = await Promise.allSettled([promiseA, promiseB]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // VERIFICATION REQUIREMENTS (Section 37 of prompt):
    // 1. Exactly ONE request must succeed.
    expect(fulfilled.length).toBe(1);

    // 2. Exactly ONE request must be rejected.
    expect(rejected.length).toBe(1);

    // 3. Rejected reason must be SEAT_ALREADY_BOOKED (409 Conflict)
    const rejectionReason = (rejected[0] as PromiseRejectedResult).reason;
    expect(rejectionReason).toBeInstanceOf(SeatAlreadyBookedError);
    expect(rejectionReason.code).toBe('SEAT_ALREADY_BOOKED');

    // 4. Verify Database Consistency: Exactly 1 confirmed booking and 1 booking_seat record
    const totalBookings = Array.from(dbStore.bookings.values()).filter(
      (b) => b.event_id === eventId && b.status === 'CONFIRMED'
    ).length;
    expect(totalBookings).toBe(1);

    const totalBookingSeats = Array.from(dbStore.bookingSeats.values()).length;
    expect(totalBookingSeats).toBe(1);

    // 5. Verify seat status is updated to BOOKED
    const updatedSeats = await getEventSeats(eventId);
    const updatedTargetSeat = updatedSeats.find((s) => s.seatNumber === 'A1')!;
    expect(updatedTargetSeat.status).toBe('BOOKED');
  });
});
