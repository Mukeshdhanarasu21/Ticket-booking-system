import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { Ticket, Film, Trophy, Music, ShieldCheck, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bookie Luxe — Premier Movie, Sports & Live Event Booking',
  description: 'Experience seamless atomic seat reservations for blockbuster cinema, live sports derbies, music concerts, and technology summits.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080C14] text-slate-100 min-h-screen flex flex-col font-sans relative overflow-x-hidden">
        {/* Ambient background glow effects */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <AuthProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            {/* Rich Modern Footer */}
            <footer className="border-t border-white/[0.08] bg-[#060910]/90 backdrop-blur-md pt-12 pb-8 text-xs text-slate-400">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                  {/* Column 1: Brand */}
                  <div className="col-span-2 md:col-span-1 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <span className="text-base font-black text-white tracking-tight">Bookie Luxe</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Next-generation ticket reservation engine for blockbuster cinema, stadium derbies, music festivals, and elite conferences.
                    </p>
                  </div>

                  {/* Column 2: Categories */}
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Experiences</p>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/events?category=MOVIE" className="hover:text-rose-400 transition flex items-center space-x-1.5">
                          <Film className="w-3.5 h-3.5 text-rose-400" />
                          <span>Movie Tickets</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events?category=SPORT" className="hover:text-emerald-400 transition flex items-center space-x-1.5">
                          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sports & Stadiums</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/events?category=CONCERT" className="hover:text-purple-400 transition flex items-center space-x-1.5">
                          <Music className="w-3.5 h-3.5 text-purple-400" />
                          <span>Music Concerts</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Cities */}
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Top Cities</p>
                    <ul className="space-y-2">
                      <li><Link href="/events?city=Chennai" className="hover:text-white transition">Chennai, Tamil Nadu</Link></li>
                      <li><Link href="/events?city=Bengaluru" className="hover:text-white transition">Bengaluru, Karnataka</Link></li>
                      <li><Link href="/events?city=Coimbatore" className="hover:text-white transition">Coimbatore, Tamil Nadu</Link></li>
                    </ul>
                  </div>

                  {/* Column 4: Guarantees */}
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Reliability</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-semibold">100% Atomic Seat Guarantee</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Zero double-bookings. Instant digital tickets with verifiable QR references.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
                  <p>© 2026 Bookie Luxe. All rights reserved.</p>
                  <p className="flex items-center space-x-1">
                    <span>Designed for pure elegance</span>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

