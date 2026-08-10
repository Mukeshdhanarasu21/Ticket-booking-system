'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

type PaymentMethod = 'GPAY' | 'CARD' | null;
type Step = 'SELECT' | 'CARD_FORM' | 'GPAY_WAIT' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

interface PaymentModalProps {
  isOpen: boolean;
  totalAmount: number;
  seatCount: number;
  eventTitle: string;
  onClose: () => void;
  onPaymentSuccess: () => Promise<void>;
}

/* ─── helpers ─── */
function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function detectCardType(num: string): string {
  const raw = num.replace(/\s/g, '');
  if (/^4/.test(raw)) return 'VISA';
  if (/^5[1-5]/.test(raw)) return 'MASTERCARD';
  if (/^3[47]/.test(raw)) return 'AMEX';
  if (/^6/.test(raw)) return 'RUPAY';
  return '';
}

const cardTypeColors: Record<string, string> = {
  VISA: 'text-blue-400',
  MASTERCARD: 'text-orange-400',
  AMEX: 'text-green-400',
  RUPAY: 'text-rose-400',
};

export default function PaymentModal({
  isOpen,
  totalAmount,
  seatCount,
  eventTitle,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>('SELECT');
  const [method, setMethod] = useState<PaymentMethod>(null);

  /* card form state */
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardError, setCardError] = useState('');

  const [gpayTimer, setGpayTimer] = useState(3);
  const [errorMsg, setErrorMsg] = useState('');

  const cardType = detectCardType(cardNumber);

  /* ── close & reset ── */
  const handleClose = () => {
    setStep('SELECT');
    setMethod(null);
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCardName('');
    setCardError('');
    setErrorMsg('');
    onClose();
  };

  /* ── select method ── */
  const handleSelectMethod = (m: PaymentMethod) => {
    setMethod(m);
    if (m === 'GPAY') {
      setStep('GPAY_WAIT');
      let t = 3;
      setGpayTimer(t);
      const interval = setInterval(() => {
        t--;
        setGpayTimer(t);
        if (t <= 0) {
          clearInterval(interval);
          processPayment();
        }
      }, 1000);
    } else {
      setStep('CARD_FORM');
    }
  };

  /* ── card form validation ── */
  const validateCard = () => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.length < 16) return 'Card number must be 16 digits.';
    const [mm, yy] = expiry.split('/');
    const month = parseInt(mm, 10);
    const year = parseInt(`20${yy}`, 10);
    const now = new Date();
    if (!mm || !yy || month < 1 || month > 12)
      return 'Invalid expiry date.';
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
      return 'Card has expired.';
    if (cvv.length < 3) return 'CVV must be 3 digits.';
    if (cardName.trim().length < 2) return 'Please enter the cardholder name.';
    return '';
  };

  const handleCardPay = () => {
    const err = validateCard();
    if (err) { setCardError(err); return; }
    setCardError('');
    processPayment();
  };

  /* ── simulate processing then fire real booking ── */
  const processPayment = async () => {
    setStep('PROCESSING');
    await new Promise((r) => setTimeout(r, 2000)); // simulate payment gateway
    try {
      await onPaymentSuccess();
      setStep('SUCCESS');
    } catch (e: any) {
      setErrorMsg(e.message || 'Payment processed but booking failed. Please contact support.');
      setStep('ERROR');
    }
  };

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={step === 'SELECT' || step === 'CARD_FORM' ? handleClose : undefined}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Secure Payment</span>
          </div>
          {(step === 'SELECT' || step === 'CARD_FORM') && (
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Order summary strip */}
        <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[60%]">{eventTitle}</span>
          <span className="font-bold text-white">
            {seatCount} seat{seatCount !== 1 ? 's' : ''} ·{' '}
            <span className="text-amber-400">₹{totalAmount.toLocaleString('en-IN')}</span>
          </span>
        </div>

        {/* ── STEP: SELECT METHOD ── */}
        {step === 'SELECT' && (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-white text-center">Choose Payment Method</h2>

            {/* GPay */}
            <button
              onClick={() => handleSelectMethod('GPAY')}
              className="w-full flex items-center space-x-4 p-4 rounded-xl border border-slate-700 bg-slate-800 hover:border-sky-500 hover:bg-slate-800/80 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow">
                {/* Google Pay G icon */}
                <span className="text-lg font-black" style={{ fontFamily: 'sans-serif' }}>
                  <span style={{ color: '#4285F4' }}>G</span>
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white group-hover:text-sky-400 transition">Google Pay</p>
                <p className="text-[11px] text-slate-400">Pay instantly via UPI / GPay</p>
              </div>
              <Smartphone className="w-5 h-5 text-slate-500 ml-auto group-hover:text-sky-400 transition" />
            </button>

            {/* Credit / Debit Card */}
            <button
              onClick={() => handleSelectMethod('CARD')}
              className="w-full flex items-center space-x-4 p-4 rounded-xl border border-slate-700 bg-slate-800 hover:border-amber-500 hover:bg-slate-800/80 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white group-hover:text-amber-400 transition">Credit / Debit Card</p>
                <p className="text-[11px] text-slate-400">Visa · Mastercard · RuPay · Amex</p>
              </div>
              <CreditCard className="w-5 h-5 text-slate-500 ml-auto group-hover:text-amber-400 transition" />
            </button>

            <p className="text-center text-[10px] text-slate-500 flex items-center justify-center space-x-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit SSL encrypted · Your data is never stored</span>
            </p>
          </div>
        )}

        {/* ── STEP: CARD FORM ── */}
        {step === 'CARD_FORM' && (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-white">Card Details</h2>

            {cardError && (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{cardError}</span>
              </div>
            )}

            {/* Card number */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition font-mono text-sm tracking-widest"
                />
                {cardType && (
                  <span className={`absolute right-3.5 top-3 text-[10px] font-extrabold tracking-wider ${cardTypeColors[cardType] ?? 'text-slate-400'}`}>
                    {cardType}
                  </span>
                )}
              </div>
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                  CVV
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="• • •"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition font-mono text-sm"
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="Name as on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition text-sm"
              />
            </div>

            {/* Pay button */}
            <button
              onClick={handleCardPay}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Pay ₹{totalAmount.toLocaleString('en-IN')} Securely</span>
            </button>

            <button
              onClick={() => setStep('SELECT')}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              ← Change payment method
            </button>
          </div>
        )}

        {/* ── STEP: GPAY WAITING ── */}
        {step === 'GPAY_WAIT' && (
          <div className="p-8 flex flex-col items-center space-y-5">
            {/* Animated GPay icon */}
            <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center animate-pulse">
              <span className="text-4xl font-black" style={{ fontFamily: 'sans-serif' }}>
                <span style={{ color: '#4285F4' }}>G</span>
              </span>
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-bold text-base">Opening Google Pay…</p>
              <p className="text-slate-400 text-xs">Complete the payment in your GPay app</p>
            </div>
            {/* Countdown */}
            <div className="w-16 h-16 rounded-full border-4 border-sky-500/30 flex items-center justify-center">
              <span className="text-2xl font-extrabold text-sky-400">{gpayTimer}</span>
            </div>
            <p className="text-[11px] text-slate-500">Auto-confirming in {gpayTimer}s…</p>
          </div>
        )}

        {/* ── STEP: PROCESSING ── */}
        {step === 'PROCESSING' && (
          <div className="p-10 flex flex-col items-center space-y-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-sky-800" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-sky-400 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-bold text-base">Processing Payment…</p>
              <p className="text-slate-400 text-xs">Please do not close this window</p>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secured by 256-bit SSL</span>
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === 'SUCCESS' && (
          <div className="p-8 flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="text-white font-extrabold text-lg">Payment Successful!</p>
              <p className="text-emerald-400 text-xs font-semibold">₹{totalAmount.toLocaleString('en-IN')} paid · Booking confirmed</p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition"
            >
              View Booking Receipt
            </button>
          </div>
        )}

        {/* ── STEP: ERROR ── */}
        {step === 'ERROR' && (
          <div className="p-8 flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-rose-400" />
            </div>
            <div className="space-y-1">
              <p className="text-white font-extrabold text-lg">Something went wrong</p>
              <p className="text-slate-400 text-xs">{errorMsg}</p>
            </div>
            <button
              onClick={handleClose}
              className="px-8 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
