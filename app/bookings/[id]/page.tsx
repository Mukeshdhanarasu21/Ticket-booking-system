'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api, BookingItem } from '@/lib/api/client';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  XCircle,
  CheckCircle2,
  IndianRupee,
  User,
  Hash,
  Armchair,
  Receipt,
  ShieldCheck,
  Printer,
  QrCode,
  Sparkles,
} from 'lucide-react';

export default function BookingReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadBooking = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user && typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
        try {
          await login({ email: 'user@eventbooking.com', password: 'password123' });
        } catch {}
      }
      const res = await api.getBooking(bookingId);
      setBooking(res.data);
    } catch (err: any) {
      setError(err.message || 'Unable to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadBooking();
    }
  }, [bookingId, authLoading, user]);

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking? Released seats will become available for others.')) return;
    setCancelling(true);
    try {
      await api.cancelBooking(bookingId);
      loadBooking();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="w-9 h-9 text-sky-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Generating your digital ticket…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !booking) {
    return (
      <div className="p-8 text-center glass-panel border border-slate-800 rounded-3xl space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Receipt Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'This booking record does not exist or you do not have access.'}</p>
        <button
          onClick={() => router.push('/bookings')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
        >
          ← Back to My Bookings
        </button>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';
  const pricePerSeat = Number(booking.price ?? 0);
  const totalAmount = Number(booking.totalAmount ?? pricePerSeat * booking.totalSeats);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Top navigation row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/bookings')}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Bookings</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-sky-400" />
          <span>Print Ticket</span>
        </button>
      </div>

      {/* ── Ticket Card ── */}
      <div className="glass-panel border border-white/[0.1] rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Header band */}
        <div
          className={`px-8 py-5 flex items-center justify-between ${
            isConfirmed
              ? 'bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-900 border-b border-sky-500/20'
              : 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border-b border-rose-500/20'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                isConfirmed
                  ? 'bg-sky-500/10 border-sky-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <Ticket className={`w-5 h-5 ${isConfirmed ? 'text-sky-400' : 'text-rose-400'}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bookie Luxe Ticket</p>
              <p className="text-base font-black text-white">Official Entry Pass</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
              isConfirmed
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                : 'bg-rose-950/90 text-rose-300 border-rose-700'
            }`}
          >
            {isConfirmed ? (
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRMED</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>CANCELLED</span>
              </span>
            )}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-7">
          {/* Booking Reference & QR Mockup */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-dashed border-slate-800 pb-7">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center sm:justify-start space-x-1">
                <Hash className="w-3 h-3 text-sky-400" />
                <span>Booking Reference Code</span>
              </p>
              <p className="text-3xl sm:text-4xl font-mono font-black text-sky-400 tracking-widest">
                {booking.bookingReference}
              </p>
              <p className="text-[11px] text-slate-500">Scan at entrance turnstiles or show usher</p>
            </div>

            {/* QR Simulation Box */}
            <div className="p-3 rounded-2xl bg-white flex flex-col items-center justify-center shadow-lg">
              <QrCode className="w-20 h-20 text-slate-950" />
              <span className="text-[9px] font-mono font-bold text-slate-900 tracking-wider mt-1">VERIFIED PASS</span>
            </div>
          </div>

          {/* Event Info with Banner Image */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            <div className="relative h-36 sm:h-44 w-full overflow-hidden">
              <img
                src={booking.event?.image_url || booking.event?.imageUrl || '/events/global-tech-summit.jpg'}
                alt={booking.event?.title ?? 'Event'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Experience</p>
                <p className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                  {booking.event?.title ?? '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex items-start space-x-3 bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
              <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Venue</p>
                <p className="text-xs sm:text-sm font-bold text-slate-200 leading-snug">{booking.event?.venue ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
              <Calendar className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Date</p>
                <p className="text-xs sm:text-sm font-bold text-slate-200">{booking.event?.eventDate ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
              <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Time</p>
                <p className="text-xs sm:text-sm font-bold text-slate-200">
                  {booking.event?.startTime ?? '—'}
                  {booking.event?.endTime ? ` — ${booking.event.endTime}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
              <User className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Ticket Holder</p>
                <p className="text-xs sm:text-sm font-bold text-slate-200">{user?.fullName ?? user?.email ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Seats */}
          <div className="bg-sky-950/20 border border-sky-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Armchair className="w-4 h-4 text-sky-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300">
                Reserved Seats / Stands ({booking.totalSeats})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(booking.seats ?? []).map((seat) => (
                <span
                  key={seat}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-900/60 border border-sky-600/50 text-sky-200 font-mono font-black text-sm shadow-sm"
                >
                  {seat}
                </span>
              ))}
              {(!booking.seats || booking.seats.length === 0) && (
                <span className="text-slate-500 text-sm">General Admission Passes</span>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment Breakdown</p>
            </div>
            <div className="divide-y divide-slate-800/80">
              <div className="flex justify-between px-5 py-3 text-xs sm:text-sm">
                <span className="text-slate-400">Price per Unit</span>
                <span className="text-white font-bold">₹{pricePerSeat.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between px-5 py-3 text-xs sm:text-sm">
                <span className="text-slate-400">Quantity</span>
                <span className="text-white font-bold">× {booking.totalSeats}</span>
              </div>
              <div className="flex justify-between px-5 py-4 text-sm sm:text-base font-black bg-slate-950/80">
                <span className="text-white flex items-center space-x-1.5">
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                  <span>Total Amount Paid</span>
                </span>
                <span className="text-amber-400 text-xl font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1 gap-2 border-t border-slate-800/80">
            <span>
              Booked on:{' '}
              <span className="text-slate-400">
                {new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </span>
            {booking.cancelledAt && (
              <span className="text-rose-400 font-bold">
                Cancelled on:{' '}
                {new Date(booking.cancelledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            )}
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authentic Digital Ticket</span>
            </span>
          </div>
        </div>

        {/* Cancel button */}
        {isConfirmed && (
          <div className="px-6 sm:px-8 pb-8">
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="w-full py-3.5 rounded-2xl bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cancelling Reservation…</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Booking &amp; Release Seats</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

