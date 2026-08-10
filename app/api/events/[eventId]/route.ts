import { NextRequest } from 'next/server';
import { fetchEventById, updateExistingEvent, softCancelEvent } from '@/server/services/eventService';
import { requireAdmin } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const event = await fetchEventById(eventId);
    return apiSuccess(event, 'Event details fetched', 200);
  } catch (err) {
    return apiError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    await requireAdmin(req);
    const { eventId } = await params;
    const body = await req.json();
    const updated = await updateExistingEvent(eventId, body);
    return apiSuccess(updated, 'Event updated successfully', 200);
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    await requireAdmin(req);
    const { eventId } = await params;
    const cancelled = await softCancelEvent(eventId);
    return apiSuccess(cancelled, 'Event cancelled successfully', 200);
  } catch (err) {
    return apiError(err);
  }
}
