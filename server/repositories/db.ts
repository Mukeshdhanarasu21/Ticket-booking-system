import { supabaseAdmin } from './supabaseClient';
import { SeatAlreadyBookedError, NotFoundError, ValidationError, ConflictError, ForbiddenError } from '../utils/errors';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  start_time: string;
  end_time: string;
  total_capacity: number;
  price: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SeatRecord {
  id: string;
  event_id: string;
  seat_number: string;
  row_number: string;
  section: string;
  seat_type: 'STANDARD' | 'PREMIUM' | 'VIP';
  created_at: string;
  status?: 'AVAILABLE' | 'BOOKED';
}

export interface BookingRecord {
  id: string;
  user_id: string;
  event_id: string;
  booking_reference: string;
  status: 'CONFIRMED' | 'CANCELLED';
  total_seats: number;
  created_at: string;
  updated_at: string;
  cancelled_at?: string | null;
  seats?: string[];
  event?: EventRecord;
}

export interface BookingSeatRecord {
  id: string;
  booking_id: string;
  seat_id: string;
  created_at: string;
}

// ----------------------------------------------------------------------------
// IN-MEMORY TRANSACTIONAL STORAGE ENGINE FOR STANDALONE RUNS & VITEST SUITES
// Uses a global singleton so the store survives Next.js hot-reloads in dev mode
// ----------------------------------------------------------------------------
class DatabaseStore {
  public profiles: Map<string, Profile> = new Map();
  public events: Map<string, EventRecord> = new Map();
  public seats: Map<string, SeatRecord> = new Map();
  public bookings: Map<string, BookingRecord> = new Map();
  public bookingSeats: Map<string, BookingSeatRecord> = new Map();

  // Mutex for simulating atomic DB transactions during concurrent Node requests
  private lockMutex = Promise.resolve();

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    this.profiles.clear();
    this.events.clear();
    this.seats.clear();
    this.bookings.clear();
    this.bookingSeats.clear();

    const adminId = '00000000-0000-0000-0000-000000000001';
    const userId = '00000000-0000-0000-0000-000000000002';

