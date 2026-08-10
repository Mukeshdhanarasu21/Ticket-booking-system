import { NextRequest } from 'next/server';
import { fetchEventSeats } from '@/server/services/seatService';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const result = await fetchEventSeats(eventId);
    return apiSuccess(result, 'Seats fetched successfully', 200);
  } catch (err) {
    return apiError(err);
  }
}
