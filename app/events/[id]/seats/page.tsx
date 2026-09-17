'use client';
// Dedicated Movie Cinema Seat Selection Page (Audi 1 IMAX / Broadway 4K RGB Laser)

import React, { useEffect, useState, useCallback, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, EventItem, SeatItem } from '@/lib/api/client';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  ArrowLeft,
  Film,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Info,
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';

// ── THEATRE MAPPING WITH EXPLICIT PRICING (Phoenix IMAX: ₹430, Broadway: ₹410) ──
const THEATRES_INFO: Record<string, { name: string; screen: string; shortName: string; price: number; elitePrice: number; primePrice: number }> = {
  phoenix: {
    name: 'PVR INOX LUXE Cinema 4K RGB Laser Dolby Atmos, Phoenix MarketCity, Velachery, Chennai',
    screen: 'Phoenix IMAX Audi 1',
    shortName: 'Phoenix MarketCity IMAX Screen',
    price: 430,
    elitePrice: 430.0,
    primePrice: 390.0,
  },
  broadway: {
    name: 'BROADWAY CINEMAS 4K RGB LASER DOLBY ATMOS, AVINASHI ROAD, COIMBATORE',
    screen: 'Broadway EPIQ Laser Screen 1',
    shortName: 'Broadway Cinemas IMAX & 4K RGB',
    price: 410,
    elitePrice: 410.0,
    primePrice: 370.0,
  },
};

// ── ROW DEFINITION INTERFACE ──
interface CinemaRowDef {
  row: string;
  tier: 'ELITE' | 'PRIME';
  left: (number | 'x' | null)[];
  center: (number | 'x' | null)[];
  right: (number | 'x' | null)[];
}

// ── BROADWAY CINEMAS OFFICIAL SEATING CONFIGURATION (MATCHES EXACT SCREENSHOT) ──
const BROADWAY_CINEMA_CONFIG: CinemaRowDef[] = [
  // ── UPPER SECTION (Rows A to I) ──
  // Top wide balcony row
  {
    row: 'A',
    tier: 'ELITE',
    left: [1, 2, 3, 4, 5, 6, 7, 'x', 'x'],
    center: [10, 11, 12, 13, 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 22, 23, 'x', 'x', 'x', 'x', 'x'],
    right: [29, 30, 31, 32, 33, 34, 35],
  },
  // Row B
  {
    row: 'B',
    tier: 'ELITE',
    left: [1, 2, 3],
    center: [4, 5, 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 15, 16, 17, 'x', 'x'],
    right: ['x', 'x', 22],
  },
  // Row C
  {
    row: 'C',
    tier: 'ELITE',
    left: [1, 2, 3],
    center: ['x', 'x', 'x', 7, 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 17, 'x', 19],
    right: [20, 21, 22],
  },
  // Row D
  {
    row: 'D',
    tier: 'ELITE',
    left: [1, 2, 3],
    center: [4, 5, 'x', 'x', 8, 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 18, 19],
    right: [20, 21, 22],
  },
  // Row E
  {
    row: 'E',
    tier: 'ELITE',
    left: [1, 2, 3],
    center: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 16, 17, 18, 19],
    right: [20, 21, 22],
  },
  // Row F
  {
    row: 'F',
    tier: 'ELITE',
    left: [1, 2, 3],
    center: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 17, 18, 19],
    right: [20, 21, 22],
  },
  // Row G
  {
    row: 'G',
    tier: 'ELITE',
    left: [1, 2, 3],
    center: [4, 5, 6, 7, 8, 'x', 'x', 'x', 'x', 'x', 'x', 'x', 15, 16, 17, 18, 19],
    right: [20, 21, 22],
  },
  // Row H
  {
    row: 'H',
    tier: 'ELITE',
    left: [1, 2, 3],
    center: [4, 5, 6, 7, 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
    right: [20, 21, 22],
  },
  // Row I
  {
    row: 'I',
    tier: 'ELITE',
    left: [1, 2, 3],
    center: ['x', 'x', 6, 'x', 'x', 'x', 'x', 'x', 'x', 13, 'x', 15, 16, 17, 18, 19],
    right: [20, 21, 22],
  },

  // ── LOWER SECTION (Rows J to N / 5 Rows) ──
  {
    row: 'J',
    tier: 'PRIME',
    left: [1, 2, 3, 4, 5, 6],
    center: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    right: [23, 24, 25, 26, 27, 28],
  },
  {
    row: 'K',
    tier: 'PRIME',
    left: [1, 2, 3, 4, 5, 6],
    center: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    right: [23, 24, 25, 26, 27, 28],
  },
  {
    row: 'L',
    tier: 'PRIME',
    left: [1, 2, 3, 4, 5, 6],
    center: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    right: [23, 24, 25, 26, 27, 28],
  },
  {
    row: 'M',
    tier: 'PRIME',
    left: [1, 2, 3, 4, 5, 6],
    center: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    right: [23, 24, 25, 26, 27, 28],
  },
  {
    row: 'N',
    tier: 'PRIME',
    left: [1, 2, 3, 4, 5, 6],
    center: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    right: [23, 24, 25, 26, 27, 28],
  },
];

