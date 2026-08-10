import { createBookingSchema } from '../validators/schemas';
import { ValidationError } from '../utils/errors';
import * as db from '../repositories/db';

export async function createBooking(body: unknown, userId: string) {
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const { eventId, seatIds } = parsed.data;

  // Execute atomic transactional booking operation
  return db.createBookingAtomic({
    userId,
    eventId,
    seatIds,
  });
}

export async function fetchUserBookings(userId: string) {
  return db.getUserBookings(userId);
}

export async function fetchBookingById(bookingId: string, userId: string, isAdmin: boolean = false) {
  if (!bookingId) throw new ValidationError('Booking ID is required');
  return db.getBookingById(bookingId, userId, isAdmin);
}

export async function cancelBooking(bookingId: string, userId: string, isAdmin: boolean = false) {
  if (!bookingId) throw new ValidationError('Booking ID is required');
  return db.cancelBookingAtomic(bookingId, userId, isAdmin);
}
