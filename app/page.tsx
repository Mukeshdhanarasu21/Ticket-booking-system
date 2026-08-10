// Event Booking System — Home Page
import Link from 'next/link';

import { Calendar, Ticket, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-sky-900/40 p-8 sm:p-12 shadow-2xl">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Atomic Concurrency Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Event Booking System
          </h1>
          <p className="text-lg text-slate-300">
            Browse events and reserve your seats easily. Powered by robust REST APIs, PostgreSQL atomic transactions, and zero overbooking guarantees.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/events"
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-600/20 transition flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Browse Events</span>
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Ticket className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Interactive Seat Map</h3>
          <p className="text-sm text-slate-400">
            Visual seating matrix displaying real-time available, booked, and selected seats with standard, premium, and VIP tiers.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Atomic Race-Condition Protection</h3>
          <p className="text-sm text-slate-400">
            PostgreSQL row-level locking and transaction isolation guarantee that concurrent bookings never result in double reservations.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Role-Based Admin Controls</h3>
          <p className="text-sm text-slate-400">
            Comprehensive admin dashboard to publish events, configure seating capacities, monitor live statistics, and view bookings.
          </p>
        </div>
      </section>
    </div>
  );
}