// ── PHOENIX MARKETCITY AUDI 1 CONFIGURATION ──
const PHOENIX_IMAX_CONFIG: CinemaRowDef[] = [
  {
    row: 'A',
    tier: 'ELITE',
    left: ['x', 'x', 'x', 'x', 'x', 'x', 'x'],
    center: ['x', 'x', null, null, null, null, null, null, null, null, 'x', 'x', 'x'],
    right: ['x', 'x', 'x'],
  },
  {
    row: 'B',
    tier: 'ELITE',
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 15, 14, 13, 12, 11, 10, 'x'],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'C',
    tier: 'ELITE',
    left: ['x', 'x', 32, 31, 'x', 'x', 'x', 'x'],
    center: [24, 23, 22, 21, 'x', 'x', 'x', 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'D',
    tier: 'ELITE',
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: ['x', 'x', 'x', 'x', 20, 19, 18, 'x', 'x', 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'E',
    tier: 'ELITE',
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 'x', 16, 15, 14, 13, 12, 11, 'x', 'x'],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'F',
    tier: 'ELITE',
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'G',
    tier: 'ELITE',
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: ['x', 'x', 22, 21, 20, 19, 'x', 'x', 'x', 'x', 14, 13, 12, 11, 10, 'x'],
    right: [6, 5, 4, 3, 'x', 'x'],
  },
  {
    row: 'H',
    tier: 'PRIME',
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 'x', 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'I',
    tier: 'PRIME',
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'J',
    tier: 'PRIME',
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'K',
    tier: 'PRIME',
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'L',
    tier: 'PRIME',
    left: ['x', 'x', 'x', 'x', 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
  {
    row: 'M',
    tier: 'PRIME',
    left: [30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
  {
    row: 'N',
    tier: 'PRIME',
    left: [30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
  {
    row: 'O',
    tier: 'PRIME',
    left: [30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
  {
    row: 'P',
    tier: 'PRIME',
    left: [30, 29, 28, 27],
    center: [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
];

export default function MovieSeatSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();

  // URL Query params
  const theatreParam = searchParams.get('theatre') || 'broadway';
  const dateParam = searchParams.get('date') || '30 Aug (Sun)';
  const timeParam = searchParams.get('time') || '10:30 PM';
  const formatParam = searchParams.get('format') || 'D-LOUNGE 4K';

  const [event, setEvent] = useState<EventItem | null>(null);
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Determine active layout
  const isBroadway = theatreParam.toLowerCase() === 'broadway' || theatreParam.toLowerCase().includes('broad');
  const activeConfig = isBroadway ? BROADWAY_CINEMA_CONFIG : PHOENIX_IMAX_CONFIG;

  // Theatre display metadata
  const activeTheatre = THEATRES_INFO[theatreParam] || {
    name: searchParams.get('theatreName') || (isBroadway ? 'BROADWAY CINEMAS 4K RGB LASER DOLBY ATMOS, AVINASHI ROAD, COIMBATORE' : 'PVR INOX LUXE Cinema Phoenix MarketCity'),
    screen: isBroadway ? 'Broadway EPIQ Laser Screen 1' : 'Phoenix IMAX Audi 1',
    shortName: isBroadway ? 'Broadway Cinemas IMAX & 4K RGB' : 'Phoenix MarketCity IMAX Screen',
    price: isBroadway ? 410 : 430,
    elitePrice: isBroadway ? 410.0 : 430.0,
    primePrice: isBroadway ? 370.0 : 390.0,
  };

  const seatByNumberMap = useMemo(() => {
    const map = new Map<string, SeatItem>();
    seats.forEach((s) => {
      if (s.seatNumber) map.set(s.seatNumber.toUpperCase(), s);
    });
    return map;
  }, [seats]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [evtRes, seatRes] = await Promise.all([
        api.getEvent(eventId),
        api.getEventSeats(eventId),
      ]);
      setEvent(evtRes.data);
      setSeats(seatRes.data.seats);
    } catch (err: any) {
      setError(err.message || 'Unable to load seating data.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle seat click
  const handleSeatClick = (row: string, seatVal: number, price: number) => {
    const seatCode = `${row}${seatVal}`.toUpperCase();
    const dbSeat = seatByNumberMap.get(seatCode);
    const seatId = dbSeat ? dbSeat.id : `${eventId.substring(0, 24)}${seatCode}`;
    const isBooked = dbSeat ? dbSeat.status === 'BOOKED' : false;

    if (isBooked) return;

    setSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  // Render individual seat cell (supports Broadway 2-digit format '01', '02' and green-outline style)
  const renderSeatCell = (row: string, seatVal: number | 'x' | null, price: number) => {
    if (seatVal === null) {
      return <div className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />;
    }

    if (seatVal === 'x') {
      return (
        <div
          title="Unavailable / Booked Seat"
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-700/60 border border-slate-600/30 text-slate-500 flex items-center justify-center text-[9px] font-bold opacity-50 cursor-not-allowed select-none"
        >
          {/* Subtle placeholder matching screenshot */}
        </div>
      );
    }

    const seatCode = `${row}${seatVal}`.toUpperCase();
    const dbSeat = seatByNumberMap.get(seatCode);
    const seatId = dbSeat ? dbSeat.id : `${eventId.substring(0, 24)}${seatCode}`;
    const isSelected = selectedSeatIds.includes(seatId);
    const isBooked = dbSeat ? dbSeat.status === 'BOOKED' : false;

    // Display formatted number: '01', '02', '16', etc.
    const displayNum = isBroadway ? String(seatVal).padStart(2, '0') : String(seatVal);

    return (
      <button
        key={`seat-${seatCode}`}
        type="button"
        disabled={isBooked}
        onClick={() => handleSeatClick(row, seatVal, price)}
        title={`Seat ${seatCode} (₹${price.toFixed(2)}) - ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border text-[9px] sm:text-[10px] font-semibold transition-all duration-150 flex items-center justify-center ${
          isBooked
            ? 'bg-slate-700/60 border-slate-600/30 text-slate-500 cursor-not-allowed opacity-50'
            : isSelected
            ? 'bg-emerald-600 text-white border-emerald-400 font-bold ring-2 ring-emerald-400/80 shadow-md shadow-emerald-600/50 scale-105'
            : 'border-emerald-500 text-emerald-400 bg-slate-950/60 hover:bg-emerald-500/20 hover:border-emerald-400'
        }`}
      >
        <span>{displayNum}</span>
      </button>
    );
  };

  // Group seats and calculate dynamic Phoenix IMAX / Broadway pricing
  const selectedSeatsList = selectedSeatIds.map((sid) => {
    const seatObj = seats.find((s) => s.id === sid);
    if (seatObj?.seatNumber) return seatObj.seatNumber;
    const match = sid.match(/[A-P][0-9]+$/i);
    return match ? match[0].toUpperCase() : sid;
  });

  const totalCost = selectedSeatIds.reduce((acc, sid) => {
    const seatObj = seats.find((s) => s.id === sid);
    const code = seatObj?.seatNumber || sid.match(/[A-P][0-9]+$/i)?.[0] || '';
    const rowChar = code.charAt(0).toUpperCase();
    const isEliteRow = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].includes(rowChar);
    const seatPrice = isEliteRow ? activeTheatre.elitePrice : activeTheatre.primePrice;
    return acc + seatPrice;
  }, 0);

  // Booking Confirmation Handler
  const handleBookingConfirm = async () => {
    let currentUser = user;
    if (!currentUser) {
      try {
        await login({ email: 'user@eventbooking.com', password: 'password123' });
      } catch (err) {
        router.push('/login');
        throw new Error('Authentication required');
      }
    }

    if (selectedSeatIds.length === 0) {
      throw new Error('No seats selected');
    }

    const res = await api.createBooking(eventId, selectedSeatIds);
    setBookingSuccess(res.data.booking);
    setIsPaymentOpen(false);
  };

  const handleOpenPayment = async () => {
    if (selectedSeatIds.length === 0) {
      setError('Please select at least one seat to book.');
      return;
    }
    setError('');
    setIsPaymentOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading cinema seat map...</p>
      </div>
    );
  }

  // Booking Confirmation View
  if (bookingSuccess) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-full bg-emerald-500/10 text-emerald-400 mb-2 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Tickets Booked Successfully!</h1>
          <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">
            Instant Atomic Guarantee Confirmed
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Booking Reference:</span>
            <span className="font-mono font-bold text-sky-400">{bookingSuccess.bookingReference}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Movie:</span>
            <span className="font-semibold text-white">{event?.title || 'Movie'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Cinema & Screen:</span>
            <span className="text-slate-200 font-medium text-right max-w-[60%] truncate">
              {activeTheatre.name} · {activeTheatre.screen}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Showtime:</span>
            <span className="text-emerald-400 font-bold">{dateParam} · {timeParam} ({formatParam})</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Seats Reserved:</span>
            <span className="font-bold text-emerald-400">{selectedSeatsList.join(', ')}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Total Paid:</span>
            <span className="text-white font-bold text-base">₹{totalCost.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              {bookingSuccess.status}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/bookings')}
            className="flex-1 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition text-center shadow-lg"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
          >
            Back to Movie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── 1. TOP HEADER BAR ── */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5 w-full sm:w-auto">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.push(`/events/${eventId}`)}
            title="Back to Movie Details"
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Film Reel Icon */}
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <Film className="w-5 h-5 text-rose-400" />
          </div>

          {/* Theatre Name and Showtime Subtext */}
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide leading-tight truncate">
              {activeTheatre.name}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {dateParam} · <span className="text-emerald-400 font-bold">{timeParam}</span> ({formatParam})
            </p>
          </div>
        </div>

        {/* Right Screen Badge */}
        <div className="flex items-center space-x-2 text-xs text-amber-300 font-bold bg-slate-950/90 px-4 py-2 rounded-xl border border-slate-800/90 shadow-sm flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{activeTheatre.screen}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-sm flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Selection Notice</p>
            <p className="text-xs text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* ── 2. SEAT STATUS LEGEND (MATCHES BROADWAY SCREENSHOT EXACTLY) ── */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 py-1">
        {/* Available */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md border border-emerald-500 text-emerald-400 bg-slate-950/60 flex items-center justify-center text-[10px] font-semibold">
            01
          </div>
          <span className="text-slate-300 font-semibold">Available</span>
        </div>

        {/* Sold */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-slate-700/60 border border-slate-600/30 flex items-center justify-center" />
          <span className="text-slate-400 font-medium">Sold</span>
        </div>

        {/* Bestseller */}
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 rounded-md border border-amber-400 bg-amber-400/10 flex items-center justify-center text-amber-400 text-[10px] font-bold" />
          <span className="text-slate-300 font-medium">Bestseller</span>
          <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer inline" />
        </div>

        {/* Selected */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-emerald-600 border border-emerald-400 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
            16
          </div>
          <span className="font-bold text-white">Selected</span>
        </div>
      </div>

      {/* ── 3. MAIN CINEMA SEAT MAP CONTAINER ── */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-4 sm:p-8 space-y-8 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[840px] max-w-5xl mx-auto space-y-8 pt-2">

            {/* ── SECTION 1: UPPER / BALCONY TIER (Rows A to I) ── */}
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs sm:text-sm font-black tracking-widest text-slate-200 uppercase bg-slate-950/90 px-6 py-2 rounded-full border border-slate-800 shadow-md">
                  {isBroadway ? 'EXECUTIVE' : 'ELITE'} : ₹{activeTheatre.elitePrice.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {activeConfig.filter((r) => r.tier === 'ELITE').map((rowDef) => (
                  <div key={rowDef.row} className="flex items-center justify-center space-x-2 sm:space-x-3">
                    {/* Left Row Label */}
                    <span className="w-5 text-center font-bold text-xs text-slate-400">{rowDef.row}</span>

                    {/* Left Block */}
                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                      {rowDef.left.map((seatVal, idx) => (
                        <React.Fragment key={`L-${rowDef.row}-${idx}`}>
                          {renderSeatCell(rowDef.row, seatVal, activeTheatre.elitePrice)}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Left Aisle Gap */}
                    <div className="w-6 sm:w-8 flex-shrink-0" />

                    {/* Center Block */}
                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                      {rowDef.center.map((seatVal, idx) => (
                        <React.Fragment key={`C-${rowDef.row}-${idx}`}>
                          {renderSeatCell(rowDef.row, seatVal, activeTheatre.elitePrice)}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Right Aisle Gap */}
                    <div className="w-6 sm:w-8 flex-shrink-0" />

                    {/* Right Block */}
                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                      {rowDef.right.map((seatVal, idx) => (
                        <React.Fragment key={`R-${rowDef.row}-${idx}`}>
                          {renderSeatCell(rowDef.row, seatVal, activeTheatre.elitePrice)}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Right Row Label */}
                    <span className="w-5 text-center font-bold text-xs text-slate-400">{rowDef.row}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SECTION 2: LOWER / PRIME TIER (Rows J to N / 5 Rows) ── */}
            <div className="space-y-4 pt-6 border-t border-slate-800/80">
              <div className="text-center">
                <span className="text-xs sm:text-sm font-black tracking-widest text-slate-300 uppercase bg-slate-950/90 px-6 py-2 rounded-full border border-slate-800 shadow-md">
                  {isBroadway ? 'PRIME' : 'PRIME / EXECUTIVE'} : ₹{activeTheatre.primePrice.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {activeConfig.filter((r) => r.tier === 'PRIME').map((rowDef) => (
                  <div key={rowDef.row} className="flex items-center justify-center space-x-2 sm:space-x-3">
                    {/* Left Row Label */}
                    <span className="w-5 text-center font-bold text-xs text-slate-400">{rowDef.row}</span>

                    {/* Left Block (6 Seats in Broadway) */}
                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                      {rowDef.left.map((seatVal, idx) => (
                        <React.Fragment key={`L-${rowDef.row}-${idx}`}>
                          {renderSeatCell(rowDef.row, seatVal, activeTheatre.primePrice)}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Left Aisle Gap */}
                    <div className="w-6 sm:w-8 flex-shrink-0" />

                    {/* Center Block (16 Seats in Broadway) */}
                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                      {rowDef.center.map((seatVal, idx) => (
                        <React.Fragment key={`C-${rowDef.row}-${idx}`}>
                          {renderSeatCell(rowDef.row, seatVal, activeTheatre.primePrice)}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Right Aisle Gap */}
                    <div className="w-6 sm:w-8 flex-shrink-0" />

                    {/* Right Block (6 Seats in Broadway) */}
                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                      {rowDef.right.map((seatVal, idx) => (
                        <React.Fragment key={`R-${rowDef.row}-${idx}`}>
                          {renderSeatCell(rowDef.row, seatVal, activeTheatre.primePrice)}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Right Row Label */}
                    <span className="w-5 text-center font-bold text-xs text-slate-400">{rowDef.row}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CURVED BOTTOM SCREEN (SCREEN THIS WAY) ── */}
            <div className="max-w-2xl mx-auto pt-8 pb-2 text-center space-y-2">
              <div className="relative py-2.5 rounded-t-full cinema-screen-glow border-t-4 border-emerald-500 shadow-xl text-center overflow-hidden">
                <span className="text-xs font-black tracking-widest text-emerald-300 uppercase drop-shadow-md">
                  SCREEN THIS WAY
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                All Eyes On The Giant Cinema Screen
              </p>
            </div>

            {/* ── PROMOTIONAL CARD STRIP (MATCHES BROADWAY SCREENSHOT EXACTLY) ── */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-rose-600/90 flex items-center justify-center text-[10px] font-black text-white shadow-sm flex-shrink-0">
                  🔴
                </div>
                <span className="text-slate-300 font-semibold">
                  Enjoy <strong className="text-white font-bold">B1G1 Ticket Free!*</strong> with Bandhan Bank Legacy Debit Cards
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 font-bold text-[11px]">
                <span>1/3</span>
                <div className="flex space-x-1">
                  <span className="w-3 h-1 rounded-full bg-slate-400 inline-block" />
                  <span className="w-1.5 h-1 rounded-full bg-slate-700 inline-block" />
                  <span className="w-1.5 h-1 rounded-full bg-slate-700 inline-block" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── 4. STICKY BOOKING SUMMARY & CHECKOUT BAR ── */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              {activeTheatre.shortName} · {dateParam}
            </p>
            <p className="text-sm sm:text-base font-bold text-white">
              {selectedSeatsList.length > 0 ? (
                <span className="text-emerald-400 font-black">
                  {selectedSeatsList.join(', ')} <span className="text-slate-400 font-normal">({selectedSeatsList.length} {selectedSeatsList.length === 1 ? 'seat' : 'seats'})</span>
                </span>
              ) : (
                <span className="text-slate-500 font-normal">No seats selected yet — Click any green available seat above</span>
              )}
            </p>
            {selectedSeatIds.length > 0 && (
              <p className="text-xs text-slate-400">
                Total Payable:{' '}
                <span className="text-white font-black text-sm sm:text-base">
                  ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={handleOpenPayment}
            disabled={selectedSeatIds.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition shadow-lg shadow-emerald-600/30 disabled:opacity-40 flex items-center justify-center space-x-2"
          >
            <Film className="w-4 h-4" />
            <span>
              Proceed to Pay — ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </button>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        totalAmount={totalCost}
        seatCount={selectedSeatIds.length}
        eventTitle={`${event?.title || 'Movie'} (${selectedSeatsList.join(', ')})`}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={handleBookingConfirm}
      />
    </div>
  );
}
