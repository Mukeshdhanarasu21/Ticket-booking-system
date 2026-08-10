import { NextRequest } from 'next/server';
import { fetchEvents, createNewEvent } from '@/server/services/eventService';
import { requireAdmin } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const result = await fetchEvents(queryParams);
    return apiSuccess(result.data, 'Events fetched successfully', 200, result.pagination);
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);
    const body = await req.json();
    const event = await createNewEvent(body, adminUser.id);
    return apiSuccess(event, 'Event created successfully', 201);
  } catch (err) {
    return apiError(err);
  }
}