    this.profiles.set(adminId, {
      id: adminId,
      full_name: 'System Admin',
      email: 'admin@eventbooking.com',
      role: 'ADMIN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    this.profiles.set(userId, {
      id: userId,
      full_name: 'John Doe',
      email: 'user@eventbooking.com',
      role: 'USER',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const sampleEvents: Omit<EventRecord, 'created_at' | 'updated_at'>[] = [
      // ── Original 5 events — Tamil Nadu venues ──
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Global Tech Summit 2026',
        description: 'The premier technology conference showcasing modern AI, distributed computing, and cloud architecture — now in Chennai!',
        venue: 'Anna Centenary Library Auditorium, Kotturpuram, Chennai',
        event_date: '2026-09-15',
        start_time: '09:00 AM',
        end_time: '05:00 PM',
        total_capacity: 40,
        price: 2999,
        status: 'PUBLISHED',
        created_by: adminId,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Neon Nights Music Festival',
        description: 'An unforgettable night of synthwave, electronic beats, and immersive visual performances under the Chennai sky.',
        venue: 'Island Grounds Open Arena, Chennai',
        event_date: '2026-10-02',
        start_time: '07:00 PM',
        end_time: '11:30 PM',
        total_capacity: 60,
        price: 1499,
        status: 'PUBLISHED',
        created_by: adminId,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        title: 'Symphonic Masterpieces Live',
        description: 'Experience classical Carnatic and western orchestral elegance performed by the Tamil Nadu Philharmonic Orchestra.',
        venue: 'Kalaivanar Arangam, Anna Salai, Chennai',
        event_date: '2026-11-20',
        start_time: '06:30 PM',
        end_time: '09:30 PM',
        total_capacity: 100,
        price: 999,
        status: 'PUBLISHED',
        created_by: adminId,
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        title: 'Stand-up Comedy Gala',
        description: 'Laugh out loud with Tamil Nadu\'s top stand-up comedians and surprise celebrity guests live on stage.',
        venue: 'Nehru Indoor Stadium, Chennai',
        event_date: '2026-08-25',
        start_time: '08:00 PM',
        end_time: '10:00 PM',
        total_capacity: 50,
        price: 799,
        status: 'PUBLISHED',
        created_by: adminId,
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        title: 'Future of Web & AI Workshop',
        description: 'Hands-on interactive masterclass building high-performance web applications with AI — hosted at Coimbatore\'s tech hub.',
        venue: 'CODISSIA Trade Fair Complex, Avinashi Road, Coimbatore',
        event_date: '2026-12-05',
        start_time: '10:00 AM',
        end_time: '04:00 PM',
        total_capacity: 80,
        price: 4999,
        status: 'PUBLISHED',
        created_by: adminId,
      },

      // ── NEW: Concerts ──
      {
        id: '66666666-6666-6666-6666-666666666666',
        title: 'AR Rahman Live — Isai Mazhai Concert',
        description: 'Experience the magic of Oscar-winning maestro AR Rahman performing his greatest hits live in an open-air spectacular night concert.',
        venue: 'YMCA Ground, Nandanam, Chennai',
        event_date: '2026-09-27',
        start_time: '06:30 PM',
        end_time: '10:30 PM',
        total_capacity: 120,
        price: 2499,
        status: 'PUBLISHED',
        created_by: adminId,
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        title: 'Kollywood Stars Night — Award Gala Concert',
        description: 'A dazzling evening of live performances, award ceremonies, and appearances by your favourite Tamil cinema stars and playback singers.',
        venue: 'Jawaharlal Nehru Stadium, Periyamet, Chennai',
        event_date: '2026-10-18',
        start_time: '05:00 PM',
        end_time: '10:00 PM',
        total_capacity: 150,
        price: 1999,
        status: 'PUBLISHED',
        created_by: adminId,
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        title: 'Yuvan Shankar Raja — Rhythm of Youth',
        description: 'Chart-topping composer Yuvan Shankar Raja brings his electrifying beats and soulful melodies to Coimbatore in a night you will never forget.',
        venue: 'VOC Park & Stadium, Coimbatore',
        event_date: '2026-11-08',
        start_time: '07:00 PM',
        end_time: '11:00 PM',
        total_capacity: 90,
        price: 1499,
        status: 'PUBLISHED',
        created_by: adminId,
      },

      // ── NEW: Road Shows ──
      {
        id: '99999999-9999-9999-9999-999999999999',
        title: 'Chennai Grand Road Show 2026',
        description: 'The biggest street-level cultural extravaganza along the Marina Beach Promenade — live music, dance troupes, food stalls, and electric vehicle showcases.',
        venue: 'Marina Beach Promenade, Triplicane, Chennai',
        event_date: '2026-08-30',
        start_time: '04:00 PM',
        end_time: '09:00 PM',
        total_capacity: 200,
        price: 499,
        status: 'PUBLISHED',
        created_by: adminId,
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'Tamil Nadu Auto Expo Road Show',
        description: 'Witness the latest electric vehicles, supercars, and two-wheelers at Tamil Nadu\'s biggest automotive road show with live stunts and test drives.',
        venue: 'CODISSIA Trade Fair Complex, Avinashi Road, Coimbatore',
        event_date: '2026-12-20',
        start_time: '10:00 AM',
        end_time: '06:00 PM',
        total_capacity: 160,
        price: 299,
        status: 'PUBLISHED',
        created_by: adminId,
      },
    ];


    const now = new Date().toISOString();
    for (const evt of sampleEvents) {
      this.events.set(evt.id, { ...evt, created_at: now, updated_at: now });
      this.generateSeatsForEvent(evt.id, evt.total_capacity);
    }
  }

  public generateSeatsForEvent(eventId: string, capacity: number) {
    const getRowName = (index: number): string => {
      let name = '';
      let i = index;
      while (i >= 0) {
        name = String.fromCharCode(65 + (i % 26)) + name;
        i = Math.floor(i / 26) - 1;
      }
      return name;
    };

    const rowsNeeded = Math.ceil(capacity / 10);
    const now = new Date().toISOString();

    for (let i = 0; i < rowsNeeded; i++) {
      const rowChar = getRowName(i);
      for (let j = 1; j <= 10; j++) {
        const seatIndex = i * 10 + j;
        if (seatIndex <= capacity) {
          const seatNumber = `${rowChar}${j}`;
          let seatType: 'STANDARD' | 'PREMIUM' | 'VIP' = 'STANDARD';
          if (rowChar === 'A') seatType = 'VIP';
          else if (rowChar === 'B' || rowChar === 'C') seatType = 'PREMIUM';

          const seatHex = seatIndex.toString(16).padStart(12, '0');
          const prefix = eventId.length >= 24 ? eventId.substring(0, 24) : '00000000-0000-0000-0000-';
          const seatId = `${prefix}${seatHex}`;
          this.seats.set(seatId, {
            id: seatId,
            event_id: eventId,
            seat_number: seatNumber,
            row_number: rowChar,
            section: seatType,
            seat_type: seatType,
            created_at: now,
          });
        }
      }
    }
  }

