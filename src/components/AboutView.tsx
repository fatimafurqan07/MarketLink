import React from 'react';
import {
  Sprout,
  ShieldCheck,
  Award,
  Globe2,
  Users,
  ArrowRight,
  ShoppingBag,
  QrCode,
  Languages,
  Globe,
  MapPin,
  FileText,
  Share2,
  TrendingUp,
  CloudSun,
  FileSpreadsheet,
  Map,
  Video,
  Sparkles,
} from 'lucide-react';

interface AboutViewProps {
  onBrowseProduce?: () => void;
  onExploreMap?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onBrowseProduce,
  onExploreMap,
}) => {
  const steps = [
    {
      step: '01',
      title: 'Farmer Harvests Dawn Crops',
      description:
        'Fresh seasonal vegetables and fruits are harvested in the morning and brought directly to registered Mandi market stalls.',
      icon: ShoppingBag,
    },
    {
      step: '02',
      title: 'Customer Reserves with 4-Digit Code',
      description:
        'Patrons select fresh produce online for Rs. 0 advance and receive an easy 4-digit verification code.',
      icon: QrCode,
    },
    {
      step: '03',
      title: 'Physical Pickup & Cash Handover',
      description:
        'Customer visits the stall, checks crop freshness, provides the code, and settles in physical cash on the spot.',
      icon: ShieldCheck,
    },
  ];

  const team = [
    {
      name: 'Tariq Mehmood',
      role: 'Founder & Agricultural Lead',
      bio: 'Lifelong advocate for Pakistani growers with over 18 years experience working directly with fruit and vegetable growers in Punjab & Sindh.',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Dr. Ayesha Malik',
      role: 'Head of Quality & Food Standards',
      bio: 'Agricultural scientist dedicated to organic farming standards, transparent grading, and fair pricing protocols for local mandi markets.',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Bilal Farooq',
      role: 'Community & Farmer Relations',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
  ];

  const srsEnhancements = [
    {
      number: '01',
      title: 'Multi-Language Support (English ⇄ Urdu)',
      what: 'Full app-wide language toggle with RTL layout support and Urdu font (Noto Sans Arabic).',
      why: 'Local farmers and buyers in Pakistan are often more comfortable in Urdu; improves accessibility and usability for non-English-speaking users.',
      icon: Languages,
      badge: 'Localization & A11y',
    },
    {
      number: '02',
      title: 'Multi-Country Support',
      what: 'Country-aware configuration (Pakistan / India / USA) — local currency (PKR/INR/USD), correct national ID field/format (CNIC / Aadhaar / Business Registration ID), local market terminology, and country-specific sample markets. First-time visitors see a welcome modal to select their country.',
      why: 'Makes the platform scalable beyond one country and demonstrates real-world localization handling.',
      icon: Globe,
      badge: 'Scalability',
    },
    {
      number: '03',
      title: 'Cascading Location Selector (Country → Province/State → City)',
      what: 'Real geographic dropdown data so farmers/buyers pick their exact location, with nearest-market fallback using distance calculation (Haversine formula) if no market exists in their exact city.',
      why: 'Improves data accuracy and matches real-world address selection instead of free-text location entry.',
      icon: MapPin,
      badge: 'Geospatial Data',
    },
    {
      number: '04',
      title: 'PDF Invoice / Receipt Generation',
      what: 'Buyers can download a proper PDF receipt for any completed order (order details, items, prices, total).',
      why: 'Gives customers a real proof-of-purchase document, similar to standard e-commerce platforms.',
      icon: FileText,
      badge: 'E-Commerce Utility',
    },
    {
      number: '05',
      title: 'WhatsApp Order Sharing',
      what: 'One-tap sharing of an order summary via WhatsApp using a wa.me deep link (no paid API required).',
      why: 'WhatsApp is the most commonly used communication app locally; lets buyers easily share order details with family/friends or farmers confirm orders quickly.',
      icon: Share2,
      badge: 'Social Commerce',
    },
    {
      number: '06',
      title: 'Price Trend Analytics (Charts)',
      what: 'Visual price-trend graphs for produce items using Recharts.',
      why: 'Helps buyers and farmers understand pricing patterns over time and make informed decisions.',
      icon: TrendingUp,
      badge: 'Market Intelligence',
    },
    {
      number: '07',
      title: 'Farmer Weather Widget',
      what: 'Live local weather display on the farmer dashboard using the free Open-Meteo API (no API key required).',
      why: 'Weather directly affects farming/harvest decisions — a practical, relevant addition for farmer users.',
      icon: CloudSun,
      badge: 'Open-Meteo API',
    },
    {
      number: '08',
      title: 'Admin Excel/CSV Export',
      what: 'Admin can export reports and user lists directly to Excel/CSV format.',
      why: 'Makes it easy for admin to analyze data offline or share reports with stakeholders, a common real-world admin requirement.',
      icon: FileSpreadsheet,
      badge: 'Reporting & Audit',
    },
    {
      number: '09',
      title: 'Interactive Map for Market Locations',
      what: 'Live map showing market/mandi locations using Leaflet with Esri World Street Map tiles (free, no API key).',
      why: 'Lets buyers/farmers visually locate the nearest market instead of just reading an address.',
      icon: Map,
      badge: 'Interactive Leaflet',
    },
    {
      number: '10',
      title: 'Background Video Hero Section',
      what: 'Homepage hero section with a looping real farmers-market video background instead of a static image.',
      why: 'Creates a more professional, modern first impression for visitors.',
      icon: Video,
      badge: 'Engaging UI/UX',
    },
  ];

  return (
    <div className="w-full space-y-16 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-white border border-[#e2e8e5] p-8 sm:p-12 lg:p-16 text-[#10231d] overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] text-xs font-mono font-semibold">
            <Sprout className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>Seedha Kisan Se (Direct from Farmer)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-[#10231d] leading-tight">
            Fresh Mandi Vegetables &amp; Fruits Directly From Local Farmers
          </h1>

          <p className="text-base sm:text-lg text-[#64748b] leading-relaxed font-normal">
            MarketLink connects everyday buyers directly with local farmers in your city’s Mandi. No middlemen (Arthi), no extra charges, and fair rates for everyone.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            {onBrowseProduce && (
              <button
                type="button"
                onClick={onBrowseProduce}
                className="h-11 px-6 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer border border-[#064e3b]"
              >
                <span>Browse Fresh Items</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onExploreMap && (
              <button
                type="button"
                onClick={onExploreMap}
                className="h-11 px-6 rounded-xl bg-[#eef2ec] hover:bg-[#eae8df] border border-[#e2e8e5] text-[#064e3b] font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>View Mandis &amp; Stalls Map</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Core Mission & Pillars */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-serif font-normal text-[#10231d] tracking-tight">
            Our Promises to You
          </h2>
          <p className="text-sm text-[#64748b] leading-relaxed">
            Fair trade, complete honesty, and direct support for Pakistani farmers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e2e8e5] shadow-xs space-y-4 hover:border-[#064e3b]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#064e3b]" />
            </div>
            <h3 className="text-xl font-serif font-normal text-[#10231d]">No Middlemen Charges (Seedha Kisan Se)</h3>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              Every rupee you pay at the stall goes straight to the farmer. No cuts, no commission, and no price markups.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e2e8e5] shadow-xs space-y-4 hover:border-[#064e3b]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] flex items-center justify-center">
              <Award className="w-6 h-6 text-[#064e3b]" />
            </div>
            <h3 className="text-xl font-serif font-normal text-[#10231d]">Check Quality Before Paying</h3>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              You inspect every item in your order at the stall. If something isn't fresh, the farmer adjusts the bill right there.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e2e8e5] shadow-xs space-y-4 hover:border-[#064e3b]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-[#064e3b]" />
            </div>
            <h3 className="text-xl font-serif font-normal text-[#10231d]">Local Mandi Network</h3>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
              Serving Super Highway Mandi Karachi, Badami Bagh Mandi Lahore, and I-11 Mandi Islamabad with live stall timings.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-[#f8f7f2] border border-[#e2e8e5] space-y-8 shadow-xs">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#064e3b]">
            3 Simple Steps
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-normal text-[#10231d] tracking-tight">
            How MarketLink Works
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b]">
            From the field to your shopping bag in three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-white border border-[#e2e8e5] shadow-xs relative space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#064e3b] text-white flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <span className="text-2xl font-bold font-mono text-stone-300">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-serif font-normal text-[#10231d]">{item.title}</h3>
                <p className="text-xs text-[#64748b] leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Additional Features Beyond SRS Baseline */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>Extra Features &amp; Enhancements</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-normal text-[#10231d] tracking-tight">
            Additional Features Beyond SRS Baseline
          </h2>
          <p className="text-sm text-[#64748b] leading-relaxed">
            High-impact capabilities implemented on top of the core SRS requirements to maximize accessibility, usability, and real-world agricultural workflow fidelity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {srsEnhancements.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.number}
                className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e2e8e5] shadow-xs space-y-4 hover:border-[#064e3b]/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] text-[#064e3b] border border-emerald-200 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#064e3b]" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#064e3b] bg-[#ecfdf5] px-3 py-1 rounded-full border border-emerald-200">
                        {feat.number}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-lg">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#10231d] tracking-tight">
                    {feat.title}
                  </h3>

                  <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-[#475569]">
                    <p>
                      <strong className="text-[#064e3b] font-semibold">What: </strong>
                      {feat.what}
                    </p>
                    <p>
                      <strong className="text-stone-800 font-semibold">Why: </strong>
                      {feat.why}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <p className="text-xs sm:text-sm text-[#064e3b] font-medium">
            💡 <strong>Note:</strong> All above features utilize free, open-source APIs or self-contained client algorithms (zero paid subscription dependencies), keeping MarketLink fully self-hostable.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef2ec] border border-[#e2e8e5] text-[#064e3b] text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>Our Team</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-normal text-[#10231d] tracking-tight">
            The MarketLink Team
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Dedicated people working to connect farmers and customers across Pakistan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="p-7 sm:p-8 rounded-3xl bg-white border border-[#e2e8e5] shadow-xs space-y-4 text-center group hover:border-[#064e3b]/30 transition-all"
            >
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#e2e8e5] group-hover:border-[#064e3b]/50 transition-colors shadow-xs"
                />
              </div>

              <div>
                <h3 className="text-lg font-serif font-normal text-[#10231d]">{member.name}</h3>
                <p className="text-xs font-mono font-medium text-[#064e3b] mt-1">{member.role}</p>
                {member.bio && (
                  <p className="text-xs text-[#64748b] mt-2 leading-relaxed">{member.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
