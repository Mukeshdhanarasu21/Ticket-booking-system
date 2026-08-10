import { ValidationError } from '../utils/errors';
import * as db from '../repositories/db';

export async function fetchEventSeats(eventId: string) {
  if (!eventId) throw new ValidationError('Event ID is required');
  const seats = await db.getEventSeats(eventId);
  return {
    eventId,
    seats,
  };
}
