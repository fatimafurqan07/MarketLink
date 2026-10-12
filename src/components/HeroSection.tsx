import React from 'react';
import {
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Clock,
  Sprout,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { useCountry } from '../i18n/CountryContext.tsx';
import { Card3DTilt } from './common/Card3DTilt.tsx';
import { useScrollReveal } from '../hooks/useScrollReveal.ts';

export interface HeroSectionProps {
  onExploreMap: () => void;
  onBrowseCatalog: () => void;
  onRegisterVendor: () => void;
  onClaimStall: () => void;
  onAccessFarmerTerminal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = React.memo(({
  onExploreMap,
  onBrowseCatalog,
  onRegisterVendor,
  onClaimStall,
  onAccessFarmerTerminal,
}) => {
  const { t } = useLanguage();
  const { city, province, countryConfig, openWelcomeModal } = useCountry();
  const heroRevealRef = useScrollReveal<HTMLDivElement>();
  const trustRevealRef = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative w-full overflow-hidden bg-[#10231d] text-white">
      {/* =================================================================== */}
      {/* 1. BACKGROUND VIDEO & POSTER FALLBACK                               */}
      {/* =================================================================== */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 contain-paint-layout">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/farmers_market_poster.jpg"
          className="w-full h-full object-cover object-center scale-[1.02] transform-gpu will-change-transform motion-safe:animate-kenburns"
          aria-hidden="true"
        >
          <source src="/assets/farmers_market_hero.mp4" type="video/mp4" />
          {/* Fallback image if video element unsupported */}
          <img
            src="/assets/farmers_market_poster.jpg"
            alt="Fresh produce at organic farmers market"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Cinematic dark semi-transparent multi-layer overlay for contrast */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#10231d]/95" />
      </div>

      {/* =================================================================== */}
      {/* 2. FOREGROUND HERO CONTENT                                          */}
      {/* =================================================================== */}
      <div
        ref={heroRevealRef}
        className="reveal-section relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-16 lg:pb-20 text-center contain-paint-layout"
      >
        {/* Mandi Status & Location Pill */}
        <div className="reveal-stagger-item inline-flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-medium tracking-wider text-emerald-200 uppercase mb-5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xs">
          <button
            type="button"
            onClick={openWelcomeModal}
            className="flex items-center gap-1.5 text-amber-300 font-bold hover:underline cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Active Region: {city}, {province} ({countryConfig.flag})</span>
          </button>
          <span className="text-white/40" aria-hidden="true">·</span>
          <span className="text-emerald-300 font-semibold">{t('hero.statAdvanceFee', 'Rs. 0 Advance Fee')}</span>
        </div>

        {/* Main Headline */}
        <h1 className="reveal-stagger-item font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white max-w-4xl mx-auto leading-[1.14] text-balance">
          {t('hero.title1', 'Harvested at Dawn.')}{' '}
          <span className="italic text-emerald-300">
            {t('hero.title2', 'Collected at Mandi.')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="reveal-stagger-item text-sm sm:text-base lg:text-lg text-stone-200/90 max-w-2xl mx-auto mt-4 sm:mt-5 leading-relaxed font-normal text-balance">
          {t('hero.desc', 'Connect directly with certified regional growers across Pakistan. Pre-order fresh farm produce for pickup at dedicated mandi stall bays.')}
        </p>

        {/* Primary Quick Actions */}
        <div className="reveal-stagger-item mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={onBrowseCatalog}
            className="px-6 py-3.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-medium text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 border border-emerald-500/40"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-300" />
            <span>{t('hero.btnBrowseCatalog', 'Browse Fresh Catalog')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onExploreMap}
            className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 border border-white/20"
          >
            <MapPin className="w-4 h-4 text-emerald-300" />
            <span>{t('hero.btnExploreStalls', 'Explore Mandis & Stalls')}</span>
          </button>
        </div>

        {/* Dual Action 3D Showcase Cards */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 max-w-5xl mx-auto text-left perspective-1000">
          {/* Card A: Kharidar / Buyer */}
          <div className="reveal-stagger-item h-full">
            <Card3DTilt intensity={10} perspective={1100} className="h-full">
              <div className="group relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-7 sm:p-8 border border-white/20 bg-white/95 backdrop-blur-md text-[#10231d] shadow-2xl transition-all duration-300 card-3d-interactive hover:border-emerald-500/50 hover:shadow-[0_20px_40px_-15px_rgba(6,78,59,0.25)] sweep-glare">
                {/* Subtle 3D Depth Layer */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

                <div className="relative z-10 space-y-3.5 transform-gpu" style={{ transform: 'translateZ(15px)' }}>
                  <div className="text-xs font-mono font-semibold text-[#064e3b] uppercase flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-[#064e3b] shadow-xs group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#064e3b]" />
                      </div>
                      <span>{t('nav.vendorRole', 'For Customers & Families')}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-[#064e3b] font-bold border border-emerald-200">
                      Rs. 0 Advance
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#10231d] leading-snug">
                    {t('cart.title', 'Order Fresh Morning Produce')}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed font-normal">
                    {t('cart.payOnPickupNote', 'Choose fresh vegetables and fruits, inspect them at the physical stall, and pay cash on pickup.')}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onBrowseCatalog}
                      className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 group/btn"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-300 group-hover/btn:rotate-6 transition-transform" />
                      <span>{t('nav.freshHarvest', 'Order Fresh Items')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={onRegisterVendor}
                      className="text-xs font-semibold text-[#064e3b] hover:text-[#043d2e] transition-colors cursor-pointer py-2 px-1 underline underline-offset-4"
                    >
                      {t('auth.tabCustomer', 'Register as Customer')}
                    </button>
                  </div>
                </div>
              </div>
            </Card3DTilt>
          </div>

          {/* Card B: Kisan / Farmer */}
          <div className="reveal-stagger-item h-full">
            <Card3DTilt intensity={10} perspective={1100} className="h-full">
              <div className="group relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-7 sm:p-8 border border-white/20 bg-white/95 backdrop-blur-md text-[#10231d] shadow-2xl transition-all duration-300 card-3d-interactive hover:border-emerald-500/50 hover:shadow-[0_20px_40px_-15px_rgba(6,78,59,0.25)] sweep-glare">
                {/* Subtle 3D Depth Layer */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

                <div className="relative z-10 space-y-3.5 transform-gpu" style={{ transform: 'translateZ(15px)' }}>
                  <div className="text-xs font-mono font-semibold text-[#064e3b] uppercase flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-[#064e3b] shadow-xs group-hover:scale-110 transition-transform">
                        <Sprout className="w-3.5 h-3.5 text-[#064e3b]" />
                      </div>
                      <span>{t('nav.farmerRole', 'For Farmers (Kisan)')}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-[#064e3b] font-bold border border-emerald-200">
                      Direct Stall Bay
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#10231d] leading-snug">
                    {t('hero.btnClaimStall', 'Sell Direct — No Middleman')}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed font-normal">
                    {t('module.harvest_inventory.subtitle', 'List your daily crop stock, set your rates, and enter customer pickup codes at your stall.')}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onAccessFarmerTerminal}
                      className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 group/btn"
                    >
                      <QrCode className="w-4 h-4 text-emerald-300 group-hover/btn:scale-110 transition-transform" />
                      <span>{t('auth.farmerDemo', 'Farmer Login / Scanner')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={onClaimStall}
                      className="text-xs font-semibold text-[#064e3b] hover:text-[#043d2e] transition-colors cursor-pointer py-2 px-1 underline underline-offset-4"
                    >
                      {t('auth.tabFarmer', 'Register as Farmer')}
                    </button>
                  </div>
                </div>
              </div>
            </Card3DTilt>
          </div>
        </div>

        {/* Operating Status & Mandi Navigation Links */}
        <div className="reveal-stagger-item mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-stone-300 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>Mandi Timings Active</span>
          </span>
          <span className="text-white/30" aria-hidden="true">•</span>
          <span className="flex items-center gap-1.5 text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>04:00 AM – 01:00 PM</span>
          </span>
          <span className="text-white/30" aria-hidden="true">•</span>
          <button
            type="button"
            onClick={onExploreMap}
            className="flex items-center gap-1.5 text-emerald-300 hover:underline transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>6+ Mandi Locations (Karachi · Hyderabad · Lahore · Islamabad)</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. TRUST STRIP                                                      */}
      {/* =================================================================== */}
      <div ref={trustRevealRef} className="reveal-section relative z-10 w-full border-t border-[#e2e8e5] bg-[#f8f7f2] text-[#10231d] contain-paint-layout">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="reveal-stagger-item flex items-center justify-center md:justify-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b] shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#10231d]">140+ Local Farmers</div>
                <div className="text-xs text-[#64748b]">Sindh, Punjab &amp; Swat verified farms</div>
              </div>
            </div>

            <div className="reveal-stagger-item flex items-center justify-center md:justify-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b] shrink-0">
                <Clock className="w-5 h-5 text-[#064e3b]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#10231d]">Fresh Farm-to-Mandi Daily</div>
                <div className="text-xs text-[#64748b]">Picked early morning, sold fresh</div>
              </div>
            </div>

            <div className="reveal-stagger-item flex items-center justify-center md:justify-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b] shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#064e3b]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#10231d]">Rs. 0 Advance Fee</div>
                <div className="text-xs text-[#64748b]">100% Cash on pickup at stall</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
