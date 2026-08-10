import { eventQuerySchema, createEventSchema, updateEventSchema } from '../validators/schemas';
import { ValidationError } from '../utils/errors';
import * as db from '../repositories/db';

export async function fetchEvents(queryParams: Record<string, string | string[] | undefined>) {
  const parsed = eventQuerySchema.safeParse(queryParams);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  return db.getEvents(parsed.data);
}

export async function fetchEventById(eventId: string) {
  if (!eventId) throw new ValidationError('Event ID is required');
  return db.getEventById(eventId);
}

export async function createNewEvent(body: unknown, adminId: string) {
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const { title, description, venue, eventDate, startTime, endTime, totalCapacity, price, status } = parsed.data;

  return db.createEvent({
    title,
    description,
    venue,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    total_capacity: totalCapacity,
    price: price ?? 0,
    created_by: adminId,
    status: status || 'PUBLISHED',
  });
}


export async function updateExistingEvent(eventId: string, body: unknown) {
  if (!eventId) throw new ValidationError('Event ID is required');
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  return db.updateEvent(eventId, parsed.data);
}

export async function softCancelEvent(eventId: string) {
  if (!eventId) throw new ValidationError('Event ID is required');
  return db.deleteEvent(eventId);
}
