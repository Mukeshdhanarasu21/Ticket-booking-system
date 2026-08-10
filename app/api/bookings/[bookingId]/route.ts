import { NextRequest } from 'next/server';
import { fetchBookingById } from '@/server/services/bookingService';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { bookingId } = await params;
    const booking = await fetchBookingById(bookingId, user.id, user.role === 'ADMIN');
    return apiSuccess(booking, 'Booking details fetched', 200);
  } catch (err) {
    return apiError(err);
  }
}