  public async acquireLock<T>(task: () => Promise<T>): Promise<T> {
    let release: () => void = () => {};
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });

    const previousLock = this.lockMutex;
    this.lockMutex = (async () => {
      await previousLock;
      await nextLock;
    })();

    await previousLock;
    try {
      return await task();
    } finally {
      release();
    }
  }
}

// Attach to globalThis so the store survives Next.js hot-module-replacement
// In production (NODE_ENV=production) a fresh instance is always used
declare global {
  // eslint-disable-next-line no-var
  var __dbStore: DatabaseStore | undefined;
}

export const dbStore: DatabaseStore =
  process.env.NODE_ENV === 'production'
    ? new DatabaseStore()
    : (globalThis.__dbStore ??= new DatabaseStore());

// Always re-seed to ensure fix for undefined rows applies immediately
dbStore.seedDefaults();


// ----------------------------------------------------------------------------
// REPOSITORY METHODS
// ----------------------------------------------------------------------------

export async function getProfileById(userId: string): Promise<Profile | null> {
  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    return data;
  }
  return dbStore.profiles.get(userId) || null;
}

export async function createProfile(profileData: Partial<Profile>): Promise<Profile> {
  const profile: Profile = {
    id: profileData.id!,
    full_name: profileData.full_name || 'User',
    email: profileData.email!,
    role: profileData.role || 'USER',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (process.env.USE_LIVE_SUPABASE === 'true') {
    await supabaseAdmin.from('profiles').upsert(profile);
  }
  dbStore.profiles.set(profile.id, profile);
  return profile;
}

export async function getEvents(params: { page: number; limit: number; status?: string; search?: string }) {
  const { page, limit, status, search } = params;

  if (process.env.USE_LIVE_SUPABASE === 'true') {
    let query = supabaseAdmin.from('events').select('*', { count: 'exact' });
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('title', `%${search}%`);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await query.range(from, to).order('event_date', { ascending: true });

    if (error) throw error;
    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  let all = Array.from(dbStore.events.values());
  if (status) {
    all = all.filter((e) => e.status === status);
  }
  if (search) {
    const s = search.toLowerCase();
    all = all.filter((e) => e.title.toLowerCase().includes(s) || e.venue.toLowerCase().includes(s));
  }

  all.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  const total = all.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getEventById(eventId: string) {
  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { data: event, error } = await supabaseAdmin.from('events').select('*').eq('id', eventId).single();
    if (error || !event) throw new NotFoundError('Event not found');

    const { data: seats } = await supabaseAdmin.from('seats').select('id').eq('event_id', eventId);
    const seatIds = (seats || []).map((s) => s.id);

    const { count: bookedCount } = await supabaseAdmin
      .from('booking_seats')
      .select('id, bookings!inner(status)', { count: 'exact', head: true })
      .in('seat_id', seatIds)
      .eq('bookings.status', 'CONFIRMED');

    const totalSeats = seats?.length || event.total_capacity;
    const bookedSeats = bookedCount || 0;
    const availableSeats = Math.max(0, totalSeats - bookedSeats);

    return {
      ...event,
      capacity: event.total_capacity,
      bookedSeats,
      availableSeats,
    };
  }

  const event = dbStore.events.get(eventId);
  if (!event) throw new NotFoundError('Event not found');

  const eventSeats = Array.from(dbStore.seats.values()).filter((s) => s.event_id === eventId);
  const eventSeatIds = new Set(eventSeats.map((s) => s.id));

  let bookedCount = 0;
  for (const bs of dbStore.bookingSeats.values()) {
    if (eventSeatIds.has(bs.seat_id)) {
      const booking = dbStore.bookings.get(bs.booking_id);
      if (booking && booking.status === 'CONFIRMED') {
        bookedCount++;
      }
    }
  }

  const totalSeats = eventSeats.length || event.total_capacity;
  const availableSeats = Math.max(0, totalSeats - bookedCount);

  return {
    ...event,
    capacity: event.total_capacity,
    bookedSeats: bookedCount,
    availableSeats,
  };
}

export async function createEvent(eventData: Omit<EventRecord, 'id' | 'created_at' | 'updated_at'>) {
  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const record: EventRecord = {
    ...eventData,
    id: newId,
    created_at: now,
    updated_at: now,
  };

  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { error } = await supabaseAdmin.from('events').insert(record);
    if (error) throw error;
  }

  dbStore.events.set(newId, record);
  dbStore.generateSeatsForEvent(newId, record.total_capacity);

  return record;
}

export async function updateEvent(eventId: string, updateData: Partial<EventRecord>) {
  const existing = await getEventById(eventId);
  const now = new Date().toISOString();
  const updated: EventRecord = {
    ...existing,
    ...updateData,
    updated_at: now,
  };

  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { error } = await supabaseAdmin.from('events').update(updated).eq('id', eventId);
    if (error) throw error;
  }

  dbStore.events.set(eventId, updated);
  return updated;
}

