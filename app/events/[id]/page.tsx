'use client';
// Event Details & Booking Page — Movies, Sports, Concerts, and Summits

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { api, EventItem, SeatItem } from '@/lib/api/client';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Armchair,
  Film,
  Trophy,
  Tv,
  Sparkles,
  Shield,
  Layers,
  Heart,
  Info,
  Share2,
} from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';

// ── DATE SELECTION CONFIGURATION (Matches Screenshot 1) ──
interface DateOption {
  monthPill?: string;
  dayNumber: string;
  dayName: string;
  fullDate: string;
}

const CINEMA_DATES: DateOption[] = [
  { monthPill: 'AUG', dayNumber: '30', dayName: 'Sun', fullDate: '30 Aug (Sun)' },
  { dayNumber: '31', dayName: 'Mon', fullDate: '31 Aug (Mon)' },
  { monthPill: 'SEP', dayNumber: '1', dayName: 'Tue', fullDate: '1 Sep (Tue)' },
  { dayNumber: '2', dayName: 'Wed', fullDate: '2 Sep (Wed)' },
  { dayNumber: '3', dayName: 'Thu', fullDate: '3 Sep (Thu)' },
  { dayNumber: '4', dayName: 'Fri', fullDate: '4 Sep (Fri)' },
];

// ── 2 THEATRES CONFIGURATION (Phoenix & Broadway with Showtimes matching Screenshot 2) ──
interface TheatreOption {
  id: string;
  name: string;
  shortName: string;
  location: string;
  distance: string;
  logo: string;
  price: number;
  priceLabel: string;
  features: string[];
  showtimes: { time: string; format: string }[];
}

const CINEMA_THEATRES: TheatreOption[] = [
  {
    id: 'phoenix',
    name: 'PVR INOX LUXE Cinema 4K RGB Laser Dolby Atmos, Phoenix MarketCity, Velachery, Chennai',
    shortName: 'Phoenix MarketCity IMAX Screen',
    location: 'Velachery, Chennai',
    distance: '10.2 km away',
    logo: 'PHOENIX LUXE',
    price: 430,
    priceLabel: '₹430 / ticket',
    features: ['🍿 Non-cancellable', '📱 M-Ticket Available', '✨ Recliner Lounges', '🍔 F&B Dine-In'],
    showtimes: [
      { time: '10:30 AM', format: 'LUXE 4K' },
      { time: '02:15 PM', format: 'IMAX 3D' },
      { time: '06:45 PM', format: 'DOLBY ATMOS' },
      { time: '10:20 PM', format: 'D-LOUNGE 4K' },
    ],
  },
  {
    id: 'broadway',
    name: 'Broadway Cinemas 4K RGB Laser Dolby Atmos, Avinashi Road, Coimbatore',
    shortName: 'Broadway Cinemas IMAX & 4K RGB',
    location: 'Avinashi Road, Coimbatore',
    distance: 'Coimbatore City Center',
    logo: 'BROADWAY',
    price: 410,
    priceLabel: '₹410 / ticket',
    features: ['📽️ EPIQ Giant Screen', '🍿 F&B Dine-In', '📱 M-Ticket', '🔊 Dolby Atmos 360°'],
    showtimes: [
      { time: '11:00 AM', format: 'EPIQ 4K' },
      { time: '03:15 PM', format: 'DOLBY 7.1' },
      { time: '07:00 PM', format: 'RGB LASER 4K' },
      { time: '10:30 PM', format: 'D-LOUNGE 4K' },
    ],
  },
];


// ── PHOENIX MARKETCITY IMAX SCREEN SEATING SPECIFICATION (Matches Official Audi 1 Layout 100%) ──
interface PhoenixRowDef {
  row: string;
  tier: 'ELITE' | 'PRIME';
  price: number;
  left: (number | 'x' | null)[];
  center: (number | 'x' | null)[];
  right: (number | 'x' | null)[];
}

