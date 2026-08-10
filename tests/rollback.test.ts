import { describe, it, expect, beforeEach } from 'vitest';
import { createBookingAtomic, dbStore, getEventSeats } from '@/server/repositories/db';
import { SeatAlreadyBookedError } from '@/server/utils/errors';

describe('CRITICAL BOOKING LOGIC: Atomic Transaction Rollback', () => {
  beforeEach(() => {
    dbStore.seedDefaults();
  });

  it('ROLLBACK TEST: Partial booking fails atomically if one requested seat is unavailable', async () => {
    const eventId = '11111111-1111-1111-1111-111111111111';
    const user1 = '00000000-0000-0000-0000-000000000002';
    const user2 = '00000000-0000-0000-0000-000000000001';

    const seats = await getEventSeats(eventId);
    const seatA1 = seats.find((s) => s.seatNumber === 'A1')!;
    const seatA2 = seats.find((s) => s.seatNumber === 'A2')!;
    const seatA3 = seats.find((s) => s.seatNumber === 'A3')!;

    // Step 1: User 1 books seat A2 first
    await createBookingAtomic({
      userId: user1,
      eventId,
      seatIds: [seatA2.id],
    });

    const initialBookingCount = dbStore.bookings.size;
    const initialBookingSeatsCount = dbStore.bookingSeats.size;

    // Step 2: User 2 attempts to book seats [A1, A2, A3] (where A2 is already booked)
    await expect(
      createBookingAtomic({
        userId: user2,
        eventId,
        seatIds: [seatA1.id, seatA2.id, seatA3.id],
      })
    ).rejects.toThrow(SeatAlreadyBookedError);

    // Step 3: VERIFY ATOMIC ROLLBACK
    // No new bookings created
    expect(dbStore.bookings.size).toBe(initialBookingCount);

    // No new booking_seats records created for A1 or A3
    expect(dbStore.bookingSeats.size).toBe(initialBookingSeatsCount);

    // Seats A1 and A3 must remain AVAILABLE
    const finalSeats = await getEventSeats(eventId);
    expect(finalSeats.find((s) => s.seatNumber === 'A1')!.status).toBe('AVAILABLE');
    expect(finalSeats.find((s) => s.seatNumber === 'A2')!.status).toBe('BOOKED');
    expect(finalSeats.find((s) => s.seatNumber === 'A3')!.status).toBe('AVAILABLE');
  });
});
