import React from 'react';
import {
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Clock,
  Sprout,
  Sparkles,
  QrCode,
  ArrowRight,
} from 'lucide-react';

interface ThreeDScrollyHeroProps {
  onExploreMap: () => void;
  onBrowseCatalog: () => void;
  onRegisterVendor: () => void;
  onClaimStall: () => void;
  onAccessFarmerTerminal: () => void;
}

export const ThreeDScrollyHero: React.FC<ThreeDScrollyHeroProps> = React.memo(({
  onExploreMap,
  onBrowseCatalog,
  onRegisterVendor,
  onClaimStall,
  onAccessFarmerTerminal,
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-[#061A12] text-white">
      {/* Background Video Layer with Deep Obsidian Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1920&q=80"
          className="object-cover w-full h-full brightness-[0.55]"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-farmer-hands-holding-fresh-vegetables-41221-large.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#061A12]/95 via-[#061A12]/80 to-[#061A12]" />
      </div>

      {/* Main Hero Viewport */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-20 text-center">
        {/* Quiet Kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-emerald-300 uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Pakistan Agricultural Exchange</span>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span>Rs. 0 Advance Fee</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Dawn Harvest Direct to Your{' '}
          <span className="text-emerald-400 font-serif font-normal italic">
            Mandi Pavilion Counter.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-stone-200 max-w-2xl mx-auto mt-4 leading-relaxed font-normal">
          Connecting verified growers across Sindh, Punjab, and Swat directly with community patrons. Reserve crops online for free and settle in cash at the physical stall.
        </p>

        {/* Dual Showcase Cards: Kharidar & Kisan */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto text-left">
          {/* Card A: Kharidar / Buyer */}
          <div className="group relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-6 sm:p-8 border border-white/10 bg-black/40 shadow-xl transition-all duration-300 hover:border-emerald-500/40">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
              alt="Fresh harvest produce"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

            <div className="relative z-10 space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>For Buyers &amp; Kitchens</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                Reserve Morning Harvest Batches
              </h2>

              <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                Inspect organic tomatoes, Swat apples, and fresh farm eggs with your own eyes before paying cash at the stall.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onBrowseCatalog}
                  className="px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#16a34a] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Reserve Daily Batch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onRegisterVendor}
                  className="text-xs font-semibold text-stone-300 hover:text-white transition-colors cursor-pointer py-2 px-1 underline underline-offset-4"
                >
                  Create Buyer Account
                </button>
              </div>
            </div>
          </div>

          {/* Card B: Kisan / Farmer */}
          <div className="group relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-6 sm:p-8 border border-white/10 bg-black/40 shadow-xl transition-all duration-300 hover:border-emerald-500/40">
            <img
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80"
              alt="Grower stall counter"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

            <div className="relative z-10 space-y-3">
              <div className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>For Growers &amp; Kisan</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                Direct Stall Sales Without Arthi Cuts
              </h2>

              <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                List dawn harvest stocks, set pre-order cutoffs, and scan customer pickup PIN vouchers at your physical counter.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onAccessFarmerTerminal}
                  className="px-5 py-2.5 rounded-xl bg-white text-[#0F172A] hover:bg-stone-100 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <QrCode className="w-4 h-4 text-[#15803D]" />
                  <span>Stall Scanner Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onClaimStall}
                  className="text-xs font-semibold text-stone-300 hover:text-white transition-colors cursor-pointer py-2 px-1 underline underline-offset-4"
                >
                  Apply with CNIC
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Status & Mandi Navigation Links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-stone-300 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dawn Mandi Operations Active</span>
          </span>
          <span className="text-white/20" aria-hidden="true">•</span>
          <span className="flex items-center gap-1.5 text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>04:30 AM – 11:30 AM</span>
          </span>
          <span className="text-white/20" aria-hidden="true">•</span>
          <button
            type="button"
            onClick={onExploreMap}
            className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>3 Mandi Hubs (Karachi · Lahore · Islamabad)</span>
          </button>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="relative z-10 w-full border-t border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">140+ Verified Growers</div>
                <div className="text-[11px] text-stone-400">Sindh, Punjab &amp; Swat certified farms</div>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Under 4 Hours Farm-to-Mandi</div>
                <div className="text-[11px] text-stone-400">Dawn harvest with zero aging gas</div>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Rs. 0 Advance Online Fee</div>
                <div className="text-[11px] text-stone-400">100% Cash payment at stall counter</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ThreeDScrollyHero.displayName = 'ThreeDScrollyHero';