export async function deleteEvent(eventId: string) {
  // Soft delete / cancel event
  return updateEvent(eventId, { status: 'CANCELLED' });
}

export async function getEventSeats(eventId: string) {
  // Ensure event exists
  await getEventById(eventId);

  let seats: SeatRecord[] = [];
  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { data, error } = await supabaseAdmin.from('seats').select('*').eq('event_id', eventId).order('seat_number');
    if (error) throw error;
    seats = data || [];
  } else {
    seats = Array.from(dbStore.seats.values()).filter((s) => s.event_id === eventId);
    seats.sort((a, b) => a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true }));
  }

  // Determine active booked seats
  const activeBookedSeatIds = new Set<string>();
  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const seatIds = seats.map((s) => s.id);
    if (seatIds.length > 0) {
      const { data: bookedBs } = await supabaseAdmin
        .from('booking_seats')
        .select('seat_id, bookings!inner(status)')
        .in('seat_id', seatIds)
        .eq('bookings.status', 'CONFIRMED');

      (bookedBs || []).forEach((item: any) => activeBookedSeatIds.add(item.seat_id));
    }
  } else {
    for (const bs of dbStore.bookingSeats.values()) {
      const booking = dbStore.bookings.get(bs.booking_id);
      if (booking && booking.status === 'CONFIRMED') {
        activeBookedSeatIds.add(bs.seat_id);
      }
    }
  }

  // Filter out any invalid or corrupted seats with 'undefined'
  const validSeats = seats.filter(
    (s) =>
      s.seat_number &&
      s.seat_number !== 'undefined' &&
      !s.seat_number.startsWith('undefined') &&
      s.row_number !== 'undefined'
  );

  return validSeats.map((s) => {
    const row = (s.row_number && s.row_number !== 'undefined')
      ? s.row_number
      : (s.seat_number ? s.seat_number.replace(/[0-9]/g, '') : 'A') || 'A';

    return {
      id: s.id,
      seatNumber: s.seat_number,
      row: row,
      section: s.section || 'STANDARD',
      seatType: s.seat_type || 'STANDARD',
      status: activeBookedSeatIds.has(s.id) ? ('BOOKED' as const) : ('AVAILABLE' as const),
    };
  });
}

