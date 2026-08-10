'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api, EventItem } from '@/lib/api/client';
import { Search, MapPin, Calendar, Clock, Ticket, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getEvents({
        page,
        limit: 6,
        status: 'PUBLISHED',
        search,
      });
      setEvents(res.data);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadEvents();
  };

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Upcoming Events</h1>
          <p className="text-sm text-slate-400">Discover and reserve seats for live conferences, concerts, and workshops.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or venue..."
              className="pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-64 md:w-80 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 bg-slate-900/40 border border-slate-800/60 rounded-2xl space-y-3">
          <Ticket className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-slate-300">No events available</h3>
          <p className="text-sm text-slate-500">Try adjusting your search query or check back later.</p>
        </div>
      ) : (
        /* Events Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition space-y-4 shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    {evt.status}
                  </span>
                  {/* Price badge */}
                  <span className="text-sm font-bold text-amber-400 flex items-center space-x-1">
                    <span>₹</span>
                    <span>{Number(evt.price ?? 0).toLocaleString('en-IN')}</span>
                    <span className="text-[10px] font-normal text-slate-400">/ seat</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white line-clamp-1">{evt.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>{evt.event_date || evt.eventDate}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Ticket className="w-3.5 h-3.5 text-sky-400" />
                    <span>{evt.total_capacity || evt.capacity} seats</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/events/${evt.id}`}
                className="w-full py-2.5 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white font-semibold text-sm text-center block transition shadow-md"
              >
                View Event &amp; Book Seats
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
