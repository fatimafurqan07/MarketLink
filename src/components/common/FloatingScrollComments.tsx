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
  CheckCircle,
} from 'lucide-react';

interface SideComment {
  id: string;
  author: string;
  location: string;
  role: 'Buyer' | 'Kisan / Farmer' | 'Wholesaler';
  text: string;
  mandi: string;
  crop: string;
  rating: number;
  timeAgo: string;
  avatar: string;
  verified: boolean;
}

const SIDE_COMMENTS: SideComment[] = [
  {
    id: 'sc-1',
    author: 'Zeeshan Memon',
    location: 'Hyderabad',
    role: 'Buyer',
    text: 'Picked up 40kg Sindh Red Onions at Hala Naka Mandi Stall H-04. Zero advance fee, cash paid after inspecting the sacks!',
    mandi: 'Hala Naka Sabzi Mandi',
    crop: 'Sindh Red Onions',
    rating: 5,
    timeAgo: 'Just now',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    verified: true,
  },
  {
    id: 'sc-2',
    author: 'Kisan Ghulam Mustafa',
    location: 'Matiari / Hyderabad',
    role: 'Kisan / Farmer',
    text: 'Delivered fresh morning Matiari bananas to Hala Naka Mandi. 30 crates pre-reserved online within 1 hour!',
    mandi: 'Hala Naka Sabzi Mandi',
    crop: 'Matiari Sweet Bananas',
    rating: 5,
    timeAgo: '4m ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    verified: true,
  },
  {
    id: 'sc-3',
    author: 'Farida Begum',
    location: 'Karachi (Gulshan)',
    role: 'Buyer',
    text: 'Ordered 15kg Roma Tomatoes at Super Highway Gate 3. Showed 4-digit pass and drove off in 3 mins. No bargaining hassle.',
    mandi: 'Super Highway Sabzi Mandi',
    crop: 'Roma Tomatoes',
    rating: 5,
    timeAgo: '12m ago',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    verified: true,
  },
  {
    id: 'sc-4',
    author: 'Haji Karim',
    location: 'Malir, Karachi',
    role: 'Kisan / Farmer',
    text: 'Harvested fresh palak and mint from Memon Goth riverbed at 4:30 AM. Ready at Malir Mandi Stall M-06.',
    mandi: 'Malir Sabzi Mandi',
    crop: 'Fresh Malir Palak',
    rating: 5,
    timeAgo: '18m ago',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    verified: true,
  },
  {
    id: 'sc-5',
    author: 'Tariq Butt',
    location: 'Lahore',
    role: 'Wholesaler',
    text: 'Badami Bagh Hub pickup code verification is instantaneous. Clean crates and direct farm rates.',
    mandi: 'Badami Bagh Mandi',
    crop: 'Desi Eggs & Potatoes',
    rating: 5,
    timeAgo: '25m ago',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    verified: true,
  },
];

interface FloatingScrollCommentsProps {
  onScrollToMandi?: () => void;
  onScrollToProduce?: () => void;
}

export const FloatingScrollComments: React.FC<FloatingScrollCommentsProps> = React.memo(({
  onScrollToMandi,
  onScrollToProduce,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show only after scrolling down a bit (past initial hero fold)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotate through comments periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SIDE_COMMENTS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const currentComment = SIDE_COMMENTS[currentIndex];

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="h-11 px-4 rounded-full bg-[#10231d] text-white text-xs font-semibold shadow-xl border border-emerald-500/30 flex items-center gap-2.5 cursor-pointer hover:bg-[#064e3b] transition-all hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Live Mandi Feed ({SIDE_COMMENTS.length})</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Live Mandi Community Stream"
      className="fixed bottom-6 right-6 z-40 max-w-[340px] sm:max-w-[380px] w-full animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#e2e8e5] shadow-2xl space-y-3 relative group text-left ring-1 ring-black/5">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[#e2e8e5] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#064e3b]">
              Live Mandi Activity Feed
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + SIDE_COMMENTS.length) % SIDE_COMMENTS.length)}
              className="p-1 rounded text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] cursor-pointer"
              title="Previous comment"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % SIDE_COMMENTS.length)}
              className="p-1 rounded text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] cursor-pointer"
              title="Next comment"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded text-[#64748b] hover:text-[#b3261e] hover:bg-rose-50 cursor-pointer ml-1"
              title="Minimize feed"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Comment Body */}
        <div className="flex items-start gap-3">
          <img
            src={currentComment.avatar}
            alt={currentComment.author}
            className="w-10 h-10 rounded-full object-cover border border-[#e2e8e5] shrink-0 shadow-xs"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs text-[#10231d] truncate">
                  {currentComment.author}
                </span>
                {currentComment.verified && (
                  <CheckCircle className="w-3 h-3 text-[#064e3b] shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-[#64748b] font-mono">
                {currentComment.timeAgo}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-[#64748b] mt-0.5">
              <span className="font-medium text-[#064e3b] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {currentComment.role}
              </span>
              <span>•</span>
              <span className="truncate">{currentComment.location}</span>
            </div>

            <p className="text-xs text-[#10231d] mt-2 leading-relaxed font-normal">
              "{currentComment.text}"
            </p>
          </div>
        </div>

        {/* Bottom Tag & Quick Action */}
        <div className="pt-2 border-t border-[#e2e8e5] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-[#064e3b] font-mono font-medium truncate">
            <Store className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
            <span className="truncate">{currentComment.mandi}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-amber-600 font-bold font-mono text-[10px]">
              ★ {currentComment.rating}.0
            </span>
            {onScrollToProduce && (
              <button
                type="button"
                onClick={onScrollToProduce}
                className="text-[10px] font-bold text-[#064e3b] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>View Crops</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
});

FloatingScrollComments.displayName = 'FloatingScrollComments';
