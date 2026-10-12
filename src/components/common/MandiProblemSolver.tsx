import React, { useState } from 'react';
import {
  ShieldCheck,
  Coins,
  Sprout,
  Clock,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Users,
  Store,
  Sparkles,
  Award,
  AlertTriangle,
  Receipt,
  Scale,
  ShoppingBag,
} from 'lucide-react';
import { useCountry } from '../../i18n/CountryContext.tsx';
import { useScrollReveal } from '../../hooks/useScrollReveal.ts';
import { formatCurrency } from '../../utils/formatters.ts';

interface MandiProblemSolverProps {
  onBrowseProduce?: () => void;
  onExploreMandis?: () => void;
}

type AudiencePerspective = 'household' | 'commercial' | 'grower';

const COMPARISON_POINTS = [
  {
    title: 'Middleman Markups & Hidden Cuts',
    problem: 'Commission agents (Arthis) and wholesale resellers take 25%–40% cuts, inflating everyday prices.',
    solution: '0% middleman fees. Direct connection with verified farm stalls at authentic Mandi wholesale rates.',
    metric: 'Save ~30% per basket',
  },
  {
    title: 'Produce Quality & Pre-Payment Risk',
    problem: 'Pre-paying online for uninspected goods often leads to bruised, spoiled, or stale warehouse items.',
    solution: 'Rs. 0 advance online charge. Customers physically inspect produce at the stall before paying cash.',
    metric: 'Zero financial risk',
  },
  {
    title: 'Harvest Freshness & Storage Time',
    problem: 'Supermarket vegetables sit in cold storage and distribution warehouses for 3 to 6 days.',
    solution: 'Dawn harvest protocol. Crops picked at 04:30 AM and transported directly to assigned mandi bays.',
    metric: 'Delivered in < 6 hours',
  },
  {
    title: 'Mandi Chaos & Searching for Stalls',
    problem: 'Dawn mandi crowds, unorganized rows, and bargaining confusion make procurement stressful.',
    solution: 'Pre-reserved stall bays with instant 4-digit pickup PINs. Show voucher, collect pre-weighed items, and go.',
    metric: '5-minute stall pickup',
  },
];

