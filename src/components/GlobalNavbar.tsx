import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout,
  Store,
  ShoppingBag,
  Search,
  LogIn,
  ShoppingBasket,
  X,
  Menu,
  Ticket,
  HelpCircle,
  Info,
  Mail,
  Filter,
  Check,
  RotateCcw,
  User as UserIcon,
  Edit3,
  LayoutDashboard,
  Sparkles,
  Tag,
  MapPin,
} from 'lucide-react';
import { Market, User } from '../types.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { useCountry } from '../i18n/CountryContext.tsx';
import { UserAvatar } from './common/UserAvatar.tsx';
import { BASELINE_MANDI_MARKETS } from './MarketMap.tsx';

interface GlobalNavbarProps {
  markets: Market[];
  selectedMarketId: number | string | null;
  onSelectMarket: (marketId: number | string | null) => void;
  onBrowseProduce: () => void;
  onFindStalls: () => void;
  onHowItWorks?: () => void;
  onAboutUs?: () => void;
  onContactUs?: () => void;
  onOpenAuth: (tab?: 'signin' | 'customer_register' | 'farmer_register') => void;
  onOpenCart: () => void;
  cartCount: number;
  onTriggerSearch?: (query: string) => void;
  catalogSearchQuery?: string;
  onOpenPasses?: () => void;
  activePassCount?: number;
  activeEntity?: 'vendor' | 'farmer';
  onSelectEntity?: (entity: 'vendor' | 'farmer') => void;
  currentUser?: User | null;
  onOpenEditProfile?: () => void;
  onOpenDashboard?: () => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const PRODUCE_CATEGORIES = [
  { id: 'All', label: 'All Produce' },
  { id: 'Fresh Vegetables', label: 'Fresh Vegetables' },
  { id: 'Orchard Fruits', label: 'Orchard Fruits' },
  { id: 'Farm Fresh Dairy & Eggs', label: 'Dairy & Eggs' },
  { id: 'Raw Honey & Preserves', label: 'Honey & Preserves' },
  { id: 'Organic Herbs', label: 'Organic Herbs' },
];

export const GlobalNavbar: React.FC<GlobalNavbarProps> = ({
  markets,
  selectedMarketId,
  onSelectMarket,
  onBrowseProduce,
  onFindStalls,
  onHowItWorks,
  onAboutUs,
  onContactUs,
  onOpenAuth,
  onOpenCart,
  cartCount,
  onTriggerSearch,
  catalogSearchQuery = '',
  onOpenPasses,
  activePassCount = 0,
  currentUser,
  onOpenEditProfile,
  onOpenDashboard,
  selectedCategory = 'All',
  onSelectCategory,
}) => {
  const { t } = useLanguage();
  const { city, province, countryConfig, openWelcomeModal } = useCountry();
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterSearchVal, setFilterSearchVal] = useState(catalogSearchQuery);
  const [localCategory, setLocalCategory] = useState<string>(selectedCategory);
  const [localMarketId, setLocalMarketId] = useState<number | string | null>(selectedMarketId);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Consolidate markets for filtering
  const displayMarkets = React.useMemo(() => {
    if (!markets || markets.length === 0) return BASELINE_MANDI_MARKETS;
    const combined = [...markets];
    for (const b of BASELINE_MANDI_MARKETS) {
      if (!combined.some((m) => m.id?.toString() === b.id?.toString() || m.slug === b.slug)) {
        combined.push(b);
      }
    }
    return combined;
  }, [markets]);

  useEffect(() => {
    setFilterSearchVal(catalogSearchQuery);
  }, [catalogSearchQuery]);

