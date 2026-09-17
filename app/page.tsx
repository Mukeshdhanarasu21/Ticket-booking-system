'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, EventItem } from '@/lib/api/client';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Film,
  Trophy,
  Music,
  Sparkles,
  Search,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  ChevronRight,
  ChevronLeft,
  Star,
  Flame,
  ShieldCheck,
  Loader2,
  Tv,
  ArrowRight,
} from 'lucide-react';

export default function RootHomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);

  const categories = [
    { id: 'ALL', label: 'All Experiences', icon: Sparkles, color: 'text-sky-400', activeBg: 'bg-sky-600 text-white' },
    { id: 'MOVIE', label: 'Movies', icon: Film, color: 'text-rose-400', activeBg: 'bg-rose-600 text-white' },
    { id: 'SPORT', label: 'Sports & Derbies', icon: Trophy, color: 'text-emerald-400', activeBg: 'bg-emerald-600 text-white' },
    { id: 'CONCERT', label: 'Concerts & Music', icon: Music, color: 'text-purple-400', activeBg: 'bg-purple-600 text-white' },
    { id: 'TECH', label: 'Tech & Summits', icon: Tv, color: 'text-cyan-400', activeBg: 'bg-cyan-600 text-white' },
  ];

  const cities = ['ALL', 'Chennai', 'Coimbatore', 'Bengaluru'];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getEvents({
        page: 1,
        limit: 12,
        status: 'PUBLISHED',
        category: activeCategory !== 'ALL' ? activeCategory : undefined,
        city: selectedCity !== 'ALL' ? selectedCity : undefined,
        search: searchQuery || undefined,
      });
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, selectedCity, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Spotlight items (top 3 featured)
  const spotlightItems = events.slice(0, 3);

  // Auto rotate spotlight
  useEffect(() => {
    if (spotlightItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSpotlightIndex((prev) => (prev + 1) % spotlightItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [spotlightItems.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const moviesList = events.filter((e) => e.category === 'MOVIE');
  const sportsList = events.filter((e) => e.category === 'SPORT');
  const concertsList = events.filter((e) => e.category === 'CONCERT');

  return (
    <div className="space-y-12">
      {/* ── 1. SPOTLIGHT HERO SHOWCASE ── */}
      {spotlightItems.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-900/60 shadow-2xl group">
          {spotlightItems.map((item, idx) => {
            const isVisible = idx === (currentSpotlightIndex % spotlightItems.length);
            const isMovie = item.category === 'MOVIE';
            const isSport = item.category === 'SPORT';

            return (
              <div
                key={item.id}
                className={`transition-opacity duration-700 ${isVisible ? 'block opacity-100' : 'hidden opacity-0'}`}
              >
                <div className="relative h-[380px] sm:h-[440px] md:h-[480px] w-full overflow-hidden">
                  <img
                    src={item.image_url || item.imageUrl || '/events/global-tech-summit.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  {/* Subtle Dark Vignette & Color Glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080C14] via-[#080C14]/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#080C14]/90 via-[#080C14]/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-white/10 text-white text-xs font-bold backdrop-blur-md">
                        <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>FEATURED SPOTLIGHT</span>
                      </span>
                      {item.badge && (
                        <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold backdrop-blur-md">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <span className="px-3.5 py-1 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-300 font-extrabold text-sm backdrop-blur-md shadow-lg">
                      ₹{Number(item.price ?? 0).toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ seat</span>
                    </span>
                  </div>

                  {/* Bottom Content Area */}
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 z-10 space-y-4 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-rose-500/20 border border-rose-500/30 text-rose-300">
                        {item.category || 'LIVE'}
                      </span>
                      {item.format && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-500/20 border border-sky-500/30 text-sky-300">
                          {item.format}
                        </span>
                      )}
                      {item.city && (
                        <span className="flex items-center space-x-1 text-xs text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>{item.city}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-md">
                      {item.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed max-w-xl">
                      {item.description}
                    </p>

                    {/* Meta info & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <Link
                        href={`/events/${item.id}`}
                        className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-600/30 flex items-center space-x-2 group-hover:shadow-sky-500/50"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>{isMovie ? 'Select Show & Seats' : isSport ? 'Choose Stadium Seats' : 'Book Tickets'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <div className="flex items-center space-x-4 text-xs text-slate-300">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-4 h-4 text-sky-400" />
                          <span>{item.event_date || item.eventDate}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>{item.start_time || item.startTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Carousel Slide Indicators */}
          <div className="absolute bottom-4 right-6 z-20 flex items-center space-x-2">
            {spotlightItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSpotlightIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSpotlightIndex % spotlightItems.length
                    ? 'w-6 bg-sky-400'
                    : 'w-2 bg-slate-600/60 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 2. SEARCH & DISCOVERY BAR ── */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel shadow-xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, cricket matches, concerts, venues..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </form>

        {/* City Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline flex-shrink-0">City:</span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex-shrink-0 border ${
                selectedCity === city
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                  : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
              }`}
            >
              {city === 'ALL' ? 'All Cities' : city}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. CATEGORY SWITCHER TABS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Browse by Category</h2>
            <p className="text-xs text-slate-400">Discover premium entertainment & sports in your region</p>
          </div>
          <Link
            href="/events"
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex-shrink-0 border ${
                  isSelected
                    ? `${cat.activeBg} border-transparent shadow-lg shadow-sky-950`
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : cat.color}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. DYNAMIC EXPERIENCES GRID ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-xs text-slate-400">Fetching experiences...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl space-y-3 border border-slate-800">
          <Ticket className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-slate-300">No events found</h3>
          <p className="text-xs text-slate-500">Try changing your search query, city, or category filter.</p>
        </div>
      ) : (
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
                {/* Event Image Banner */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                  <img
                    src={evt.image_url || evt.imageUrl || '/events/global-tech-summit.jpg'}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Category Pill Tag */}
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

                  {/* Format pill */}
                  {evt.format && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-semibold text-slate-300 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                      {evt.format}
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Teams or Genre subtitle */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>{evt.genre || evt.theatre || 'Live Showcase'}</span>
                      {evt.duration && <span>{evt.duration}</span>}
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-sky-300 transition-colors">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
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

                  {/* Booking CTA Button */}
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

      {/* ── 5. BRAND VALUE GUARANTEES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] space-y-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mx-auto flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Blockbuster Cinema</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Reserve recliner & prime seats at top multiplexes with instant showtime selection.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] space-y-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Live Stadium Derbies</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Direct access to IPL cricket derbies, football tournaments, and athletic championships.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] space-y-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white">Zero Double-Booking</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Atomic concurrency engine locks your seats in real-time with instant QR verification.
          </p>
        </div>
      </div>
    </div>
  );
}