export const MandiProblemSolver: React.FC<MandiProblemSolverProps> = React.memo(({
  onBrowseProduce,
  onExploreMandis,
}) => {
  const containerRef = useScrollReveal<HTMLDivElement>();
  const { city, province } = useCountry();
  const [activeAudience, setActiveAudience] = useState<AudiencePerspective>('household');
  const [monthlySpend, setMonthlySpend] = useState<number>(15000);

  // Dynamic savings calculations based on direct mandi efficiency (approx 30% savings)
  const estimatedSavings = Math.round(monthlySpend * 0.30);
  const directFarmerPayout = Math.round(monthlySpend * 0.70);

  return (
    <section ref={containerRef} className="reveal-section w-full my-12 lg:my-16 contain-paint-layout">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0a231b] via-[#063327] to-[#041c15] text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-emerald-500/20">
        {/* Subtle Ambient Background Mesh */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 max-w-3xl space-y-3 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-xs font-mono font-medium text-emerald-300">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>TRANSPARENT AGRICULTURAL SUPPLY CHAIN</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight">
            Fixing The Broken Mandi System: <br />
            <span className="italic text-emerald-300">Direct From Kisan To You.</span>
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
            Traditional mandi trade loses value in middlemen commissions, produce spoilage, and chaotic dawn auctions. MarketLink eliminates the middlemen, guarantees physical produce inspection at the stall, and enforces Rs. 0 advance online fee.
          </p>
        </div>

        {/* Interactive Perspective Selector */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-300/80 font-semibold">
              How MarketLink Solves Problems For:
            </span>
          </div>

          <div className="flex flex-wrap gap-2 p-1 bg-black/30 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveAudience('household')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAudience === 'household'
                  ? 'bg-emerald-500 text-[#06241b] shadow-md font-bold'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Households &amp; Families</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAudience('commercial')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAudience === 'commercial'
                  ? 'bg-emerald-500 text-[#06241b] shadow-md font-bold'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Restaurants &amp; Retailers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAudience('grower')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAudience === 'grower'
                  ? 'bg-emerald-500 text-[#06241b] shadow-md font-bold'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Farmers &amp; Growers</span>
            </button>
          </div>
        </div>

        {/* Dynamic Audience Solution Card */}
        <div className="relative z-10 mt-6 p-5 sm:p-7 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
          {activeAudience === 'household' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                  The Consumer Dilemma
                </span>
                <h3 className="font-serif text-xl font-normal text-white">
                  High Supermarket Markups &amp; Rotten Produce
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed font-normal">
                  Supermarkets charge premium prices for 4-day-old refrigerated vegetables. App deliveries lock your payment before you see what&apos;s inside the bag.
                </p>
              </div>

              <div className="space-y-2 md:border-l md:border-white/10 md:pl-5">
                <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                  The MarketLink Solution
                </span>
                <h3 className="font-serif text-xl font-normal text-white">
                  Physical Inspection + Rs. 0 Online Fee
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed font-normal">
                  Pre-order online at authentic Mandi wholesale rates. Arrive at the stall, inspect freshness with your own eyes, and pay cash only for approved produce.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-center space-y-1">
                <div className="text-xs font-mono text-emerald-300 uppercase">Average Family Savings</div>
                <div className="text-2xl font-mono font-bold text-white">30% to 35%</div>
                <div className="text-[11px] text-emerald-200/70">Compared to retail supermarket prices</div>
              </div>
            </div>
          )}

          {activeAudience === 'commercial' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                  The Commercial Procurement Struggle
                </span>
                <h3 className="font-serif text-xl font-normal text-white">
                  Unpredictable Rates &amp; 04:00 AM Chaos
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed font-normal">
                  Chefs and hotel procurement teams spend hours navigating noisy dawn auctions, dealing with fluctuating middleman quotes and invoice disputes.
                </p>
              </div>

              <div className="space-y-2 md:border-l md:border-white/10 md:pl-5">
                <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                  The MarketLink Solution
                </span>
                <h3 className="font-serif text-xl font-normal text-white">
                  Pre-Booked Mandi Stalls &amp; Fixed Invoices
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed font-normal">
                  Reserve wholesale crates from verified lead growers evening prior. Stalls pack and weigh your order for express morning pickup with digital pass verification.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-center space-y-1">
                <div className="text-xs font-mono text-emerald-300 uppercase">Commercial Time Saved</div>
                <div className="text-2xl font-mono font-bold text-white">2.5 Hours</div>
                <div className="text-[11px] text-emerald-200/70">Per morning procurement run</div>
              </div>
            </div>
          )}

          {activeAudience === 'grower' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                  The Farmer Exploitation Crisis
                </span>
                <h3 className="font-serif text-xl font-normal text-white">
                  High Arthi Commissions &amp; Unsold Harvests
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed font-normal">
                  Farmers bring trailer loads to the mandi without knowing if their harvest will sell, often forced into predatory fire-sales by commission agents.
                </p>
              </div>

              <div className="space-y-2 md:border-l md:border-white/10 md:pl-5">
                <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                  The MarketLink Solution
                </span>
                <h3 className="font-serif text-xl font-normal text-white">
                  Guaranteed Pre-Orders &amp; Direct Cash
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed font-normal">
                  Farmers receive verified pre-orders the night before harvest. Harvest only what is ordered, pack with confidence, and collect 100% direct cash at your stall bay.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-center space-y-1">
                <div className="text-xs font-mono text-emerald-300 uppercase">Farmer Earnings Boost</div>
                <div className="text-2xl font-mono font-bold text-white">+25% More</div>
                <div className="text-[11px] text-emerald-200/70">Direct income retained by growers</div>
              </div>
            </div>
          )}
        </div>

        {/* 4 Core Problem vs Solution Pillars */}
        <div className="relative z-10 mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMPARISON_POINTS.map((pt, idx) => (
            <div
              key={pt.title}
              className="p-6 sm:p-7 rounded-3xl bg-white/[0.05] border border-white/10 hover:border-emerald-400/30 hover:bg-white/[0.08] transition-all flex flex-col justify-between space-y-5 text-left group shadow-xs"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center border border-emerald-400/30">
                    0{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                    {pt.metric}
                  </span>
                </div>

                <h4 className="font-serif text-lg sm:text-xl font-normal text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {pt.title}
                </h4>

                {/* The Traditional Problem */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-1.5 text-rose-300 font-medium">
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>Traditional Mandi:</span>
                  </div>
                  <p className="text-[11px] text-stone-300/80 pl-5 leading-relaxed">
                    {pt.problem}
                  </p>
                </div>

                {/* The MarketLink Solution */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-white/10">
                  <div className="flex items-start gap-1.5 text-emerald-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>MarketLink Direct:</span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 pl-5 leading-relaxed font-normal">
                    {pt.solution}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Savings Calculator */}
        <div className="relative z-10 mt-10 p-6 sm:p-9 lg:p-10 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif text-2xl font-normal text-white">
                  Calculate Your Direct Mandi Savings in {city}
                </h3>
              </div>
              <p className="text-xs text-emerald-100/70 leading-relaxed font-normal">
                See how much middleman commission your household or business saves every month by booking farm-direct reservations on MarketLink.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-300">Estimated Monthly Produce Budget:</span>
                  <span className="font-bold text-amber-300 text-sm">Rs. {monthlySpend.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={60000}
                  step={1000}
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-400">
                  <span>Rs. 5,000 / mo</span>
                  <span>Rs. 30,000 / mo</span>
                  <span>Rs. 60,000 / mo</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 space-y-1">
                <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block">
                  Monthly Cash Saved
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-300">
                  Rs. {estimatedSavings.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-200/70 block">~30% middleman margin eliminated</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-stone-300 uppercase tracking-wider block">
                  Direct Farmer Payout
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
                  Rs. {directFarmerPayout.toLocaleString()}
                </div>
                <span className="text-[10px] text-stone-400 block">100% paid directly to stall</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
          {onBrowseProduce && (
            <button
              type="button"
              onClick={onBrowseProduce}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#06241b] font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-[#06241b]" />
              <span>Browse Fresh Produce in {city}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {onExploreMandis && (
            <button
              type="button"
              onClick={onExploreMandis}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <Store className="w-4 h-4 text-emerald-300" />
              <span>Locate {city} Mandi Stalls</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
});

MandiProblemSolver.displayName = 'MandiProblemSolver';
