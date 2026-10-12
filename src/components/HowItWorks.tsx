import React from 'react';
import {
  QrCode,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal.ts';

export interface HowItWorksProps {
  isRevealed?: boolean;
  className?: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = React.memo(({ isRevealed: propsRevealed, className = '' }) => {
  const containerRef = useScrollReveal<HTMLDivElement>({
    threshold: 0.15,
    animationDurationMs: 5000,
  });

  const isRevealed = Boolean(propsRevealed);

  const steps = [
    {
      stepNumber: '01',
      title: 'Fresh Early Morning Harvest',
      subtitle: 'Direct from the Farm',
      description:
        'Vegetables and fruits picked early in the morning and brought straight to the local Mandi in Karachi, Lahore, and Islamabad.',
      icon: ShoppingBag,
      animationClass: 'how-it-works-tile-left',
    },
    {
      stepNumber: '02',
      title: 'Order Online & Get Code',
      subtitle: '4-Digit Pickup PIN Code',
      description:
        'Order your produce online for free. You get a simple 4-digit code (e.g. 4921) to show at the farmer’s stall.',
      icon: QrCode,
      animationClass: 'how-it-works-tile-top',
    },
    {
      stepNumber: '03',
      title: 'Check Items & Pay Cash',
      subtitle: 'Rs. 0 Advance Online Fee',
      description:
        'Visit the stall, check the freshness of your vegetables, give your code to the farmer, and pay cash on the spot.',
      icon: ShieldCheck,
      animationClass: 'how-it-works-tile-right',
    },
  ];

  return (
    <section
      id="how-it-works-section"
      ref={containerRef}
      className={`reveal-section scroll-mt-20 py-20 sm:py-28 bg-[#faf6ee] border-t border-[#e2e8e5] ${
        isRevealed ? 'is-revealed will-animate' : ''
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-14 space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#064e3b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#064e3b]" />
            <span>SEEDHA KISAN SE (DIRECT FROM FARMER)</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#10231d]">
            How MarketLink <span className="text-[#064e3b] italic">Works.</span>
          </h2>

          <p className="text-sm text-[#64748b] leading-relaxed font-normal">
            Direct farmer-to-customer connection. No middlemen (Arthi), no advance online fees, and 100% fair prices.
          </p>
        </div>

        {/* 3 Steps with 3D Directional Scroll Animations:
            Step 1 from LEFT (1s delay)
            Step 2 from TOP (2s delay)
            Step 3 from RIGHT (3s delay) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 perspective-1000">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.stepNumber}
                className={`bg-white p-8 rounded-2xl border border-[#e2e8e5] shadow-xs flex flex-col justify-between space-y-6 card-3d-interactive group hover:border-[#064e3b]/40 relative overflow-hidden contain-paint-layout ${st.animationClass} ${
                  isRevealed ? 'is-revealed' : ''
                }`}
              >
                {/* Subtle top indicator glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#064e3b]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-4xl font-mono font-bold text-stone-200 select-none group-hover:text-emerald-200 transition-colors">
                      {st.stepNumber}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-[#064e3b] text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-emerald-300" />
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-normal text-[#10231d] group-hover:text-[#064e3b] transition-colors">
                    {st.title}
                  </h3>
                  <div className="text-xs font-mono font-semibold text-[#064e3b] uppercase tracking-wider mt-1 mb-2.5">
                    {st.subtitle}
                  </div>

                  <p className="text-xs text-[#64748b] leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#e2e8e5] flex items-center gap-1.5 text-xs text-[#64748b] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#064e3b] group-hover:scale-110 transition-transform" />
                  <span>Simple Mandi Pickup</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zero-Fee Guarantee Feature Strip - Appears smoothly from BOTTOM */}
        <div
          className={`mt-14 p-6 sm:p-8 rounded-2xl bg-white text-[#10231d] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-[#e2e8e5] shadow-xs how-it-works-guarantee-bottom ${
            isRevealed ? 'is-revealed' : ''
          }`}
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b] shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-[#10b981]" />
            </div>
            <div>
              <div className="font-serif font-normal text-lg sm:text-xl text-[#10231d]">
                Guaranteed Rs. 0.00 Advance Fee
              </div>
              <div className="text-xs sm:text-sm text-[#64748b] mt-1 max-w-2xl leading-relaxed">
                You never pay online. Check your items at the stall, and pay cash directly to the farmer.
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <span className="px-4 py-2 rounded-xl bg-[#ecfdf5] text-[#064e3b] font-mono text-xs font-semibold border border-emerald-200 inline-block shadow-2xs">
              100% CASH AT STALL
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});

HowItWorks.displayName = 'HowItWorks';
