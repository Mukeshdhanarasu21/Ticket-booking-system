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
      if (!user && !localStorage.getItem('auth_token')) {
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

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="w-9 h-9 text-sky-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading your receipt…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !booking) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Receipt Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'This booking record does not exist or you do not have access.'}</p>
        <button
          onClick={() => router.push('/bookings')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition"
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
      {/* Back button */}
      <button
        onClick={() => router.push('/bookings')}
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Bookings</span>
      </button>

      {/* ── Ticket Card ── */}
      <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">

        {/* Header band */}
        <div className={`px-8 py-5 flex items-center justify-between ${isConfirmed ? 'bg-gradient-to-r from-sky-950 to-slate-900 border-b border-sky-900/60' : 'bg-gradient-to-r from-rose-950 to-slate-900 border-b border-rose-900/60'}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConfirmed ? 'bg-sky-500/20' : 'bg-rose-500/20'}`}>
              <Ticket className={`w-5 h-5 ${isConfirmed ? 'text-sky-400' : 'text-rose-400'}`} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">EventBook Receipt</p>
              <p className="text-base font-extrabold text-white">Booking Confirmation</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider border ${isConfirmed ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'}`}>
            {isConfirmed ? (
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="w-3.5 h-3.5" /><span>{booking.status}</span></span>
            ) : (
              <span className="flex items-center space-x-1.5"><XCircle className="w-3.5 h-3.5" /><span>{booking.status}</span></span>
            )}
          </span>
        </div>

        <div className="p-8 space-y-7">

          {/* Booking Reference */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-700 pb-7">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center justify-center space-x-1">
              <Hash className="w-3 h-3" /><span>Booking Reference</span>
            </p>
            <p className="text-4xl font-mono font-extrabold text-sky-400 tracking-widest">{booking.bookingReference}</p>
            <p className="text-[11px] text-slate-500">Show this code at the venue entrance</p>
          </div>

          {/* Event Info */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Event</p>
            <p className="text-2xl font-extrabold text-white leading-tight">{booking.event?.title ?? '—'}</p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 bg-slate-950 rounded-xl p-4 border border-slate-800">
              <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Venue</p>
                <p className="text-sm font-semibold text-slate-200 leading-snug">{booking.event?.venue ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-950 rounded-xl p-4 border border-slate-800">
              <Calendar className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Date</p>
                <p className="text-sm font-semibold text-slate-200">{booking.event?.eventDate ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-950 rounded-xl p-4 border border-slate-800">
              <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Time</p>
                <p className="text-sm font-semibold text-slate-200">
                  {booking.event?.startTime ?? '—'}
                  {booking.event?.endTime ? ` — ${booking.event.endTime}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-slate-950 rounded-xl p-4 border border-slate-800">
              <User className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Booked By</p>
                <p className="text-sm font-semibold text-slate-200">{user?.fullName ?? user?.email ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Seats */}
          <div className="bg-sky-950/30 border border-sky-900/50 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Armchair className="w-4 h-4 text-sky-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300">
                Reserved Seats ({booking.totalSeats})
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(booking.seats ?? []).map((seat) => (
                <span
                  key={seat}
                  className="px-3 py-1.5 rounded-lg bg-sky-900/60 border border-sky-700/60 text-sky-200 font-mono font-bold text-sm"
                >
                  {seat}
                </span>
              ))}
              {(!booking.seats || booking.seats.length === 0) && (
                <span className="text-slate-500 text-sm">No seat data available</span>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Payment Summary</p>
            </div>
            <div className="divide-y divide-slate-800">
              <div className="flex justify-between px-5 py-3 text-sm">
                <span className="text-slate-400">Price per Seat</span>
                <span className="text-white font-semibold">₹{pricePerSeat.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between px-5 py-3 text-sm">
                <span className="text-slate-400">Number of Seats</span>
                <span className="text-white font-semibold">× {booking.totalSeats}</span>
              </div>
              <div className="flex justify-between px-5 py-4 text-base font-extrabold bg-slate-950/60">
                <span className="text-white flex items-center space-x-1.5">
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                  <span>Total Paid</span>
                </span>
                <span className="text-amber-400 text-xl">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1 gap-2">
            <span>Booked on: <span className="text-slate-400">{new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></span>
            {booking.cancelledAt && (
              <span className="text-rose-400">Cancelled: {new Date(booking.cancelledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            )}
            <span className="flex items-center space-x-1 text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secured Transaction</span>
            </span>
          </div>
        </div>

        {/* Cancel button */}
        {isConfirmed && (
          <div className="px-8 pb-8">
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="w-full py-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {cancelling ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Cancelling…</span></>
              ) : (
                <><XCircle className="w-4 h-4" /><span>Cancel Booking & Release Seats</span></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
