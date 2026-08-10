'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, AdminStats, BookingItem, EventItem } from '@/lib/api/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { Shield, Calendar, Ticket, CheckCircle2, AlertCircle, Plus, Loader2, PieChart, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, bookingsRes, eventsRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminBookings(),
        api.getAdminEvents(),
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
      setEvents(eventsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4 max-w-lg mx-auto my-12">
        <Shield className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400">You must be logged in as an Administrator to access this area.</p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-sm transition"
        >
          Admin Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrator Control Panel</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/events/new"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
          <Link
            href="/admin/events"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition border border-slate-700"
          >
            Manage Events
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading admin metrics...</p>
        </div>
      ) : (
        <>
          {/* Metrics Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Events</span>
              <p className="text-3xl font-extrabold text-white">{stats?.totalEvents ?? 0}</p>
              <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-800">
                <span>Published: {stats?.publishedEvents}</span>
                <span>Cancelled: {stats?.cancelledEvents}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Bookings</span>
              <p className="text-3xl font-extrabold text-sky-400">{stats?.totalBookings ?? 0}</p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                Confirmed Reservations
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase">Booked Seats</span>
              <p className="text-3xl font-extrabold text-emerald-400">{stats?.bookedSeats ?? 0}</p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                Out of {stats?.totalSeats ?? 0} Total Seats
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase">Overall Booking Rate</span>
              <p className="text-3xl font-extrabold text-amber-400">{stats?.bookingRate ?? '0%'}</p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                Available Seats: {stats?.availableSeats ?? 0}
              </div>
            </div>
          </div>

          {/* Recent System Bookings Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">System Booking Activity</h3>
              <span className="text-xs text-slate-400">{bookings.length} Total Bookings</span>
            </div>

            {bookings.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No bookings recorded in database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Seats</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-sky-400">{b.bookingReference}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-200">{b.user?.fullName}</p>
                          <p className="text-[10px] text-slate-500">{b.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-200 font-medium">{b.event?.title}</td>
                        <td className="px-4 py-3 font-bold text-emerald-400">{b.seats?.join(', ')}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
