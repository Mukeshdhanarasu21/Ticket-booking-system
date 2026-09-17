-- ============================================================================
-- EVENT BOOKING SYSTEM - DATABASE MIGRATION
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. EVENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    venue TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    price NUMERIC(10, 2) NOT NULL DEFAULT 49.99 CHECK (price >= 0),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. SEATS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    row_number TEXT NOT NULL,
    section TEXT NOT NULL DEFAULT 'STANDARD',
    seat_type TEXT NOT NULL DEFAULT 'STANDARD' CHECK (seat_type IN ('STANDARD', 'PREMIUM', 'VIP')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_event_seat UNIQUE (event_id, seat_number)
);

-- ----------------------------------------------------------------------------
-- 4. BOOKINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
    booking_reference TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 5. BOOKING_SEATS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES public.seats(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

CREATE INDEX IF NOT EXISTS idx_seats_event_id ON public.seats(event_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);

CREATE INDEX IF NOT EXISTS idx_booking_seats_booking_id ON public.booking_seats(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_seats_seat_id ON public.booking_seats(seat_id);

-- Partial Unique Index: Prevent active duplicate seat bookings at DB schema level
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_seat_booking 
ON public.booking_seats (seat_id) 
WHERE EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_seats.booking_id AND b.status = 'CONFIRMED'
);

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_seats ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by owner or admin"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Events Policies
CREATE POLICY "Published events are viewable by everyone"
    ON public.events FOR SELECT
    USING (status = 'PUBLISHED' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can insert events"
    ON public.events FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can update events"
    ON public.events FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admins can delete events"
    ON public.events FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Seats Policies
CREATE POLICY "Seats are viewable by authenticated users"
    ON public.seats FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert seats"
    ON public.seats FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Bookings Policies
CREATE POLICY "Users can view their own bookings"
    ON public.bookings FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Users can insert their own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings"
    ON public.bookings FOR UPDATE
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Booking Seats Policies
CREATE POLICY "Users can view booking seats"
    ON public.booking_seats FOR SELECT
    USING (true);

-- ----------------------------------------------------------------------------
-- 8. ATOMIC DATABASE RPC FUNCTIONS (CRITICAL BOOKING LOGIC)
-- ----------------------------------------------------------------------------

-- Function: create_booking
-- Atomically validates event, seat availability, locks rows, and creates booking.
CREATE OR REPLACE FUNCTION public.create_booking(
    p_user_id UUID,
    p_event_id UUID,
    p_seat_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event_status TEXT;
    v_seat_count INTEGER;
    v_already_booked_count INTEGER;
    v_invalid_event_seats_count INTEGER;
    v_booking_id UUID;
    v_ref_code TEXT;
    v_seat_id UUID;
    v_seat_numbers TEXT[];
    v_result JSONB;
BEGIN
    -- 1. Validate seat list length
    IF p_seat_ids IS NULL OR array_length(p_seat_ids, 1) IS NULL OR array_length(p_seat_ids, 1) = 0 THEN
        RAISE EXCEPTION 'NO_SEATS_SELECTED' USING ERRCODE = 'P0001';
    END IF;

    -- 2. Validate duplicate seats in array
    IF (SELECT COUNT(DISTINCT s) FROM unnest(p_seat_ids) s) <> array_length(p_seat_ids, 1) THEN
        RAISE EXCEPTION 'DUPLICATE_SEATS_IN_REQUEST' USING ERRCODE = 'P0002';
    END IF;

    -- 3. Lock Event Row & Validate Event Status
    SELECT status INTO v_event_status
    FROM public.events
    WHERE id = p_event_id
    FOR UPDATE;

    IF v_event_status IS NULL THEN
        RAISE EXCEPTION 'EVENT_NOT_FOUND' USING ERRCODE = 'P0003';
    END IF;

    IF v_event_status <> 'PUBLISHED' THEN
        RAISE EXCEPTION 'EVENT_NOT_AVAILABLE' USING ERRCODE = 'P0004';
    END IF;

    -- 4. Lock & Validate Requested Seats belonging to Event
    SELECT COUNT(*) INTO v_invalid_event_seats_count
    FROM unnest(p_seat_ids) sid
    WHERE sid NOT IN (
        SELECT id FROM public.seats WHERE event_id = p_event_id
    );

    IF v_invalid_event_seats_count > 0 THEN
        RAISE EXCEPTION 'INVALID_SEAT_FOR_EVENT' USING ERRCODE = 'P0005';
    END IF;

    -- 5. Lock seats in consistent order to prevent deadlocks
    PERFORM id FROM public.seats 
    WHERE id = ANY(p_seat_ids) 
    ORDER BY id 
    FOR UPDATE;

    -- 6. Check if any seat is already booked (in active CONFIRMED booking)
    SELECT COUNT(*) INTO v_already_booked_count
    FROM public.booking_seats bs
    JOIN public.bookings b ON b.id = bs.booking_id
    WHERE bs.seat_id = ANY(p_seat_ids)
      AND b.status = 'CONFIRMED';

    IF v_already_booked_count > 0 THEN
        RAISE EXCEPTION 'SEAT_ALREADY_BOOKED' USING ERRCODE = 'P0006';
    END IF;

    -- 7. Generate Random Unique Booking Reference Code (EVT-XXXXXX)
    v_ref_code := 'EVT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

    -- 8. Insert Booking Record
    INSERT INTO public.bookings (user_id, event_id, booking_reference, status, total_seats)
    VALUES (p_user_id, p_event_id, v_ref_code, 'CONFIRMED', array_length(p_seat_ids, 1))
    RETURNING id INTO v_booking_id;

    -- 9. Insert Booking Seats Records
    FOREACH v_seat_id IN ARRAY p_seat_ids LOOP
        INSERT INTO public.booking_seats (booking_id, seat_id)
        VALUES (v_booking_id, v_seat_id);
    END LOOP;

    -- 10. Fetch seat numbers for response payload
    SELECT array_agg(seat_number) INTO v_seat_numbers
    FROM public.seats
    WHERE id = ANY(p_seat_ids);

    -- 11. Build Response JSON
    v_result := jsonb_build_object(
        'id', v_booking_id,
        'bookingReference', v_ref_code,
        'eventId', p_event_id,
        'userId', p_user_id,
        'status', 'CONFIRMED',
        'totalSeats', array_length(p_seat_ids, 1),
        'seats', v_seat_numbers,
        'createdAt', NOW()
    );

    RETURN v_result;
END;
$$;

-- Function: cancel_booking
-- Atomically cancels booking and releases seats
CREATE OR REPLACE FUNCTION public.cancel_booking(
    p_booking_id UUID,
    p_user_id UUID,
    p_is_admin BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
    v_result JSONB;
BEGIN
    -- Lock booking row
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF v_booking IS NULL THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND' USING ERRCODE = 'P0007';
    END IF;

    IF NOT p_is_admin AND v_booking.user_id <> p_user_id THEN
        RAISE EXCEPTION 'UNAUTHORIZED_BOOKING_ACCESS' USING ERRCODE = 'P0008';
    END IF;

    IF v_booking.status = 'CANCELLED' THEN
        RAISE EXCEPTION 'BOOKING_ALREADY_CANCELLED' USING ERRCODE = 'P0009';
    END IF;

    -- Update booking status
    UPDATE public.bookings
    SET status = 'CANCELLED',
        cancelled_at = NOW(),
        updated_at = NOW()
    WHERE id = p_booking_id;

    v_result := jsonb_build_object(
        'id', v_booking.id,
        'bookingReference', v_booking.booking_reference,
        'status', 'CANCELLED',
        'cancelledAt', NOW()
    );

    RETURN v_result;
END;
$$;
