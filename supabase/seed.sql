-- ============================================================================
-- EVENT BOOKING SYSTEM - SEED DATA SCRIPT
-- ============================================================================

-- 1. Create Auth Users & Profiles for Admin & Normal User
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@eventbooking.com', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"System Admin"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'user@eventbooking.com', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"John Doe"}', NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@eventbooking.com', 'ADMIN', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'John Doe', 'user@eventbooking.com', 'USER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Seed 10 Events (5 original updated + 3 new concerts + 2 new road shows)
INSERT INTO public.events (id, title, description, venue, event_date, start_time, end_time, total_capacity, price, status, created_by)
VALUES
  -- Original 5 — Tamil Nadu venues
  ('11111111-1111-1111-1111-111111111111', 'Global Tech Summit 2026',
   'The premier technology conference showcasing modern AI, distributed computing, and cloud architecture — now in Chennai!',
   'Anna Centenary Library Auditorium, Kotturpuram, Chennai',
   '2026-09-15', '09:00 AM', '05:00 PM', 40, 2999.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001'),

  ('22222222-2222-2222-2222-222222222222', 'Neon Nights Music Festival',
   'An unforgettable night of synthwave, electronic beats, and immersive visual performances under the Chennai sky.',
   'Island Grounds Open Arena, Chennai',
   '2026-10-02', '07:00 PM', '11:30 PM', 60, 1499.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001'),

  ('33333333-3333-3333-3333-333333333333', 'Symphonic Masterpieces Live',
   'Experience classical Carnatic and western orchestral elegance performed by the Tamil Nadu Philharmonic Orchestra.',
   'Kalaivanar Arangam, Anna Salai, Chennai',
   '2026-11-20', '06:30 PM', '09:30 PM', 100, 999.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001'),

  ('44444444-4444-4444-4444-444444444444', 'Stand-up Comedy Gala',
   'Laugh out loud with Tamil Nadu''s top stand-up comedians and surprise celebrity guests live on stage.',
   'Nehru Indoor Stadium, Chennai',
   '2026-08-25', '08:00 PM', '10:00 PM', 50, 799.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001'),

  ('55555555-5555-5555-5555-555555555555', 'Future of Web & AI Workshop',
   'Hands-on interactive masterclass building high-performance web applications with AI — hosted at Coimbatore''s tech hub.',
   'CODISSIA Trade Fair Complex, Avinashi Road, Coimbatore',
   '2026-12-05', '10:00 AM', '04:00 PM', 80, 4999.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001'),

  -- New Concerts
  ('66666666-6666-6666-6666-666666666666', 'AR Rahman Live — Isai Mazhai Concert',
   'Experience the magic of Oscar-winning maestro AR Rahman performing his greatest hits live in an open-air spectacular night concert.',
   'YMCA Ground, Nandanam, Chennai',
   '2026-09-27', '06:30 PM', '10:30 PM', 120, 2499.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001'),

  ('77777777-7777-7777-7777-777777777777', 'Kollywood Stars Night — Award Gala Concert',
   'A dazzling evening of live performances, award ceremonies, and appearances by your favourite Tamil cinema stars and playback singers.',
   'Jawaharlal Nehru Stadium, Periyamet, Chennai',
   '2026-10-18', '05:00 PM', '10:00 PM', 150, 1999.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001'),

  ('88888888-8888-8888-8888-888888888888', 'Yuvan Shankar Raja — Rhythm of Youth',
   'Chart-topping composer Yuvan Shankar Raja brings his electrifying beats and soulful melodies to Coimbatore in a night you will never forget.',
   'VOC Park & Stadium, Coimbatore',
   '2026-11-08', '07:00 PM', '11:00 PM', 90, 1499.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001'),

  -- New Road Shows
  ('99999999-9999-9999-9999-999999999999', 'Chennai Grand Road Show 2026',
   'The biggest street-level cultural extravaganza along the Marina Beach Promenade — live music, dance troupes, food stalls, and electric vehicle showcases.',
   'Marina Beach Promenade, Triplicane, Chennai',
   '2026-08-30', '04:00 PM', '09:00 PM', 200, 499.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001'),

  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tamil Nadu Auto Expo Road Show',
   'Witness the latest electric vehicles, supercars, and two-wheelers at Tamil Nadu''s biggest automotive road show with live stunts and test drives.',
   'CODISSIA Trade Fair Complex, Avinashi Road, Coimbatore',
   '2026-12-20', '10:00 AM', '06:00 PM', 160, 299.00, 'PUBLISHED', '00000000-0000-0000-0000-000000000001')

ON CONFLICT (id) DO NOTHING;

-- 3. Helper Function to generate seats for events dynamically
DO $$
DECLARE
    r RECORD;
    v_rows TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    v_row_char TEXT;
    v_seat_num INTEGER;
    v_seat_code TEXT;
    v_seat_type TEXT;
    v_total_seats_for_event INTEGER;
    v_rows_needed INTEGER;
BEGIN
    FOR r IN SELECT id, total_capacity FROM public.events LOOP
        v_total_seats_for_event := r.total_capacity;
        v_rows_needed := CEIL(v_total_seats_for_event::NUMERIC / 10.0);

        FOR i IN 1..v_rows_needed LOOP
            v_row_char := v_rows[i];
            FOR j IN 1..10 LOOP
                v_seat_num := ((i - 1) * 10) + j;
                IF v_seat_num <= v_total_seats_for_event THEN
                    v_seat_code := v_row_char || j::TEXT;
                    
                    IF v_row_char = 'A' THEN
                        v_seat_type := 'VIP';
                    ELSIF v_row_char = 'B' THEN
                        v_seat_type := 'PREMIUM';
                    ELSE
                        v_seat_type := 'STANDARD';
                    END IF;

                    INSERT INTO public.seats (event_id, seat_number, row_number, section, seat_type)
                    VALUES (r.id, v_seat_code, v_row_char, v_seat_type, v_seat_type)
                    ON CONFLICT (event_id, seat_number) DO NOTHING;
                END IF;
            END FOR;
        END FOR;
    END LOOP;
END $$;