const PHOENIX_IMAX_CONFIG: PhoenixRowDef[] = [
  // ── ELITE TIER : ₹441.51 (Rows A to G) ──
  {
    row: 'A',
    tier: 'ELITE',
    price: 441.51,
    left: ['x', 'x', 'x', 'x', 'x', 'x', 'x'],
    center: ['x', 'x', null, null, null, null, null, null, null, null, 'x', 'x', 'x'],
    right: ['x', 'x', 'x'],
  },
  {
    row: 'B',
    tier: 'ELITE',
    price: 441.51,
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 15, 14, 13, 12, 11, 10, 'x'],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'C',
    tier: 'ELITE',
    price: 441.51,
    left: ['x', 'x', 32, 31, 'x', 'x', 'x', 'x'],
    center: [24, 23, 22, 21, 'x', 'x', 'x', 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'D',
    tier: 'ELITE',
    price: 441.51,
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: ['x', 'x', 'x', 'x', 20, 19, 18, 'x', 'x', 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'E',
    tier: 'ELITE',
    price: 441.51,
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 'x', 16, 15, 14, 13, 12, 11, 'x', 'x'],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'F',
    tier: 'ELITE',
    price: 441.51,
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'G',
    tier: 'ELITE',
    price: 441.51,
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: ['x', 'x', 22, 21, 20, 19, 'x', 'x', 'x', 'x', 14, 13, 12, 11, 10, 'x'],
    right: [6, 5, 4, 3, 'x', 'x'],
  },

  // ── PRIME / EXECUTIVE TIER : ₹390.00 (Rows H to P) ──
  {
    row: 'H',
    tier: 'PRIME',
    price: 390.0,
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 'x', 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'I',
    tier: 'PRIME',
    price: 390.0,
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'J',
    tier: 'PRIME',
    price: 390.0,
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'K',
    tier: 'PRIME',
    price: 390.0,
    left: [34, 33, 32, 31, 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5, 4, 3, 2, 1],
  },
  {
    row: 'L',
    tier: 'PRIME',
    price: 390.0,
    left: ['x', 'x', 'x', 'x', 30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
  {
    row: 'M',
    tier: 'PRIME',
    price: 390.0,
    left: [30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
  {
    row: 'N',
    tier: 'PRIME',
    price: 390.0,
    left: [30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
  {
    row: 'O',
    tier: 'PRIME',
    price: 390.0,
    left: [30, 29, 28, 27],
    center: [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
  {
    row: 'P',
    tier: 'PRIME',
    price: 390.0,
    left: [30, 29, 28, 27],
    center: [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9],
    right: [6, 5],
  },
];

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const { user, login } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('30 Aug (Sun)');
  const [selectedTheatreId, setSelectedTheatreId] = useState<string>('phoenix');
  const [selectedShowtime, setSelectedShowtime] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [favoriteTheatres, setFavoriteTheatres] = useState<string[]>(['phoenix']);
  const [selectedLanguageFormat, setSelectedLanguageFormat] = useState<string>('Tamil · IMAX 4K Laser');

  const toggleFavorite = (theatreId: string) => {
    setFavoriteTheatres((prev) =>
      prev.includes(theatreId) ? prev.filter((id) => id !== theatreId) : [...prev, theatreId]
    );
  };


  const titleLower = event?.title?.toLowerCase() || '';
  const categoryUpper = event?.category?.toUpperCase() || '';

  const isMovie = Boolean(
    categoryUpper === 'MOVIE' ||
    titleLower.includes('coolie') ||
    titleLower.includes('avatar') ||
    titleLower.includes('imax') ||
    titleLower.includes('cinema')
  );

  const isSport = Boolean(
    categoryUpper === 'SPORT' ||
    titleLower.includes('ipl') ||
    titleLower.includes('csk') ||
    titleLower.includes('derby') ||
    titleLower.includes('cricket') ||
    titleLower.includes('match')
  );

  const isRoadShow = Boolean(
    categoryUpper === 'ROADSHOW' ||
    titleLower.includes('road show') ||
    titleLower.includes('roadshow')
  );

  // Music Concerts get Stadium Arena Layout (AR Rahman, Yuvan, Neon Nights — EXCLUDING Movies, Sports, Road Shows)
  const isMusicConcert = Boolean(
    (categoryUpper === 'CONCERT' ||
      titleLower.includes('concert') ||
      titleLower.includes('music festival') ||
      titleLower.includes('isai mazhai') ||
      titleLower.includes('rhythm of youth')) &&
    !isMovie &&
    !isSport &&
    !isRoadShow
  );

  const [roadShowPassCount, setRoadShowPassCount] = useState<number>(1);

  // Derive row map at component level, filtering out any invalid/undefined rows
  const rowsMap: Record<string, SeatItem[]> = {};
  seats.forEach((seat) => {
    const rawRow = seat.row || (seat.seatNumber ? seat.seatNumber.replace(/[0-9]/g, '') : '');
    if (!rawRow || rawRow === 'undefined' || seat.seatNumber?.includes('undefined')) return;
    if (!rowsMap[rawRow]) rowsMap[rawRow] = [];
    rowsMap[rawRow].push(seat);
  });
  const rowKeys = Object.keys(rowsMap).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Map of seats by exact seat number e.g. "H18" -> SeatItem
  const seatByNumberMap = new Map<string, SeatItem>();
  seats.forEach((s) => {
    if (s.seatNumber) seatByNumberMap.set(s.seatNumber.toUpperCase(), s);
  });

  // Set default showtime when event loads (for non-movies)
  useEffect(() => {
    if (event?.showtimes && event.showtimes.length > 0 && !isMovie) {
      setSelectedShowtime(event.showtimes[0]);
    }
  }, [event, isMovie]);


  const renderImaxSeatCell = (row: string, seatVal: number | 'x' | null, price: number) => {
    if (seatVal === null) {
      return <div className="w-6 h-6 sm:w-7 sm:h-7 pointer-events-none" />;
    }

    if (seatVal === 'x') {
      return (
        <div
          title="Unavailable Seat"
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-slate-700/60 bg-slate-950/60 text-slate-500 flex items-center justify-center text-[10px] font-bold opacity-40 cursor-not-allowed select-none"
        >
          ×
        </div>
      );
    }

    const seatCode = `${row}${seatVal}`.toUpperCase();
    const dbSeat = seatByNumberMap.get(seatCode);
    const seatId = dbSeat ? dbSeat.id : `${eventId.substring(0, 24)}${seatCode}`;
    const isSelected = selectedSeatIds.includes(seatId);
    const isBooked = dbSeat ? dbSeat.status === 'BOOKED' : false;

    return (
      <button
        key={`seat-${seatCode}`}
        type="button"
        disabled={isBooked}
        onClick={() => {
          if (isBooked) return;
          setSelectedSeatIds((prev) =>
            prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
          );
        }}
        title={`Seat ${seatCode} (₹${price.toFixed(2)}) - ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border text-[10px] sm:text-xs font-bold transition-all duration-150 flex items-center justify-center ${
          isBooked
            ? 'bg-rose-950/40 border-rose-900/60 text-rose-500 cursor-not-allowed opacity-50'
            : isSelected
            ? 'bg-sky-500 text-white border-sky-300 ring-2 ring-sky-300/70 shadow-md shadow-sky-500/40 scale-105 font-black'
            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-600 hover:border-sky-400 hover:text-sky-300'
        }`}
      >
        <span>{seatVal}</span>
      </button>
    );
  };

  const renderSeatButton = (seat: SeatItem, tierCustomLabel?: string) => {
    if (!seat) return null;
    const isSelected = selectedSeatIds.includes(seat.id);
    const isBooked = seat.status === 'BOOKED';
    const isVip = seat.seatType === 'VIP' || seat.seatType === 'PREMIUM' || seat.row === 'A';

    let seatBg = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';
    if (isVip) seatBg = 'bg-amber-950/70 text-amber-200 border-amber-700/70 shadow-sm';
    if (isSelected) seatBg = 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-400/50 shadow-md scale-105';
    if (isBooked) seatBg = 'bg-rose-950/50 text-rose-500 border-rose-900/60 cursor-not-allowed opacity-50';

    return (
      <button
        key={seat.id}
        disabled={isBooked}
        onClick={() => toggleSeatSelection(seat)}
        title={`Seat ${seat.seatNumber} ${tierCustomLabel ? `(${tierCustomLabel})` : `(${seat.seatType})`} - ${seat.status}`}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center ${seatBg}`}
      >
        <span>{seat.seatNumber}</span>
      </button>
    );
  };




  // Auto-allocate pass seat IDs for Road Shows
  useEffect(() => {
    if (isRoadShow && seats.length > 0) {
      const available = seats.filter((s) => s.status === 'AVAILABLE');
      const selected = available.slice(0, roadShowPassCount).map((s) => s.id);
      setSelectedSeatIds(selected);
    }
  }, [isRoadShow, roadShowPassCount, seats]);



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
      setError(err.message || 'Unable to load event details.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSeatSelection = (seat: SeatItem) => {
    if (seat.status === 'BOOKED') return;
    setSelectedSeatIds((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  };

  // Select / deselect all available seats in a row
  const toggleRowSelection = (rowKey: string) => {
    const rowSeats = (rowsMap[rowKey] ?? []).filter((s) => s.status !== 'BOOKED');
    const rowIds = rowSeats.map((s) => s.id);
    const allSelected = rowIds.every((id) => selectedSeatIds.includes(id));
    if (allSelected) {
      setSelectedSeatIds((prev) => prev.filter((id) => !rowIds.includes(id)));
    } else {
      setSelectedSeatIds((prev) => [...new Set([...prev, ...rowIds])]);
    }
  };

  // Called by PaymentModal after payment succeeds
  const handleBookingConfirm = async () => {
    let currentUser = user;
    if (!currentUser) {
      try {
        await login({ email: 'user@bookie.com', password: 'password123' });
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

  // Open payment modal (with auth pre-check)
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
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading seat map...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <button
          onClick={() => router.push('/events')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-sm hover:bg-slate-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  // Booking Confirmation View
  if (bookingSuccess) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Booking Confirmed!</h1>
          <p className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">
            Transaction Completed Atomically
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Booking Reference:</span>
            <span className="font-mono font-bold text-sky-400">{bookingSuccess.bookingReference}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Event:</span>
            <span className="font-semibold text-white">{event.title}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Venue:</span>
            <span className="text-slate-300 text-right">{event.venue}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Seats Reserved:</span>
            <span className="font-bold text-emerald-400">{bookingSuccess.seats?.join(', ')}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Price per Seat:</span>
            <span className="text-amber-400 font-semibold">₹{Number(event.price ?? 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Total Paid:</span>
            <span className="text-white font-bold text-base">₹{(Number(event.price ?? 0) * (bookingSuccess.seats?.length ?? 0)).toLocaleString('en-IN')}</span>
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
            className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition text-center shadow-lg"
          >
            View My Bookings
          </button>
          <button
            onClick={() => {
              setBookingSuccess(null);
              setSelectedSeatIds([]);
              loadData();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
          >
            Book More Seats
          </button>
        </div>
      </div>
    );
  }

  // Group seats and calculate dynamic Phoenix IMAX pricing
  const selectedSeatsList = selectedSeatIds.map((sid) => {
    const seatObj = seats.find((s) => s.id === sid);
    if (seatObj?.seatNumber) return seatObj.seatNumber;
    const match = sid.match(/[A-P][0-9]+$/i);
    return match ? match[0].toUpperCase() : sid;
  });

  const pricePerSeat = Number(event.price ?? 0);
  const totalCost = isMovie
    ? selectedSeatIds.reduce((acc, sid) => {
        const seatObj = seats.find((s) => s.id === sid);
        const code = seatObj?.seatNumber || sid.match(/[A-P][0-9]+$/i)?.[0] || '';
        const rowChar = code.charAt(0).toUpperCase();
        const isEliteRow = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(rowChar);
        return acc + (isEliteRow ? 441.51 : 390.0);
      }, 0)
    : pricePerSeat * selectedSeatIds.length;


  return (
    <div className="space-y-8">
      <button
        onClick={() => router.push('/events')}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </button>

      {/* Event Hero Banner with Relevant Image */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={event.image_url || event.imageUrl || '/events/global-tech-summit.jpg'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20" />

          {/* Top floating badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 backdrop-blur-md">
              {event.status}
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-amber-500/50 text-amber-300 font-extrabold text-sm backdrop-blur-md shadow-lg">
              {isMovie ? '₹410 - ₹430' : `₹${Number(event.price ?? 0).toLocaleString('en-IN')}`} <span className="text-xs font-normal text-slate-400">/ {isRoadShow ? 'pass' : 'seat'}</span>
            </span>
          </div>

          {/* Bottom Banner Title & Description */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md leading-tight">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-3xl line-clamp-2 leading-relaxed drop-shadow-sm">
              {event.description}
            </p>
          </div>
        </div>

        {/* Info Strip */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="flex items-center space-x-2.5">
            <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="truncate font-medium">{event.venue}</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="font-medium">{event.event_date || event.eventDate}</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-medium">{event.start_time || event.startTime} - {event.end_time || event.endTime}</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 sm:justify-end">
            <span>Available: <strong className="text-emerald-400 font-bold">{event.availableSeats ?? '-'}</strong></span>
            <span>Booked: <strong className="text-rose-400 font-bold">{event.bookedSeats ?? '-'}</strong></span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-sm flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Booking Error</p>
            <p className="text-xs text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {isMovie ? (
        /* ── MOVIE TICKET BOOKING: DATES (SCREENSHOT 1) + 2 THEATRES (SCREENSHOT 2) + PHOENIX IMAX SEATING ── */
        <div className="space-y-8">
          {/* ── 1. DATE SELECTION BAR (MATCHING SCREENSHOT 1) ── */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Select Movie Date
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Current Date: <strong className="text-white">{selectedDate}</strong>
              </span>
            </div>

            {/* Horizontal Scrollable Dates Strip */}
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 custom-scrollbar">
              {CINEMA_DATES.map((d, idx) => {
                const isSelected = selectedDate === d.fullDate;
                return (
                  <React.Fragment key={idx}>
                    {/* Month Pill Separator if new month */}
                    {d.monthPill && (
                      <div className="flex-shrink-0 bg-slate-800/90 border border-slate-700 text-slate-300 text-[10px] font-black uppercase px-2.5 py-4 rounded-2xl flex items-center justify-center tracking-widest shadow-inner select-none">
                        {d.monthPill}
                      </div>
                    )}

                    {/* Date Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedDate(d.fullDate)}
                      className={`flex-shrink-0 min-w-[62px] sm:min-w-[70px] py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border ${
                        isSelected
                          ? 'bg-slate-950 border-slate-600 text-white shadow-xl ring-2 ring-sky-400/80 scale-105'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span className={`text-base sm:text-lg font-black ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {d.dayNumber}
                      </span>
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-sky-400' : 'text-slate-500'}`}>
                        {d.dayName}
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Language & Screen Format Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto pt-1 text-xs border-t border-slate-800/80">
              <span className="text-slate-500 font-bold uppercase text-[10px] flex-shrink-0 mr-1">Formats:</span>
              {[
                'Tamil · IMAX 4K Laser',
                'Tamil · 2D Dolby Atmos',
                'English · 3D Laser',
                'Telugu · 2D Atmos',
                'Hindi · 4K RGB',
              ].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedLanguageFormat(fmt)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold flex-shrink-0 transition border ${
                    selectedLanguageFormat === fmt
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. TWO THEATRES WITH SHOWTIMES (MATCHING SCREENSHOT 2: PHOENIX & BROADWAY) ── */}
          <div className="space-y-5">
            <div className="flex items-center space-x-2">
              <Film className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg sm:text-xl font-black text-white">Theatres &amp; Showtimes</h2>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {CINEMA_THEATRES.map((theatre) => {
                const isCurrentTheatre = selectedTheatreId === theatre.id;
                const isFav = favoriteTheatres.includes(theatre.id);

                return (
                  <div
                    key={theatre.id}
                    className={`bg-slate-900/90 border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl transition-all ${
                      isCurrentTheatre ? 'border-slate-700 ring-1 ring-slate-700/80 bg-slate-900/95' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Theatre Header Info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        {/* Circular Logo */}
                        <div className="w-12 h-12 rounded-full border border-slate-700 bg-black flex items-center justify-center text-[10px] font-black text-center uppercase tracking-tighter text-amber-300 shadow-md flex-shrink-0">
                          {theatre.logo}
                        </div>

                        {/* Name, Info Tooltip, Facilities */}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                              {theatre.name}
                            </h3>
                            <span
                              className="text-slate-500 hover:text-slate-300 cursor-pointer"
                              title="Theatre amenities, parking, and wheelchair accessibility information"
                            >
                              <Info className="w-3.5 h-3.5 inline text-slate-400 hover:text-white" />
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-medium">
                            <span className="text-emerald-400 font-bold">{theatre.distance}</span>
                            <span>·</span>
                            <span className="bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/40 text-amber-300 font-extrabold text-[10px]">
                              {theatre.priceLabel}
                            </span>
                            <span>·</span>
                            {theatre.features.map((feat) => (
                              <span
                                key={feat}
                                className="bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 text-slate-300 text-[10px]"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Favorite Heart Icon */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(theatre.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1.5 flex-shrink-0"
                        title={isFav ? 'Remove from favorites' : 'Add to favorite theatres'}
                      >
                        <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                      </button>
                    </div>

                    {/* Showtimes Buttons Row */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {theatre.showtimes.map((slot) => {
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => {
                              const params = new URLSearchParams({
                                theatre: theatre.id,
                                theatreName: theatre.name,
                                date: selectedDate,
                                time: slot.time,
                                format: slot.format,
                              });
                              router.push(`/events/${eventId}/seats?${params.toString()}`);
                            }}
                            className="px-4 py-2.5 rounded-xl text-center transition-all duration-150 border bg-slate-950/90 border-slate-800 text-slate-200 hover:border-emerald-500 hover:bg-slate-800/90 hover:scale-105 group shadow-md"
                          >
                            <div className="text-xs sm:text-sm font-black text-emerald-400 group-hover:text-emerald-300 transition">
                              {slot.time}
                            </div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-slate-200 transition">
                              {slot.format}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick helper tip banner */}
            <div className="bg-slate-950/60 border border-dashed border-slate-800/90 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Click any preferred showtime above to choose your seats in the cinema hall.</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Instant Seat Allocation
              </span>
            </div>
          </div>
        </div>
      ) : isSport ? (
        /* ── SPORTS STADIUM MODE ── */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl overflow-hidden">
          {/* Match Scoreboard Header */}
          {event.teams ? (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">
                {event.teams.tournament || 'STADIUM CHAMPIONSHIP'}
              </p>
              <div className="flex items-center justify-center space-x-6 sm:space-x-12">
                <div className="text-center">
                  <span className="text-xl sm:text-2xl font-black text-amber-400">{event.teams.teamAShort || 'TEAM A'}</span>
                  <p className="text-xs font-semibold text-slate-300">{event.teams.teamA}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-black text-slate-400">
                  VS
                </div>
                <div className="text-center">
                  <span className="text-xl sm:text-2xl font-black text-sky-400">{event.teams.teamBShort || 'TEAM B'}</span>
                  <p className="text-xs font-semibold text-slate-300">{event.teams.teamB}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stadium Match Seating</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Select Stadium Stand Seats</h2>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-300 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-amber-950/80 border border-amber-500/80" />
              <span>Pavilion VIP Terrace</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-emerald-950/80 border border-emerald-500/80" />
              <span>North / South Stands</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700" />
              <span>General Bleachers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-sky-600 border border-sky-400 shadow-sm" />
              <span className="font-bold text-white">Selected</span>
            </div>
          </div>

          {/* STADIUM PITCH / GROUND GRAPHIC */}
          <div className="max-w-2xl mx-auto space-y-2 text-center">
            <div className="py-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 border-2 border-emerald-500/40 text-center shadow-inner">
              <span className="text-xs font-black tracking-widest text-emerald-300 uppercase">
                🏟️ CENTRAL CRICKET PITCH / STADIUM TURF 🏟️
              </span>
            </div>
          </div>

          {/* STADIUM STANDS SEATING GRID */}
          <div className="max-w-3xl mx-auto space-y-6 pt-2">
            {/* VIP PAVILION STAND (Row A, B) */}
            {rowKeys.filter((r) => r === 'A' || r === 'B').length > 0 && (
              <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3 text-center">
                <p className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  👑 South Pavilion VIP Terrace &amp; Hospitality Box
                </p>
                <div className="space-y-2">
                  {rowKeys.filter((r) => r === 'A' || r === 'B').map((rowKey) => (
                    <div key={rowKey} className="flex items-center justify-center space-x-3">
                      <span className="text-xs font-bold text-amber-300 w-6 text-center">{rowKey}</span>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {(rowsMap[rowKey] ?? []).map((seat) => renderSeatButton(seat, 'VIP Pavilion'))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NORTH & EAST STANDS */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-3 text-center">
              <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                🏟️ Grandstands &amp; Tier Seating
              </p>
              <div className="space-y-2 pt-1">
                {rowKeys.filter((r) => r !== 'A' && r !== 'B').map((rowKey) => (
                  <div key={rowKey} className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => toggleRowSelection(rowKey)}
                      className="w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {rowKey}
                    </button>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {(rowsMap[rowKey] ?? []).map((seat) => renderSeatButton(seat))}
                    </div>
                    <button
                      onClick={() => toggleRowSelection(rowKey)}
                      className="w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {rowKey}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selection Bar & Confirm CTA */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase">Stadium Reservation</p>
              <p className="text-base font-bold text-white">
                {selectedSeatsList.length > 0 ? (
                  <span className="text-emerald-400">{selectedSeatsList.join(', ')}</span>
                ) : (
                  <span className="text-slate-500 font-normal">No seats selected</span>
                )}
              </p>
              {selectedSeatIds.length > 0 && (
                <p className="text-xs text-slate-400">
                  {selectedSeatIds.length} seat{selectedSeatIds.length > 1 ? 's' : ''} ×{' '}
                  <span className="text-amber-400 font-semibold">₹{pricePerSeat.toLocaleString('en-IN')}</span>
                  {' '}={' '}
                  <span className="text-white font-bold text-sm">₹{totalCost.toLocaleString('en-IN')}</span>
                </p>
              )}
            </div>

            <button
              onClick={handleOpenPayment}
              disabled={selectedSeatIds.length === 0}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 disabled:opacity-40 flex items-center justify-center space-x-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Proceed to Pay — ₹{totalCost.toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>
      ) : isRoadShow ? (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
              <Ticket className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">General Entry Passes</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Road Show Event — Open Arena / Promenade Entry. No seated reservation required. Select the number of entry passes you need below.
            </p>
          </div>

          {/* Pass Quantity Counter Box */}
          <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6 text-center shadow-inner">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Select Quantity of Passes</p>

            <div className="flex items-center justify-center space-x-6">
              <button
                type="button"
                onClick={() => setRoadShowPassCount((prev) => Math.max(1, prev - 1))}
                disabled={roadShowPassCount <= 1}
                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-extrabold text-2xl transition flex items-center justify-center border border-slate-700"
              >
                -
              </button>
              <div className="text-center min-w-[100px]">
                <span className="text-4xl font-extrabold text-sky-400">{roadShowPassCount}</span>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  Pass{roadShowPassCount > 1 ? 'es' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoadShowPassCount((prev) => Math.min(10, prev + 1))}
                disabled={roadShowPassCount >= 10}
                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-extrabold text-2xl transition flex items-center justify-center border border-slate-700"
              >
                +
              </button>
            </div>

            {/* Quick selection chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setRoadShowPassCount(count)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                    roadShowPassCount === count
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {count} {count === 1 ? 'Pass' : 'Passes'}
                </button>
              ))}
            </div>
          </div>

          {/* Selection Bar & Confirm CTA */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase">General Entry Reservation</p>
              <p className="text-base font-bold text-white">
                <span className="text-sky-400">{roadShowPassCount} General Admission Pass{roadShowPassCount > 1 ? 'es' : ''}</span>
              </p>
              <p className="text-xs text-slate-400">
                {roadShowPassCount} pass{roadShowPassCount > 1 ? 'es' : ''} ×{' '}
                <span className="text-amber-400 font-semibold">₹{pricePerSeat.toLocaleString('en-IN')}</span>
                {' '}={' '}
                <span className="text-white font-bold text-sm">₹{totalCost.toLocaleString('en-IN')}</span>
              </p>
            </div>

            <button
              onClick={handleOpenPayment}
              disabled={selectedSeatIds.length === 0}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition shadow-lg shadow-sky-600/20 disabled:opacity-40 flex items-center justify-center space-x-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Proceed to Pay — ₹{totalCost.toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>
      ) : isMusicConcert ? (
        /* ── STADIUM ARENA LAYOUT (ONLY FOR MUSIC CONCERTS — AR RAHMAN, YUVAN, NEON NIGHTS) ── */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl overflow-hidden">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold">
              <Ticket className="w-3.5 h-3.5 text-pink-400" />
              <span>Music Concert Arena Seating Plan</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Select Your Concert Seats</h2>
            <p className="text-xs text-slate-400">Click any seat to add it to your reservation</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-300 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-pink-950/80 border border-pink-500/80" />
              <span>Fan Pit 1 (Front Stage)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-orange-950/80 border border-orange-500/80" />
              <span>VIP Platform</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-sky-950/80 border border-sky-400/80" />
              <span>Fan Pit 2</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-purple-950/80 border border-purple-400/80" />
              <span>Fan Pit 3</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-teal-950/80 border border-teal-500/80" />
              <span>Bronze</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-cyan-950/80 border border-cyan-400/80" />
              <span>General</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-sky-600 border border-sky-400 shadow-sm" />
              <span className="font-bold text-white">Selected</span>
            </div>
          </div>

          {/* STAGE + T-RUNWAY CATWALK (Matching Diagram Image 100%) */}
          <div className="flex flex-col items-center pt-2">
            <div className="w-64 py-3 rounded-xl bg-slate-200 text-slate-900 border-2 border-slate-300 text-center shadow-lg font-black tracking-widest text-xs uppercase">
              STAGE
            </div>
            <div className="w-16 h-10 bg-slate-300 border-x-2 border-b-2 border-slate-400" />
            <div className="w-24 h-5 bg-slate-300 border-2 border-slate-400 rounded-b-lg shadow-sm" />
          </div>

          {/* ARENA CONTAINER */}
          <div className="max-w-3xl mx-auto space-y-4 pt-2">
            
            {/* ROW 1: FAN PIT 1 (LEFT & RIGHT) + VIP SIDE PLATFORMS */}
            <div className="grid grid-cols-12 gap-3 items-stretch">
              
              {/* VIP LEFT (Angled Orange Platform) */}
              <div className="col-span-3 rotate-3 origin-right bg-orange-950/50 border-2 border-orange-500/80 rounded-2xl p-3 flex flex-col justify-between text-center shadow-md">
                <div>
                  <p className="text-[11px] font-black text-orange-400 uppercase tracking-wider">VIP LEFT</p>
                  <p className="text-[9px] text-orange-300/80 font-semibold">Elevated Platform</p>
                </div>
                <div className="flex flex-wrap gap-1 justify-center py-2">
                  {(rowsMap['B'] ?? []).slice(0, 5).map((seat) => renderSeatButton(seat))}
                </div>
              </div>

              {/* FAN PIT 1 LEFT (Pink Box) */}
              <div className="col-span-3 bg-pink-950/50 border-2 border-pink-500/80 rounded-2xl p-3 text-center shadow-md flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-black text-pink-300 uppercase tracking-wider">FAN PIT 1</p>
                  <p className="text-[9px] text-pink-400/80 font-semibold">Left Front Pit</p>
                </div>
                <div className="flex flex-wrap gap-1 justify-center py-2">
                  {(rowsMap['A'] ?? []).slice(0, 5).map((seat) => renderSeatButton(seat))}
                </div>
              </div>

              {/* FAN PIT 1 RIGHT (Pink Box) */}
              <div className="col-span-3 bg-pink-950/50 border-2 border-pink-500/80 rounded-2xl p-3 text-center shadow-md flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-black text-pink-300 uppercase tracking-wider">FAN PIT 1</p>
                  <p className="text-[9px] text-pink-400/80 font-semibold">Right Front Pit</p>
                </div>
                <div className="flex flex-wrap gap-1 justify-center py-2">
                  {(rowsMap['A'] ?? []).slice(5).map((seat) => renderSeatButton(seat))}
                </div>
              </div>

              {/* VIP RIGHT (Angled Orange Platform) */}
              <div className="col-span-3 -rotate-3 origin-left bg-orange-950/50 border-2 border-orange-500/80 rounded-2xl p-3 flex flex-col justify-between text-center shadow-md">
                <div>
                  <p className="text-[11px] font-black text-orange-400 uppercase tracking-wider">VIP RIGHT</p>
                  <p className="text-[9px] text-orange-300/80 font-semibold">Elevated Platform</p>
                </div>
                <div className="flex flex-wrap gap-1 justify-center py-2">
                  {(rowsMap['B'] ?? []).slice(5).map((seat) => renderSeatButton(seat))}
                </div>
              </div>

            </div>

            {/* ROW 2: FAN PIT 2 (Light Blue Box) */}
            <div className="bg-sky-950/50 border-2 border-sky-400/80 rounded-2xl p-4 text-center shadow-md space-y-2">
              <div className="flex items-center justify-between border-b border-sky-800/60 pb-1.5 px-2">
                <span className="text-xs font-extrabold text-sky-300 uppercase tracking-wider">FAN PIT 2</span>
                <span className="text-[10px] text-sky-400 font-bold">Standing Zone</span>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center py-1">
                {(rowsMap['C'] ?? []).map((seat) => renderSeatButton(seat))}
              </div>
            </div>

            {/* ROW 3: FAN PIT 3 (Purple Box) */}
            <div className="bg-purple-950/50 border-2 border-purple-400/80 rounded-2xl p-4 text-center shadow-md space-y-2">
              <div className="flex items-center justify-between border-b border-purple-800/60 pb-1.5 px-2">
                <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider">FAN PIT 3</span>
                <span className="text-[10px] text-purple-400 font-bold">Mid Standing Zone</span>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center py-1">
                {(rowsMap['D'] ?? []).map((seat) => renderSeatButton(seat))}
              </div>
            </div>

            {/* ROW 4: BRONZE (Teal Box) */}
            <div className="bg-teal-950/50 border-2 border-teal-500/80 rounded-2xl p-4 text-center shadow-md space-y-2">
              <div className="flex items-center justify-between border-b border-teal-800/60 pb-1.5 px-2">
                <span className="text-xs font-extrabold text-teal-300 uppercase tracking-wider">BRONZE</span>
                <span className="text-[10px] text-teal-400 font-bold">Lower Seated Tier</span>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center py-1">
                {(rowsMap['E'] ?? []).map((seat) => renderSeatButton(seat))}
              </div>
            </div>

            {/* ROW 5: GENERAL (Cyan Box) */}
            <div className="bg-cyan-950/50 border-2 border-cyan-400/80 rounded-2xl p-4 text-center shadow-md space-y-2">
              <div className="flex items-center justify-between border-b border-cyan-800/60 pb-1.5 px-2">
                <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">GENERAL</span>
                <span className="text-[10px] text-cyan-400 font-bold">Rear Admission Zone</span>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center py-1">
                {rowKeys
                  .filter((r) => !['A', 'B', 'C', 'D', 'E'].includes(r))
                  .flatMap((r) => rowsMap[r] ?? [])
                  .map((seat) => renderSeatButton(seat))}
              </div>
            </div>

          </div>

          {/* Selection Bar & Confirm CTA */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase">Your Selection</p>
              <p className="text-base font-bold text-white">
                {selectedSeatsList.length > 0 ? (
                  <span className="text-sky-400">{selectedSeatsList.join(', ')}</span>
                ) : (
                  <span className="text-slate-500 font-normal">No seats selected</span>
                )}
              </p>
              {selectedSeatIds.length > 0 && (
                <p className="text-xs text-slate-400">
                  {selectedSeatIds.length} seat{selectedSeatIds.length > 1 ? 's' : ''} ×{' '}
                  <span className="text-amber-400 font-semibold">₹{pricePerSeat.toLocaleString('en-IN')}</span>
                  {' '}={' '}
                  <span className="text-white font-bold text-sm">₹{totalCost.toLocaleString('en-IN')}</span>
                </p>
              )}
            </div>

            <button
              onClick={handleOpenPayment}
              disabled={selectedSeatIds.length === 0}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition shadow-lg shadow-sky-600/20 disabled:opacity-40 flex items-center justify-center space-x-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Proceed to Pay — ₹{totalCost.toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Seating Layout Container (Summits, Workshops, Comedy, Kollywood Stars Night) */

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white">Select Your Seats</h2>
            <p className="text-xs text-slate-400">Click a seat to select it · Click the <span className="text-amber-300 font-semibold">row letter</span> to select the entire row</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 pt-2 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700" />
              <span>Available (Standard)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-amber-950/80 border border-amber-500/60" />
              <span>VIP / Premium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-sky-500 border border-sky-400 shadow-sm" />
              <span className="font-semibold text-white">Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-rose-950/80 border border-rose-800/80 opacity-60" />
              <span className="text-slate-500">Booked</span>
            </div>
          </div>

          {/* STAGE — Concert Hall Stage Area */}
          <div className="relative max-w-2xl mx-auto py-5 rounded-b-3xl bg-gradient-to-b from-slate-950 via-amber-950/30 to-slate-900 border-x border-b border-amber-500/40 text-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-sky-500/10 to-transparent pointer-events-none" />
            <span className="relative z-10 text-xs font-black tracking-widest text-amber-300 uppercase drop-shadow-md">
              ✨ MAIN CONCERT STAGE & ORCHESTRA PIT ✨
            </span>
          </div>

          {/* Concert Hall Arena Seating Layout */}
          <div className="overflow-x-auto py-6">
            <div className="min-w-[680px] max-w-4xl mx-auto space-y-10">

              {/* ── SECTION 1: FRONT ORCHESTRA (Rows A, B) ── */}
              {rowKeys.filter((r) => r === 'A' || r === 'B').length > 0 && (
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-amber-900/30">
                  <div className="text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800/60">
                      Front Orchestra & VIP Tier
                    </span>
                  </div>
                  {rowKeys.filter((r) => r === 'A' || r === 'B').map((rowKey) => {
                    const rowSeats = rowsMap[rowKey] ?? [];
                    const availableInRow = rowSeats.filter((s) => s.status !== 'BOOKED');
                    const allRowSelected = availableInRow.length > 0 && availableInRow.every((s) => selectedSeatIds.includes(s.id));
                    const totalInRow = rowSeats.length;
                    const centerIdx = (totalInRow - 1) / 2;

                    return (
                      <div key={rowKey} className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => toggleRowSelection(rowKey)}
                          title={`Select Row ${rowKey}`}
                          className={`w-7 h-7 rounded-md text-xs font-extrabold flex items-center justify-center transition border ${
                            allRowSelected ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-800 text-amber-300 border-amber-700/50'
                          }`}
                        >
                          {rowKey}
                        </button>
                        <div className="flex items-center space-x-2">
                          {rowSeats.map((seat, seatIdx) => {
                            const isSelected = selectedSeatIds.includes(seat.id);
                            const isBooked = seat.status === 'BOOKED';
                            const isVip = seat.seatType === 'VIP' || seat.seatType === 'PREMIUM';
                            const offsetFromCenter = seatIdx - centerIdx;
                            const curveY = Math.pow(Math.abs(offsetFromCenter), 1.6) * 1.5;
                            const rotateDeg = offsetFromCenter * 1.8;

                            let seatBg = 'bg-slate-800 text-slate-200 border-slate-700';
                            if (isVip) seatBg = 'bg-amber-950/70 text-amber-200 border-amber-700/70 shadow-sm';
                            if (isSelected) seatBg = 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-400/50';
                            if (isBooked) seatBg = 'bg-rose-950/50 text-rose-500 border-rose-900/60 cursor-not-allowed opacity-50';

                            return (
                              <button
                                key={seat.id}
                                disabled={isBooked}
                                onClick={() => toggleSeatSelection(seat)}
                                style={{ transform: `translateY(${curveY}px) rotate(${rotateDeg}deg)` }}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border text-xs font-bold transition-all duration-200 ${seatBg}`}
                              >
                                {seat.seatNumber}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => toggleRowSelection(rowKey)}
                          title={`Select Row ${rowKey}`}
                          className={`w-7 h-7 rounded-md text-xs font-extrabold flex items-center justify-center transition border ${
                            allRowSelected ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-800 text-amber-300 border-amber-700/50'
                          }`}
                        >
                          {rowKey}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── SECTION 2: SIDE BALCONIES & CENTER ORCHESTRA (Rows C, D, E, F) ── */}
              {rowKeys.filter((r) => ['C', 'D', 'E', 'F'].includes(r)).length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">
                    <div className="text-amber-400 flex items-center justify-center space-x-1">
                      <span>Left Balcony Tier</span>
                    </div>
                    <div className="text-sky-400">Main Orchestra Floor</div>
                    <div className="text-amber-400 flex items-center justify-center space-x-1">
                      <span>Right Balcony Tier</span>
                    </div>
                  </div>

                  {rowKeys.filter((r) => ['C', 'D', 'E', 'F'].includes(r)).map((rowKey) => {
                    const rowSeats = rowsMap[rowKey] ?? [];
                    const leftSeats = rowSeats.slice(0, 3);
                    const centerSeats = rowSeats.slice(3, 7);
                    const rightSeats = rowSeats.slice(7);

                    const availableInRow = rowSeats.filter((s) => s.status !== 'BOOKED');
                    const allRowSelected = availableInRow.length > 0 && availableInRow.every((s) => selectedSeatIds.includes(s.id));

                    return (
                      <div key={rowKey} className="flex items-center justify-between gap-4 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                        {/* LEFT BALCONY (Angled 20deg Inward towards Stage) */}
                        <div className="flex items-center space-x-2 rotate-6 origin-right bg-amber-950/30 p-2 rounded-xl border border-amber-900/40 shadow-md">
                          <button
                            onClick={() => toggleRowSelection(rowKey)}
                            className={`w-6 h-6 rounded text-[10px] font-bold border ${allRowSelected ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-amber-300 border-amber-700/50'}`}
                          >
                            {rowKey}
                          </button>
                          <div className="flex space-x-1.5">
                            {leftSeats.map((seat) => {
                              const isSelected = selectedSeatIds.includes(seat.id);
                              const isBooked = seat.status === 'BOOKED';
                              const isVip = seat.seatType === 'VIP' || seat.seatType === 'PREMIUM';
                              let seatBg = 'bg-slate-800 text-slate-200 border-slate-700';
                              if (isVip) seatBg = 'bg-amber-950/70 text-amber-200 border-amber-700/70';
                              if (isSelected) seatBg = 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-400/50';
                              if (isBooked) seatBg = 'bg-rose-950/50 text-rose-500 border-rose-900/60 cursor-not-allowed opacity-50';

                              return (
                                <button
                                  key={seat.id}
                                  disabled={isBooked}
                                  onClick={() => toggleSeatSelection(seat)}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-[11px] font-bold ${seatBg}`}
                                >
                                  {seat.seatNumber}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* CENTER ORCHESTRA FLOOR */}
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-inner">
                          {centerSeats.map((seat) => {
                            const isSelected = selectedSeatIds.includes(seat.id);
                            const isBooked = seat.status === 'BOOKED';
                            const isVip = seat.seatType === 'VIP' || seat.seatType === 'PREMIUM';
                            let seatBg = 'bg-slate-800 text-slate-200 border-slate-700';
                            if (isVip) seatBg = 'bg-amber-950/70 text-amber-200 border-amber-700/70';
                            if (isSelected) seatBg = 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-400/50';
                            if (isBooked) seatBg = 'bg-rose-950/50 text-rose-500 border-rose-900/60 cursor-not-allowed opacity-50';

                            return (
                              <button
                                key={seat.id}
                                disabled={isBooked}
                                onClick={() => toggleSeatSelection(seat)}
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-[11px] font-bold ${seatBg}`}
                              >
                                {seat.seatNumber}
                              </button>
                            );
                          })}
                        </div>

                        {/* RIGHT BALCONY (Angled -20deg Inward towards Stage) */}
                        <div className="flex items-center space-x-2 -rotate-6 origin-left bg-amber-950/30 p-2 rounded-xl border border-amber-900/40 shadow-md">
                          <div className="flex space-x-1.5">
                            {rightSeats.map((seat) => {
                              const isSelected = selectedSeatIds.includes(seat.id);
                              const isBooked = seat.status === 'BOOKED';
                              const isVip = seat.seatType === 'VIP' || seat.seatType === 'PREMIUM';
                              let seatBg = 'bg-slate-800 text-slate-200 border-slate-700';
                              if (isVip) seatBg = 'bg-amber-950/70 text-amber-200 border-amber-700/70';
                              if (isSelected) seatBg = 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-400/50';
                              if (isBooked) seatBg = 'bg-rose-950/50 text-rose-500 border-rose-900/60 cursor-not-allowed opacity-50';

                              return (
                                <button
                                  key={seat.id}
                                  disabled={isBooked}
                                  onClick={() => toggleSeatSelection(seat)}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-[11px] font-bold ${seatBg}`}
                                >
                                  {seat.seatNumber}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => toggleRowSelection(rowKey)}
                            className={`w-6 h-6 rounded text-[10px] font-bold border ${allRowSelected ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-amber-300 border-amber-700/50'}`}
                          >
                            {rowKey}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── SECTION 3: REAR HORSESHOE BALCONY ARC (Rows G, H, I, J...) ── */}
              {rowKeys.filter((r) => !['A', 'B', 'C', 'D', 'E', 'F'].includes(r)).length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800/60">
                      Rear Horseshoe Balcony Tier
                    </span>
                  </div>

                  {rowKeys.filter((r) => !['A', 'B', 'C', 'D', 'E', 'F'].includes(r)).map((rowKey) => {
                    const rowSeats = rowsMap[rowKey] ?? [];
                    const availableInRow = rowSeats.filter((s) => s.status !== 'BOOKED');
                    const allRowSelected = availableInRow.length > 0 && availableInRow.every((s) => selectedSeatIds.includes(s.id));
                    const totalInRow = rowSeats.length;
                    const centerIdx = (totalInRow - 1) / 2;

                    return (
                      <div key={rowKey} className="flex items-center justify-center space-x-3 py-1.5">
                        <button
                          onClick={() => toggleRowSelection(rowKey)}
                          className={`w-7 h-7 rounded-md text-xs font-extrabold flex items-center justify-center transition border ${
                            allRowSelected ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-800 text-amber-300 border-amber-700/50'
                          }`}
                        >
                          {rowKey}
                        </button>
                        <div className="flex items-center space-x-2">
                          {rowSeats.map((seat, seatIdx) => {
                            const isSelected = selectedSeatIds.includes(seat.id);
                            const isBooked = seat.status === 'BOOKED';
                            const isVip = seat.seatType === 'VIP' || seat.seatType === 'PREMIUM';
                            const offsetFromCenter = seatIdx - centerIdx;
                            const curveY = Math.pow(Math.abs(offsetFromCenter), 1.7) * 2.2;
                            const rotateDeg = offsetFromCenter * 2.5;

                            let seatBg = 'bg-slate-800 text-slate-200 border-slate-700';
                            if (isVip) seatBg = 'bg-amber-950/70 text-amber-200 border-amber-700/70';
                            if (isSelected) seatBg = 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-400/50';
                            if (isBooked) seatBg = 'bg-rose-950/50 text-rose-500 border-rose-900/60 cursor-not-allowed opacity-50';

                            return (
                              <button
                                key={seat.id}
                                disabled={isBooked}
                                onClick={() => toggleSeatSelection(seat)}
                                style={{ transform: `translateY(${curveY}px) rotate(${rotateDeg}deg)` }}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border text-xs font-bold transition-all duration-200 ${seatBg}`}
                              >
                                {seat.seatNumber}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => toggleRowSelection(rowKey)}
                          className={`w-7 h-7 rounded-md text-xs font-extrabold flex items-center justify-center transition border ${
                            allRowSelected ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-800 text-amber-300 border-amber-700/50'
                          }`}
                        >
                          {rowKey}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

          {/* Selection Bar & Confirm CTA */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase">Your Selection</p>
              <p className="text-base font-bold text-white">
                {selectedSeatsList.length > 0 ? (
                  <span className="text-sky-400">{selectedSeatsList.join(', ')}</span>
                ) : (
                  <span className="text-slate-500 font-normal">No seats selected</span>
                )}
              </p>
              {selectedSeatIds.length > 0 && (
                <p className="text-xs text-slate-400">
                  {selectedSeatIds.length} seat{selectedSeatIds.length > 1 ? 's' : ''} ×{' '}
                  <span className="text-amber-400 font-semibold">₹{pricePerSeat.toLocaleString('en-IN')}</span>
                  {' '}={' '}
                  <span className="text-white font-bold text-sm">₹{totalCost.toLocaleString('en-IN')}</span>
                </p>
              )}
            </div>

            <button
              onClick={handleOpenPayment}
              disabled={selectedSeatIds.length === 0}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition shadow-lg shadow-sky-600/20 disabled:opacity-40 flex items-center justify-center space-x-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Proceed to Pay — ₹{totalCost.toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        totalAmount={totalCost}
        seatCount={selectedSeatIds.length}
        eventTitle={event.title}
        onClose={() => {
          setIsPaymentOpen(false);
          loadData(); // refresh seat availability if modal closed without paying
        }}
        onPaymentSuccess={handleBookingConfirm}
      />
    </div>
  );
}