// ----------------------------------------------------------------------------
// ATOMIC BOOKING FUNCTION (RPC EQUIVALENT)
// Guarantees atomic transaction execution & locks against race conditions
// ----------------------------------------------------------------------------
export async function createBookingAtomic(params: { userId: string; eventId: string; seatIds: string[] }) {
  const { userId, eventId, seatIds } = params;

  // 1. Validation
  if (!seatIds || seatIds.length === 0) {
    throw new ValidationError('At least one seat must be selected');
  }

  if (new Set(seatIds).size !== seatIds.length) {
    throw new ValidationError('Duplicate seat IDs in booking request');
  }

  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { data, error } = await supabaseAdmin.rpc('create_booking', {
      p_user_id: userId,
      p_event_id: eventId,
      p_seat_ids: seatIds,
    });

    if (error) {
      if (error.code === 'P0006' || error.message.includes('SEAT_ALREADY_BOOKED')) {
        throw new SeatAlreadyBookedError();
      }
      if (error.code === 'P0004' || error.message.includes('EVENT_NOT_AVAILABLE')) {
        throw new ConflictError('Event is not available for booking', 'EVENT_NOT_AVAILABLE');
      }
      throw error;
    }
    return data;
  }

  // In-memory atomic transaction wrapper using Mutex lock
  return dbStore.acquireLock(async () => {
    const event = dbStore.events.get(eventId);
    if (!event) throw new NotFoundError('Event not found');
    if (event.status !== 'PUBLISHED') throw new ConflictError('Event is not available for booking', 'EVENT_NOT_AVAILABLE');

    // Verify all requested seats exist and belong to eventId
    for (const sid of seatIds) {
      const seat = dbStore.seats.get(sid);
      if (!seat || seat.event_id !== eventId) {
        throw new ValidationError(`Seat ID ${sid} is invalid for this event`);
      }
    }

    // Check if ANY requested seat is already booked in an active CONFIRMED booking
    for (const sid of seatIds) {
      for (const bs of dbStore.bookingSeats.values()) {
        if (bs.seat_id === sid) {
          const booking = dbStore.bookings.get(bs.booking_id);
          if (booking && booking.status === 'CONFIRMED') {
            throw new SeatAlreadyBookedError();
          }
        }
      }
    }

    // Generate reference & Insert booking atomically
    const refCode = 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const bookingId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newBooking: BookingRecord = {
      id: bookingId,
      user_id: userId,
      event_id: eventId,
      booking_reference: refCode,
      status: 'CONFIRMED',
      total_seats: seatIds.length,
      created_at: now,
      updated_at: now,
    };

    const seatNumbers: string[] = [];
    const bsRecords: BookingSeatRecord[] = [];

    for (const sid of seatIds) {
      const seat = dbStore.seats.get(sid)!;
      seatNumbers.push(seat.seat_number);
      bsRecords.push({
        id: crypto.randomUUID(),
        booking_id: bookingId,
        seat_id: sid,
        created_at: now,
      });
    }

    // Commit records
    dbStore.bookings.set(bookingId, newBooking);
    for (const bsr of bsRecords) {
      dbStore.bookingSeats.set(bsr.id, bsr);
    }

    return {
      id: bookingId,
      bookingReference: refCode,
      eventId,
      userId,
      status: 'CONFIRMED' as const,
      totalSeats: seatIds.length,
      seats: seatNumbers,
      createdAt: now,
    };
  });
}

