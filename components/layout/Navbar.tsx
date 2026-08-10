'use client';

import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';
import { Ticket, Calendar, User as UserIcon, Shield, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 text-sky-400 font-bold text-xl hover:text-sky-300 transition">
            <Ticket className="w-6 h-6 text-sky-500" />
            <span>EventBook</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              href="/events"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Browse Events</span>
            </Link>

            {user && (
              <Link
                href="/bookings"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Ticket className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 transition border border-amber-500/30"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-200">{user.fullName}</p>
                  <span className="text-[10px] uppercase font-bold text-sky-400 px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/50">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-sky-600 text-white hover:bg-sky-500 transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
