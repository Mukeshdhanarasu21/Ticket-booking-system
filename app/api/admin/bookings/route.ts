import { NextRequest } from 'next/server';
import { fetchAllBookings } from '@/server/services/adminService';
import { requireAdmin } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const bookings = await fetchAllBookings();
    return apiSuccess(bookings, 'All system bookings fetched', 200);
  } catch (err) {
    return apiError(err);
  }
}
