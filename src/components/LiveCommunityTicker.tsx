import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Star,
  ShoppingBag,
  TrendingUp,
  X,
  Store,
} from 'lucide-react';

interface CommentItem {
  id: string;
  author: string;
  city: string;
  role: 'Buyer' | 'Grower' | 'Chef';
  text: string;
  crop: string;
  mandi: string;
  rating: number;
  timeAgo: string;
  avatar: string;
}

const LIVE_COMMENTS: CommentItem[] = [
  {
    id: '1',
    author: 'Rafiq Ahmed',
    city: 'Karachi',
    role: 'Buyer',
    text: 'Picked up 10kg Roma Tomatoes from Malir stall S-09 at dawn. Quality was firm and sweet!',
    crop: 'Sindh Roma Tomatoes',
    mandi: 'Super Highway Sabzi Mandi',
    rating: 5,
    timeAgo: '4m ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '2',
    author: 'Zubaida Khan',
    city: 'Hyderabad',
    role: 'Buyer',
    text: 'Hala Naka Mandi stall had my Matiari onions weighed and packed. Paid zero advance fee!',
    crop: 'Indus Sweet Onions',
    mandi: 'Hala Naka Sabzi Mandi',
    rating: 5,
    timeAgo: '11m ago',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '3',
    author: 'Hassan Ali',
    city: 'Lahore',
    role: 'Chef',
    text: 'Badami Bagh desi eggs were pasture-fresh with deep golden yolks. Reservation PIN worked in 5s.',
    crop: 'Desi Golden Eggs',
    mandi: 'Badami Bagh Hub',
    rating: 5,
    timeAgo: '19m ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '4',
    author: 'Jahangir Khan',
    city: 'Swat / Islamabad',
    role: 'Grower',
    text: 'Delivered fresh mountain Fuji apples to I-11/4 Mandi stall today. All 40 crates pre-claimed!',
    crop: 'Swat Mountain Apples',
    mandi: 'I-11/4 Sabzi & Fruit Mandi',
    rating: 5,
    timeAgo: '28m ago',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '5',
    author: 'Farida Memon',
    city: 'Karachi',
    role: 'Buyer',
    text: 'Malir Mandi morning palak and methi are so fresh they still had dew. Best direct-from-kisan service.',
    crop: 'Malir Desi Palak',
    mandi: 'Malir Sabzi Mandi',
    rating: 5,
    timeAgo: '35m ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
];

interface LiveCommunityTickerProps {
  onExploreMandi?: (mandiName: string) => void;
  onBrowseProduce?: () => void;
}

export const LiveCommunityTicker: React.FC<LiveCommunityTickerProps> = ({
  onExploreMandi,
  onBrowseProduce,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  // Auto-rotate comments
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % LIVE_COMMENTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Track scroll position for subtle interactive depth
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  const current = LIVE_COMMENTS[activeIndex];
  const depthFactor = Math.min(15, Math.floor(scrollY / 120));

  return (
    <aside
      aria-label="Live Mandi Community Activity"
      className="fixed bottom-6 right-4 sm:right-6 z-40 max-w-xs sm:max-w-sm w-full transition-all duration-300"
      style={{
        transform: `translateY(${depthFactor > 8 ? 0 : 0}px)`,
      }}
    >
      <div className="bg-white/95 backdrop-blur-md border border-[#e2e8e5] rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Banner Bar */}
        <div className="px-3.5 py-2.5 bg-[#064e3b] text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-emerald-200">
              Live Mandi Activity
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Expand all comments'}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close activity feed"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active Comment Card */}
        {!isExpanded ? (
          <div className="p-3.5 space-y-2.5 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={current.avatar}
                  alt={current.author}
                  className="w-8 h-8 rounded-full object-cover border border-[#e2e8e5] shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#10231d] truncate">
                    {current.author}
                  </h4>
                  <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-mono">
                    <MapPin className="w-2.5 h-2.5 text-[#064e3b]" />
                    <span>{current.city}</span>
                    <span>•</span>
                    <span className="text-[#064e3b] font-semibold">{current.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-amber-600 gap-0.5 shrink-0">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="text-[11px] font-bold font-mono">5.0</span>
              </div>
            </div>

            <p className="text-xs text-[#334155] leading-relaxed italic bg-[#f8f7f2] p-2.5 rounded-xl border border-[#e2e8e5]">
              &ldquo;{current.text}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-1 text-[10px] text-[#64748b]">
              <span className="font-mono text-[#064e3b] font-semibold flex items-center gap-1">
                <Store className="w-3 h-3" />
                {current.mandi}
              </span>
              <span className="font-mono text-stone-400">{current.timeAgo}</span>
            </div>
          </div>
        ) : (
          <div className="p-3 max-h-72 overflow-y-auto space-y-2.5">
            {LIVE_COMMENTS.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.avatar}
                      alt={item.author}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-bold text-[#10231d]">{item.author}</span>
                      <span className="text-[10px] text-[#64748b] ml-1.5">({item.city})</span>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] text-[#64748b]">{item.timeAgo}</span>
                </div>
                <p className="text-[11px] text-[#334155] leading-snug">&ldquo;{item.text}&rdquo;</p>
                <div className="text-[9px] font-mono text-[#064e3b] font-semibold flex items-center justify-between pt-1 border-t border-[#e2e8e5]">
                  <span>{item.crop}</span>
                  <span>{item.mandi}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Quick Action */}
        <div className="px-3.5 py-2 bg-[#f8f7f2] border-t border-[#e2e8e5] flex items-center justify-between text-[11px]">
          <span className="text-[#64748b] font-medium">Over 2,400+ fresh harvests reserved</span>
          {onBrowseProduce && (
            <button
              type="button"
              onClick={onBrowseProduce}
              className="text-[#064e3b] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Explore</span>
              <ShoppingBag className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
