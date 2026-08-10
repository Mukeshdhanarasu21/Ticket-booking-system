'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, EventItem } from '@/lib/api/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { Shield, Plus, Calendar, MapPin, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function AdminEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminEvents();
      setEvents(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadEvents();
    }
  }, [user]);

  const handleCancelEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to soft-cancel this event? No new bookings will be allowed.')) {
      return;
    }

    try {
      await api.cancelEvent(eventId);
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel event.');
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return <p className="text-center py-12 text-rose-400">Admin access required.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Manage Events</h1>
          <p className="text-sm text-slate-400">Create, update, and manage event publication status.</p>
        </div>

        <Link
          href="/admin/events/new"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition flex items-center space-x-1.5 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </Link>
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
          <p className="text-sm text-slate-400">Loading events list...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Event Title</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Price / Seat</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 font-bold text-white">{evt.title}</td>
                  <td className="px-4 py-3 text-slate-300">{evt.venue}</td>
                  <td className="px-4 py-3 text-slate-400">{evt.event_date || evt.eventDate}</td>
                  <td className="px-4 py-3 text-slate-300">{evt.total_capacity || evt.capacity} Seats</td>
                  <td className="px-4 py-3 font-bold text-amber-400">₹{Number(evt.price ?? 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        evt.status === 'PUBLISHED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : evt.status === 'CANCELLED'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/events/${evt.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition"
                    >
                      View Seat Grid
                    </Link>

                    {evt.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelEvent(evt.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 font-semibold text-[11px] transition"
                      >
                        Soft Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
