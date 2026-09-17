'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, BookingItem } from '@/lib/api/client';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Ticket,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
  XCircle,
  Film,
  Trophy,
  Music,
  Tv,
  QrCode,
  Sparkles,
} from 'lucide-react';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getBookings();
      setBookings(res.data);
    } catch (err: any) {
      setError(err.message || 'Unable to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Released seats will become available for others.')) {
      return;
    }

    try {
      await api.cancelBooking(bookingId);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center glass-panel border border-slate-800 rounded-3xl space-y-4 max-w-md mx-auto my-12">
        <Ticket className="w-10 h-10 text-sky-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400">Please log in to view your reserved bookings and receipts.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ticket Wallet</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">My Bookings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage your event reservations, match passes, and cinema tickets.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Fetching your tickets...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 glass-panel border border-slate-800 rounded-3xl space-y-4">
          <Ticket className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-slate-300">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t reserved any movie tickets, sports passes, or event seats yet.
          </p>
          <Link
            href="/events"
            className="inline-block px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/30"
          >
            Explore Experiences
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="glass-panel border border-white/[0.08] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Event Thumbnail */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                  <img
                    src={booking.event?.image_url || booking.event?.imageUrl || '/events/global-tech-summit.jpg'}
                    alt={booking.event?.title || 'Event'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-black text-sky-400 text-base">{booking.bookingReference}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{booking.event?.title || 'Event Booking'}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    {booking.event?.venue && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{booking.event.venue}</span>
                      </span>
                    )}
                    {booking.event?.eventDate && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>{booking.event.eventDate}</span>
                      </span>
                    )}
                    <span>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Seats Reserved: </span>
                      <span className="font-bold text-emerald-400">{booking.seats?.join(', ') || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total Paid: </span>
                      <span className="font-bold text-white">₹{booking.totalAmount?.toLocaleString('en-IN') || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                <Link
                  href={`/bookings/${booking.id}`}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center space-x-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>View Ticket Receipt</span>
                </Link>

                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 font-bold text-xs transition flex items-center space-x-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