  useEffect(() => {
    setLocalCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    setLocalMarketId(selectedMarketId);
  }, [selectedMarketId]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterDropdownOpen]);

  const hasActiveFilters = Boolean(
    selectedMarketId || catalogSearchQuery || (selectedCategory && selectedCategory !== 'All')
  );

  const activeFiltersCount =
    (selectedMarketId ? 1 : 0) +
    (catalogSearchQuery.trim() ? 1 : 0) +
    (selectedCategory && selectedCategory !== 'All' ? 1 : 0);

  const handleApplyFilter = () => {
    if (onTriggerSearch) {
      onTriggerSearch(filterSearchVal.trim());
    }
    if (onSelectCategory) {
      onSelectCategory(localCategory);
    }
    onSelectMarket(localMarketId);
    setIsFilterDropdownOpen(false);
    onBrowseProduce();
  };

  const handleResetFilters = () => {
    setFilterSearchVal('');
    setLocalCategory('All');
    setLocalMarketId(null);
    if (onTriggerSearch) {
      onTriggerSearch('');
    }
    if (onSelectCategory) {
      onSelectCategory('All');
    }
    onSelectMarket(null);
    setIsFilterDropdownOpen(false);
  };

  const handleScrollToHowItWorks = () => {
    if (onHowItWorks) {
      onHowItWorks();
    } else {
      const el = document.getElementById('how-it-works-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 sm:h-[68px] w-full backdrop-blur-xl bg-[#faf6ee]/90 border-b border-stone-200/80 shadow-[0_4px_24px_-4px_rgba(6,78,59,0.06)] transition-all duration-300">
      {/* Luxury emerald accent line across top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#064e3b]/35 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#root"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#064e3b] via-[#056049] to-[#022e22] flex items-center justify-center text-white shrink-0 shadow-sm ring-1 ring-emerald-400/25 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
              <Sprout className="w-4.5 h-4.5 text-[#ecfdf5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-[26px] font-normal text-[#10231d] tracking-tight group-hover:text-[#064e3b] transition-colors leading-none">
                Market<span className="text-[#064e3b] italic">Link</span>
              </span>
            </div>
          </a>

          {/* Region & Location Switcher Pill */}
          <button
            type="button"
            onClick={openWelcomeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 hover:bg-emerald-100/90 text-[#064e3b] text-xs font-semibold transition-all cursor-pointer shadow-2xs group shrink-0"
            title="Click to Change Region, Province, or City"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-none font-medium">{city}, {province}</span>
            <span className="text-[11px] shrink-0 font-mono">
              {countryConfig.flag}
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Floating Capsule Group) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-medium text-[#475569] bg-stone-100/70 p-1 rounded-full border border-stone-200/70 backdrop-blur-xs">
          <button
            type="button"
            onClick={onFindStalls}
            className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-[#064e3b] hover:shadow-2xs text-[#475569] transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap font-medium"
          >
            <Store className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>{t('nav.mandis', 'Find Mandis & Stalls')}</span>
          </button>

          <button
            type="button"
            onClick={onBrowseProduce}
            className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-[#064e3b] hover:shadow-2xs text-[#475569] transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap font-medium"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>{t('nav.freshHarvest', 'Fresh Harvest')}</span>
          </button>

          <button
            type="button"
            onClick={handleScrollToHowItWorks}
            className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-[#064e3b] hover:shadow-2xs text-[#475569] transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#64748b]" />
            <span>{t('nav.howItWorks', 'How It Works')}</span>
          </button>

          {onAboutUs && (
            <button
              type="button"
              onClick={onAboutUs}
              className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-[#064e3b] hover:shadow-2xs text-[#475569] transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap font-medium"
            >
              <Info className="w-3.5 h-3.5 text-[#064e3b]" />
              <span>{t('nav.about', 'About Us')}</span>
            </button>
          )}

          {onContactUs && (
            <button
              type="button"
              onClick={onContactUs}
              className="px-3.5 py-1.5 rounded-full hover:bg-white hover:text-[#064e3b] hover:shadow-2xs text-[#475569] transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap font-medium"
            >
              <Mail className="w-3.5 h-3.5 text-[#064e3b]" />
              <span>{t('nav.contact', 'Contact')}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (Functional Filter, Passes, Cart, Auth / Profile) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Interactive Filter Button & Popover */}
          <div className="relative" ref={filterMenuRef}>
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className={`h-9 px-3.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs flex items-center gap-1.5 ${
                isFilterDropdownOpen || hasActiveFilters
                  ? 'bg-emerald-50/90 border-emerald-300 text-[#064e3b] ring-1 ring-emerald-300 font-bold shadow-xs'
                  : 'bg-white/95 hover:bg-white hover:border-emerald-300 border-stone-200/90 text-[#10231d]'
              }`}
              title="Filter produce by keyword, category, or Mandi"
              aria-expanded={isFilterDropdownOpen}
            >
              <Filter className="w-3.5 h-3.5 text-[#064e3b]" />
              <span className="hidden sm:inline">{t('common.filter', 'Filter')}</span>
              {hasActiveFilters && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#064e3b] text-white text-[10px] font-mono font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Comprehensive Filter Popover */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-84 sm:w-[420px] rounded-2xl bg-white border border-[#e2e8e5] shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 space-y-4 max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8e5]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#064e3b]" />
                    <span className="font-semibold text-xs text-[#10231d] uppercase tracking-wider font-mono">
                      Filter Produce &amp; Mandis
                    </span>
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset All</span>
                    </button>
                  )}
                </div>

                {/* 1. Keyword Search */}
                <div>
                  <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                    Crop or Produce Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterSearchVal}
                      onChange={(e) => setFilterSearchVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyFilter();
                        }
                      }}
                      placeholder="e.g. Tomatoes, Palak, Apples, Desi Eggs..."
                      className="w-full h-9 pl-3 pr-8 text-xs bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:bg-white"
                    />
                    <Search className="w-4 h-4 text-[#64748b] absolute right-2.5 top-2.5" />
                  </div>
                </div>

                {/* 2. Category Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-[#64748b] block mb-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#064e3b]" />
                    <span>Produce Category</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRODUCE_CATEGORIES.map((cat) => {
                      const isSelected = localCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setLocalCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                              : 'bg-[#f8f7f2] hover:bg-[#eef2ec] text-[#10231d] border-[#e2e8e5]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Mandi Facility Selection */}
                <div>
                  <label className="text-[11px] font-semibold text-[#64748b] block mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#064e3b]" />
                    <span>Filter by Mandi Hub</span>
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => setLocalMarketId(null)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer border ${
                        localMarketId === null
                          ? 'bg-[#ecfdf5] text-[#064e3b] font-bold border-emerald-300'
                          : 'bg-[#f8f7f2] text-[#10231d] hover:bg-[#eef2ec] border-[#e2e8e5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5 text-[#064e3b]" />
                        <span>All Mandis Combined</span>
                      </div>
                      {localMarketId === null && <Check className="w-3.5 h-3.5 text-[#064e3b]" />}
                    </button>

                    {displayMarkets.map((m) => {
                      const isSelected = localMarketId?.toString() === m.id.toString();
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setLocalMarketId(m.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-[#ecfdf5] text-[#064e3b] font-bold border-emerald-300'
                              : 'bg-[#f8f7f2] text-[#10231d] hover:bg-[#eef2ec] border-[#e2e8e5]'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="truncate font-semibold">{m.name}</div>
                            <div className="text-[10px] text-[#64748b] font-mono">{m.city} • {m.stall_count || 24} Stalls</div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#e2e8e5] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-[#64748b] hover:text-[#10231d] cursor-pointer"
                  >
                    Clear Filters
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen(false)}
                      className="h-9 px-3.5 rounded-xl border border-[#e2e8e5] text-xs font-semibold text-[#64748b] hover:bg-[#eef2ec] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyFilter}
                      className="h-9 px-4 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Apply Filters</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Passes Shortcut */}
          {activePassCount > 0 && onOpenPasses && (
            <button
              type="button"
              onClick={onOpenPasses}
              title="Open My Active PIN Passes"
              className="h-9 px-3 sm:px-3.5 rounded-full bg-amber-50/90 hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs font-semibold transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Ticket className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{t('nav.preorders', 'My Passes')}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-200/90 text-amber-900 font-mono text-[10px] font-bold">
                {activePassCount}
              </span>
            </button>
          )}

          {/* Harvest Basket */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="View pre-order harvest basket"
            className="h-9 px-3.5 rounded-full bg-white/95 hover:bg-white border border-stone-200/90 hover:border-emerald-300 text-[#10231d] text-xs font-medium transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-2 shrink-0 group"
          >
            <ShoppingBasket className="w-4 h-4 text-[#064e3b] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-semibold">{t('nav.cart', 'Cart')}</span>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-[#064e3b] text-white font-mono text-[10px] font-bold shadow-2xs group-hover:scale-105 transition-transform">
              {cartCount}
            </span>
          </button>

          {/* User Profile Capsule or Sign In Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenEditProfile}
                title="Edit My Profile & Account Settings"
                className="flex items-center gap-2 pl-1.5 py-1 pr-3 rounded-full bg-white/95 hover:bg-white border border-stone-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs cursor-pointer transition-all duration-200"
              >
                <UserAvatar
                  name={currentUser.name}
                  avatarUrl={currentUser.avatar_url}
                  size="xs"
                  role={currentUser.role}
                />
                <div className="hidden sm:block text-left min-w-0">
                  <div className="text-xs font-semibold text-[#10231d] truncate max-w-[100px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] text-[#064e3b] font-mono font-bold flex items-center gap-0.5">
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Edit Profile</span>
                  </div>
                </div>
              </button>

              {onOpenDashboard && (
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="h-9 px-3 sm:px-4 rounded-full bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all duration-200 shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Workspace</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              className="h-9 px-4 sm:px-5 rounded-full bg-gradient-to-r from-[#064e3b] via-[#056049] to-[#064e3b] hover:from-[#043d2e] hover:to-[#044a39] text-white text-xs font-semibold tracking-wide shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#ecfdf5]" />
              <span>{t('nav.signIn', 'Sign In')}</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-full bg-white/95 border border-stone-200/90 hover:border-emerald-300 text-[#10231d] cursor-pointer shadow-2xs hover:shadow-xs transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200/80 bg-[#faf6ee]/98 backdrop-blur-xl px-4 py-4 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Quick Mobile Produce & Mandi Search/Filter */}
          <div className="p-3 bg-white/90 border border-stone-200/80 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#10231d] flex items-center gap-1.5 font-mono">
                <Filter className="w-3.5 h-3.5 text-[#064e3b]" />
                <span>Filter Produce &amp; Mandis</span>
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setMobileMenuOpen(false);
                  }}
                  className="text-[11px] text-rose-600 font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterSearchVal}
                onChange={(e) => setFilterSearchVal(e.target.value)}
                placeholder="Search vegetables, fruits, honey..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:outline-hidden focus:border-[#064e3b]"
              />
            </div>

            {/* Quick Mandi Selector */}
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748b] block mb-1">
                Filter by Mandi:
              </label>
              <select
                value={localMarketId ?? ''}
                onChange={(e) => setLocalMarketId(e.target.value ? e.target.value : null)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:outline-hidden"
              >
                <option value="">All Mandi Hubs</option>
                {displayMarkets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1">
              {PRODUCE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setLocalCategory(cat.id)}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                    localCategory === cat.id
                      ? 'bg-[#064e3b] text-white border-[#064e3b]'
                      : 'bg-white text-[#10231d] border-[#e2e8e5]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                handleApplyFilter();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-[#064e3b] text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Apply Filter Selection
            </button>
          </div>

          {currentUser && onOpenEditProfile && (
            <button
              type="button"
              onClick={() => {
                onOpenEditProfile();
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#064e3b] font-semibold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit My Profile ({currentUser.name})</span>
            </button>
          )}

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onFindStalls();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-[#10231d] hover:bg-[#eef2ec] flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-[#064e3b]" />
              <span>Find Mandis &amp; Stalls</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onBrowseProduce();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-[#10231d] hover:bg-[#eef2ec] flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#064e3b]" />
              <span>Fresh Farm Harvest</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleScrollToHowItWorks();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl text-xs font-medium text-[#10231d] hover:bg-[#eef2ec] flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-[#64748b]" />
              <span>How It Works</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
