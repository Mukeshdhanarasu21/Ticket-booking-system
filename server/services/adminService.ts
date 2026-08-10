import * as db from '../repositories/db';

export async function fetchDashboardStats() {
  return db.getAdminDashboardStats();
}

export async function fetchAllBookings() {
  const allBookings = Array.from(db.dbStore.bookings.values());
  const result = [];

  for (const b of allBookings) {
    const user = db.dbStore.profiles.get(b.user_id);
    const event = db.dbStore.events.get(b.event_id);
    const seatNumbers: string[] = [];

    for (const bs of db.dbStore.bookingSeats.values()) {
      if (bs.booking_id === b.id) {
        const seat = db.dbStore.seats.get(bs.seat_id);
        if (seat) seatNumbers.push(seat.seat_number);
      }
    }

    result.push({
      id: b.id,
      bookingReference: b.booking_reference,
      user: user
        ? {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
          }
        : { id: b.user_id, fullName: 'Unknown User', email: '' },
      event: event
        ? {
            id: event.id,
            title: event.title,
            eventDate: event.event_date,
          }
        : { id: b.event_id, title: 'Unknown Event', eventDate: '' },
      status: b.status,
      totalSeats: b.total_seats,
      seats: seatNumbers,
      createdAt: b.created_at,
    });
  }

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return result;
}
