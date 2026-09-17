import { describe, it, expect, beforeEach } from 'vitest';
import { fetchEvents, fetchEventById, createNewEvent } from '@/server/services/eventService';
import { fetchEventSeats } from '@/server/services/seatService';
import { dbStore } from '@/server/repositories/db';

describe('Events & Seats Service Tests', () => {
  beforeEach(() => {
    dbStore.seedDefaults();
  });

  it('should fetch paginated published events', async () => {
    const res = await fetchEvents({ page: '1', limit: '10', status: 'PUBLISHED' });
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.pagination.total).toBe(10);
  });

  it('should fetch single event details with capacity and seat counts', async () => {
    const eventId = '11111111-1111-1111-1111-111111111111';
    const evt = await fetchEventById(eventId);
    expect(evt.id).toBe(eventId);
    expect(evt.title).toBe('Global Tech Summit 2026');
    expect(evt.capacity).toBe(40);
    expect(evt.availableSeats).toBe(40);
    expect(evt.bookedSeats).toBe(0);
  });

  it('should fetch seating matrix with AVAILABLE status', async () => {
    const eventId = '11111111-1111-1111-1111-111111111111';
    const result = await fetchEventSeats(eventId);
    expect(result.eventId).toBe(eventId);
    expect(result.seats.length).toBe(40);
    expect(result.seats[0].status).toBe('AVAILABLE');
  });

  it('should allow admin to create a new event with seat layout', async () => {
    const newEvt = await createNewEvent(
      {
        title: 'AI Robotics Expo',
        description: 'Latest innovations in robotics',
        venue: 'Tech Arena',
        eventDate: '2026-11-11',
        startTime: '10:00 AM',
        endTime: '04:00 PM',
        totalCapacity: 30,
        status: 'PUBLISHED',
      },
      '00000000-0000-0000-0000-000000000001'
    );

    expect(newEvt.id).toBeDefined();
    expect(newEvt.total_capacity).toBe(30);

    const seats = await fetchEventSeats(newEvt.id);
    expect(seats.seats.length).toBe(30);
  });
});
