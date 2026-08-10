import { NextRequest } from 'next/server';
import { fetchEvents } from '@/server/services/eventService';
import { requireAdmin } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const queryParams: Record<string, string> = { limit: '100' };
    searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const result = await fetchEvents(queryParams);
    return apiSuccess(result.data, 'Admin events list fetched', 200, result.pagination);
  } catch (err) {
    return apiError(err);
  }
}
