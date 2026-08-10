import { NextRequest } from 'next/server';
import { createBooking, fetchUserBookings } from '@/server/services/bookingService';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const result = await createBooking(body, user.id);
    return apiSuccess({ booking: result }, 'Booking created successfully', 201);
  } catch (err) {
    return apiError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const bookings = await fetchUserBookings(user.id);
    return apiSuccess(bookings, 'Bookings fetched successfully', 200);
  } catch (err) {
    return apiError(err);
  }
}
