import { NextRequest } from 'next/server';
import { cancelBooking } from '@/server/services/bookingService';
import { requireAuth } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { bookingId } = await params;
    const result = await cancelBooking(bookingId, user.id, user.role === 'ADMIN');
    return apiSuccess(result, 'Booking cancelled successfully', 200);
  } catch (err) {
    return apiError(err);
  }
}
