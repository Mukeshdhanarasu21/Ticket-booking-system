'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import {
  Ticket,
  Film,
  Trophy,
  Music,
  Sparkles,
  Shield,
  LogOut,
  User as UserIcon,
  MapPin,
  Menu,
  X,
  Compass,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const cities = ['Chennai', 'Bengaluru', 'Coimbatore', 'Mumbai', 'Hyderabad'];

  const navLinks = [
    { label: 'All Events', href: '/events', icon: Compass },
    { label: 'Movies', href: '/events?category=MOVIE', icon: Film, color: 'text-rose-400' },
    { label: 'Sports', href: '/events?category=SPORT', icon: Trophy, color: 'text-emerald-400' },
    { label: 'Concerts', href: '/events?category=CONCERT', icon: Music, color: 'text-purple-400' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080C14]/85 backdrop-blur-xl border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-2.5 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-rose-500 p-0.5 shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-black tracking-tight text-white group-hover:text-sky-300 transition-colors">
                    Bookie
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Luxe
                  </span>
                </div>
              </div>
            </Link>

            {/* City Selector */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{selectedCity}</span>
              </button>

              {cityDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-2 z-50 backdrop-blur-xl">
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Select City</p>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedCity === city
                          ? 'bg-sky-500/10 text-sky-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.color || 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Menu (Auth, Bookings, Admin) */}
          <div className="flex items-center space-x-3">
            {user && (
              <Link
                href="/bookings"
                className={`hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  pathname === '/bookings'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-sky-400" />
                <span>My Bookings</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 transition border border-amber-500/30 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.fullName}</p>
                  <span className="text-[9px] uppercase font-bold text-sky-400 px-1.5 py-0.2 rounded bg-sky-950/80 border border-sky-800/40">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-md shadow-sky-600/25"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800/80 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white"
                >
                  <Icon className={`w-4 h-4 ${link.color || 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {user && (
              <Link
                href="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-sky-400 hover:bg-slate-900"
              >
                <Ticket className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

