import { NextRequest } from 'next/server';
import { fetchEventSeats } from '@/server/services/seatService';
import { requireAdmin } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    await requireAdmin(req);
    const { eventId } = await params;
    const result = await fetchEventSeats(eventId);
    return apiSuccess(result, 'Admin seat status fetched', 200);
  } catch (err) {
    return apiError(err);
  }
}