export async function getUserBookings(userId: string) {
  let bookings: BookingRecord[] = [];

  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, events(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    bookings = data || [];
  } else {
    bookings = Array.from(dbStore.bookings.values()).filter((b) => b.user_id === userId);
    bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Populate seats for each booking
  const result = [];
  for (const b of bookings) {
    const seatNumbers: string[] = [];
    if (process.env.USE_LIVE_SUPABASE === 'true') {
      const { data: bs } = await supabaseAdmin
        .from('booking_seats')
        .select('seat_id, seats(seat_number)')
        .eq('booking_id', b.id);
      (bs || []).forEach((item: any) => seatNumbers.push(item.seats?.seat_number));
    } else {
      for (const bs of dbStore.bookingSeats.values()) {
        if (bs.booking_id === b.id) {
          const seat = dbStore.seats.get(bs.seat_id);
          if (seat) seatNumbers.push(seat.seat_number);
        }
      }
    }

    const eventObj = b.event || (dbStore.events.get(b.event_id) as any);
    const price = Number(eventObj?.price ?? 0);
    result.push({
      id: b.id,
      bookingReference: b.booking_reference,
      eventId: b.event_id,
      status: b.status,
      totalSeats: b.total_seats,
      seats: seatNumbers,
      createdAt: b.created_at,
      price,
      totalAmount: price * b.total_seats,
      event: eventObj
        ? {
            id: eventObj.id,
            title: eventObj.title,
            venue: eventObj.venue,
            eventDate: eventObj.event_date,
            startTime: eventObj.start_time,
          }
        : undefined,
    });
  }

  return result;
}

export async function getBookingById(bookingId: string, userId: string, isAdmin: boolean = false) {
  let booking: BookingRecord | null = null;

  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, events(*)')
      .eq('id', bookingId)
      .single();
    if (error || !data) throw new NotFoundError('Booking not found');
    booking = data;
  } else {
    booking = dbStore.bookings.get(bookingId) || null;
  }

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (process.env.USE_LIVE_SUPABASE === 'true' && !isAdmin && booking.user_id !== userId) {
    throw new ForbiddenError('You do not have access to this booking');
  }


  const seatNumbers: string[] = [];
  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { data: bs } = await supabaseAdmin
      .from('booking_seats')
      .select('seat_id, seats(seat_number)')
      .eq('booking_id', booking.id);
    (bs || []).forEach((item: any) => seatNumbers.push(item.seats?.seat_number));
  } else {
    for (const bs of dbStore.bookingSeats.values()) {
      if (bs.booking_id === booking.id) {
        const seat = dbStore.seats.get(bs.seat_id);
        if (seat) seatNumbers.push(seat.seat_number);
      }
    }
  }

  const eventObj = booking.event || (dbStore.events.get(booking.event_id) as any);
  const price = Number(eventObj?.price ?? 0);

  return {
    id: booking.id,
    bookingReference: booking.booking_reference,
    eventId: booking.event_id,
    userId: booking.user_id,
    status: booking.status,
    totalSeats: booking.total_seats,
    seats: seatNumbers,
    createdAt: booking.created_at,
    cancelledAt: booking.cancelled_at,
    price,
    totalAmount: price * booking.total_seats,
    event: eventObj
      ? {
          id: eventObj.id,
          title: eventObj.title,
          description: eventObj.description,
          venue: eventObj.venue,
          eventDate: eventObj.event_date,
          startTime: eventObj.start_time,
          endTime: eventObj.end_time,
        }
      : undefined,
  };
}

export async function cancelBookingAtomic(bookingId: string, userId: string, isAdmin: boolean = false) {
  if (process.env.USE_LIVE_SUPABASE === 'true') {
    const { data, error } = await supabaseAdmin.rpc('cancel_booking', {
      p_booking_id: bookingId,
      p_user_id: userId,
      p_is_admin: isAdmin,
    });
    if (error) {
      if (error.message.includes('UNAUTHORIZED')) throw new ForbiddenError('Unauthorized booking access');
      if (error.message.includes('BOOKING_ALREADY_CANCELLED')) throw new ConflictError('Booking is already cancelled', 'BOOKING_ALREADY_CANCELLED');
      throw error;
    }
    return data;
  }

  return dbStore.acquireLock(async () => {
    const booking = dbStore.bookings.get(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');

    if (!isAdmin && booking.user_id !== userId) {
      throw new ForbiddenError('You do not have access to cancel this booking');
    }

    if (booking.status === 'CANCELLED') {
      throw new ConflictError('Booking is already cancelled', 'BOOKING_ALREADY_CANCELLED');
    }

    const now = new Date().toISOString();
    booking.status = 'CANCELLED';
    booking.cancelled_at = now;
    booking.updated_at = now;

    dbStore.bookings.set(bookingId, booking);

    return {
      id: booking.id,
      bookingReference: booking.booking_reference,
      status: 'CANCELLED' as const,
      cancelledAt: now,
    };
  });
}

export async function getAdminDashboardStats() {
  const events = Array.from(dbStore.events.values());
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'PUBLISHED').length;
  const cancelledEvents = events.filter((e) => e.status === 'CANCELLED').length;

  const totalSeats = Array.from(dbStore.seats.values()).length;
  let bookedSeats = 0;

  for (const bs of dbStore.bookingSeats.values()) {
    const booking = dbStore.bookings.get(bs.booking_id);
    if (booking && booking.status === 'CONFIRMED') {
      bookedSeats++;
    }
  }

  const availableSeats = Math.max(0, totalSeats - bookedSeats);
  const totalBookings = Array.from(dbStore.bookings.values()).filter((b) => b.status === 'CONFIRMED').length;
  const bookingRate = totalSeats > 0 ? `${((bookedSeats / totalSeats) * 100).toFixed(1)}%` : '0%';

  return {
    totalEvents,
    publishedEvents,
    cancelledEvents,
    totalBookings,
    totalSeats,
    bookedSeats,
    availableSeats,
    bookingRate,
  };
}
