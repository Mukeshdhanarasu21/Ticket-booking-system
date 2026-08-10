import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Event Booking System',
  description: 'Production-style Event Booking System with atomic seat reservations and REST API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-center text-xs text-slate-500">
            Event Booking System &copy; 2026. Built with Next.js, REST API, &amp; Supabase PostgreSQL.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
