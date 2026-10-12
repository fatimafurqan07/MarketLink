import React, { useState } from 'react';
import {
  Sprout,
  ShieldCheck,
  Store,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Coins,
  QrCode,
  Send,
  HelpCircle,
} from 'lucide-react';

interface FooterProps {
  onOpenAuth?: (tab?: 'signin' | 'customer_register' | 'farmer_register') => void;
  onSelectMarket?: (marketId: number) => void;
  onBrowseProduce?: () => void;
  onOpenPasses?: () => void;
  onAboutUs?: () => void;
  onContactUs?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAuth,
  onSelectMarket,
  onBrowseProduce,
  onOpenPasses,
  onAboutUs,
  onContactUs,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setNewsletterEmail('');
      }, 5000);
    }
  };

  return (
    <footer className="w-full bg-gradient-to-b from-[#082a20] via-[#051e17] to-[#02130e] text-white border-t border-emerald-900/60 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* TOP VALUE PILLARS & ASSURANCES */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/30 hover:bg-white/[0.08] transition-all duration-300">
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white tracking-wider uppercase font-mono">Rs. 0 Advance Fee</h4>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  Reserve online for free. Inspect produce at the Mandi stall before paying cash.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/30 hover:bg-white/[0.08] transition-all duration-300">
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white tracking-wider uppercase font-mono">Seedha Kisan Se</h4>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  100% direct from verified farmers. Zero middleman markup or hidden commissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/30 hover:bg-white/[0.08] transition-all duration-300">
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white tracking-wider uppercase font-mono">Dawn Fresh Harvest</h4>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  Picked at 04:30 AM from fertile farms and delivered directly to the pavilion.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/30 hover:bg-white/[0.08] transition-all duration-300">
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white tracking-wider uppercase font-mono">Digital Pickup Pass</h4>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  Instant 4-digit PIN and QR pass for fast, queue-free collection at assigned stalls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-300/30">
                <Sprout className="w-6 h-6 text-emerald-950" />
              </div>
              <span className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-tight">
                Market<span className="text-emerald-300 italic">Link</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal max-w-sm">
              Pakistan&apos;s premier direct-from-grower agricultural exchange connecting local farmers directly with household buyers and commercial retailers across Karachi, Hyderabad, Lahore, and Islamabad Sabzi Mandis.
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 max-w-sm backdrop-blur-md">
              <div className="text-xs font-semibold text-emerald-300 flex items-center gap-2 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Advance Payment Protocol</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                All reservations are booked with Rs. 0 advance online charge. Customers physically inspect produce at the farmer stall and pay cash on pickup.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-300/90 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Mandi Network: Karachi • Hyderabad • Lahore • Islamabad</span>
            </div>
          </div>

          {/* Column 2: Mandi Locations */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Wholesale Mandi Hubs</span>
            </div>

            <ul className="space-y-3 text-xs text-stone-300">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectMarket && onSelectMarket(1)}
                  className="hover:text-white transition-colors text-left cursor-pointer group block w-full p-2.5 rounded-xl hover:bg-white/[0.04]"
                >
                  <div className="font-semibold text-white group-hover:text-emerald-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Super Highway Mandi, Karachi</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-400 pl-5.5 mt-0.5">
                    M-9 New Sabzi Mandi • 04:30 AM – 11:30 AM
                  </div>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => onSelectMarket && onSelectMarket(4)}
                  className="hover:text-white transition-colors text-left cursor-pointer group block w-full p-2.5 rounded-xl hover:bg-white/[0.04]"
                >
                  <div className="font-semibold text-white group-hover:text-emerald-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Hala Naka Mandi, Hyderabad</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-400 pl-5.5 mt-0.5">
                    National Highway N-5 • 04:00 AM – 11:30 AM
                  </div>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => onSelectMarket && onSelectMarket(2)}
                  className="hover:text-white transition-colors text-left cursor-pointer group block w-full p-2.5 rounded-xl hover:bg-white/[0.04]"
                >
                  <div className="font-semibold text-white group-hover:text-emerald-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Badami Bagh Mandi, Lahore</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-400 pl-5.5 mt-0.5">
                    Ravi Road Pavilion • 05:00 AM – 12:00 PM
                  </div>
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => onSelectMarket && onSelectMarket(3)}
                  className="hover:text-white transition-colors text-left cursor-pointer group block w-full p-2.5 rounded-xl hover:bg-white/[0.04]"
                >
                  <div className="font-semibold text-white group-hover:text-emerald-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Sector I-11/4 Mandi, Islamabad</span>
                  </div>
                  <div className="text-[11px] font-mono text-stone-400 pl-5.5 mt-0.5">
                    Potohar Central • 05:30 AM – 01:00 PM
                  </div>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation & Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              <span>Platform Links</span>
            </div>

            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <button
                  type="button"
                  onClick={onBrowseProduce}
                  className="hover:text-white transition-colors cursor-pointer text-left block font-medium hover:translate-x-1 transition-transform"
                >
                  Browse Fresh Produce
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPasses}
                  className="hover:text-white transition-colors cursor-pointer text-left block font-medium text-emerald-300 hover:underline"
                >
                  My Digital Pickup Passes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('farmer_register')}
                  className="hover:text-white transition-colors cursor-pointer text-left block font-medium hover:translate-x-1 transition-transform"
                >
                  Register Farmer Stall
                </button>
              </li>
              {onAboutUs && (
                <li>
                  <button
                    type="button"
                    onClick={onAboutUs}
                    className="hover:text-white transition-colors cursor-pointer text-left block font-medium hover:translate-x-1 transition-transform"
                  >
                    About MarketLink
                  </button>
                </li>
              )}
              {onContactUs && (
                <li>
                  <button
                    type="button"
                    onClick={onContactUs}
                    className="hover:text-white transition-colors cursor-pointer text-left block font-medium hover:translate-x-1 transition-transform"
                  >
                    Help Desk &amp; Inquiries
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth && onOpenAuth('signin')}
                  className="hover:text-white transition-colors cursor-pointer text-left block font-medium text-amber-300 hover:underline"
                >
                  Sign In to Workspace →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Daily Mandi Rate Alerts */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Daily Mandi Rate Index</span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              Subscribe to daily dawn harvest rates, seasonal crop arrivals, and mandi wholesale auction prices directly in your inbox.
            </p>

            {isSubscribed ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-xs text-emerald-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">Subscribed to daily dawn rates!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-stone-400 focus:outline-hidden focus:border-emerald-400 focus:bg-white/15 transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Subscribe to Price Alerts</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <div className="pt-1 text-[11px] text-stone-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Free daily index • Zero spam • Instant unsubscribe</span>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span>&copy; 2026 MarketLink (eGreen Basket). All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-emerald-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Cash-on-Stall Guarantee</span>
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span>Rs. 0 Advance Online Fee</span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span>Pakistan Agricultural Exchange</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
