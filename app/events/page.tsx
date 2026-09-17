'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, EventItem } from '@/lib/api/client';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Film,
  Trophy,
  Music,
  Sparkles,
  Tv,
  Filter,
  ArrowRight,
  Flame,
} from 'lucide-react';

function EventsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialCity = searchParams.get('city') || 'ALL';

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sync category or city from URL if changed
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
    const c = searchParams.get('city');
    if (c) setCity(c);
  }, [searchParams]);

  const categories = [
    { id: 'ALL', label: 'All Experiences', icon: Sparkles, color: 'text-sky-400', activeClass: 'bg-sky-600 text-white' },
    { id: 'MOVIE', label: 'Movies', icon: Film, color: 'text-rose-400', activeClass: 'bg-rose-600 text-white' },
    { id: 'SPORT', label: 'Sports', icon: Trophy, color: 'text-emerald-400', activeClass: 'bg-emerald-600 text-white' },
    { id: 'CONCERT', label: 'Concerts', icon: Music, color: 'text-purple-400', activeClass: 'bg-purple-600 text-white' },
    { id: 'TECH', label: 'Tech Summits', icon: Tv, color: 'text-cyan-400', activeClass: 'bg-cyan-600 text-white' },
  ];

  const cities = ['ALL', 'Chennai', 'Coimbatore', 'Bengaluru'];

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getEvents({
        page,
        limit: 9,
        status: 'PUBLISHED',
        search: search || undefined,
        category: category !== 'ALL' ? category : undefined,
        city: city !== 'ALL' ? city : undefined,
      });
      setEvents(res.data);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load experiences. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, city]);

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
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover What&apos;s Happening</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Browse Experiences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Book tickets for latest movies, stadium cricket derbies, music festivals, and live tech summits.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, venue, genre..."
              className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-64 md:w-80 transition shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-sky-600/25"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Row: Category Pills & City Selector */}
      <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setPage(1);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 border ${
                  isSelected
                    ? `${cat.activeClass} border-transparent shadow-md`
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* City Filter */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>City:</span>
          </span>
          <div className="flex items-center space-x-1">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCity(c);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                  city === c
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {c === 'ALL' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>
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
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading experiences...</p>
        </div>
      ) : events.length === 0 ? (
        /* Empty state */
        <div className="text-center py-24 glass-panel border border-slate-800 rounded-3xl space-y-3">
          <Ticket className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-slate-300">No events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No matching events in {category !== 'ALL' ? category : 'any category'}. Try resetting filters.
          </p>
          <button
            onClick={() => {
              setCategory('ALL');
              setCity('ALL');
              setSearch('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Events Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const isMovie = evt.category === 'MOVIE';
            const isSport = evt.category === 'SPORT';
            const isConcert = evt.category === 'CONCERT';

            return (
              <div
                key={evt.id}
                className={`bg-slate-900/80 border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl group ${
                  isMovie
                    ? 'border-slate-800/80 glass-card-movie'
                    : isSport
                    ? 'border-slate-800/80 glass-card-sport'
                    : 'border-slate-800/80 glass-panel-hover'
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                  <img
                    src={evt.image_url || evt.imageUrl || '/events/global-tech-summit.jpg'}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                        isMovie
                          ? 'bg-rose-950/90 text-rose-300 border-rose-800/80'
                          : isSport
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80'
                          : isConcert
                          ? 'bg-purple-950/90 text-purple-300 border-purple-800/80'
                          : 'bg-sky-950/90 text-sky-300 border-sky-800/80'
                      }`}
                    >
                      {evt.category || 'EVENT'}
                    </span>

                    {evt.rating && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-slate-700">
                        {evt.rating}
                      </span>
                    )}
                  </div>

                  {/* Price badge */}
                  <span className="absolute bottom-3 right-3 text-xs font-extrabold text-amber-300 bg-slate-950/90 border border-amber-500/40 px-2.5 py-1 rounded-xl backdrop-blur-md shadow-md">
                    ₹{Number(evt.price ?? 0).toLocaleString('en-IN')}
                    <span className="text-[10px] font-normal text-slate-400"> / seat</span>
                  </span>

                  {/* Format Tag */}
                  {evt.format && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-semibold text-slate-300 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                      {evt.format}
                    </span>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>{evt.genre || evt.theatre || 'Live Showcase'}</span>
                      {evt.duration && <span>{evt.duration}</span>}
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-sky-300 transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{evt.description}</p>
                  </div>

                  {/* Movie Card Specific Info (Title, Outline, Release Date, Languages) */}
                  {isMovie ? (
                    <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                      {/* Release Date Banner */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5 text-rose-300 font-bold bg-rose-950/60 border border-rose-900/60 px-2.5 py-1 rounded-lg">
                          <Calendar className="w-3.5 h-3.5 text-rose-400" />
                          <span>Release: {new Date(evt.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        {evt.language && (
                          <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[140px]">
                            {evt.language}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Non-Movie Venue & Capacity */
                    <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <span>{evt.event_date || evt.eventDate}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                          <Ticket className="w-3 h-3 text-sky-400" />
                          <span>{evt.total_capacity || evt.capacity} seats</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action CTA */}
                  <Link
                    href={`/events/${evt.id}`}
                    className={`w-full py-3 rounded-xl font-bold text-xs text-center block transition-all shadow-md ${
                      isMovie
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                        : isSport
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
                    }`}
                  >
                    {isMovie ? 'Book Tickets' : isSport ? 'Book Stadium Stand' : 'Book Event Seats'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading experiences...</p>
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}

