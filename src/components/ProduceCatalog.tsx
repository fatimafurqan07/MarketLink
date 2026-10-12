import React, { useState, useEffect } from 'react';
import {
  Search,
  Store,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Clock,
  Lock,
  Sprout,
  X,
  Heart,
  Star,
  MessageSquare,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { Product, Market, FarmerProfile, User } from '../types.ts';
import { useCountry } from '../i18n/CountryContext.tsx';
import { MapPin, AlertTriangle } from 'lucide-react';
import { LuxurySelect, LuxurySelectOption } from './common/LuxurySelect.tsx';
import { useHarvestCutoff } from '../hooks/useHarvestCutoff.ts';
import { useScrollReveal } from '../hooks/useScrollReveal.ts';
import { ProductReviewsModal } from './ProductReviewsModal.tsx';
import { PriceTrendModal } from './common/PriceTrendModal.tsx';
import { formatCurrency } from '../utils/formatters.ts';

interface ProduceCatalogProps {
  products: Product[];
  markets: Market[];
  farmers: FarmerProfile[];
  onAddToCart: (product: Product, quantity: number) => void;
  selectedMarketFilter?: number | string | null;
  onClearMarketFilter: () => void;
  selectedFarmerFilter?: number | string | null;
  onClearFarmerFilter?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  favoriteProductIds?: Set<string>;
  onToggleFavoriteProduct?: (productId: string | number) => void;
  currentUser?: User | null;
  completedProductIds?: Set<string>;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const CATEGORY_ITEMS = [
  { id: 'all', label: 'All Produce', match: 'All' },
  { id: 'veg', label: 'Vegetables', match: 'Fresh Vegetables' },
  { id: 'fruits', label: 'Fruits', match: 'Orchard Fruits' },
  { id: 'dairy', label: 'Dairy & Eggs', match: 'Farm Fresh Dairy & Eggs' },
  { id: 'honey', label: 'Honey & Preserves', match: 'Raw Honey & Preserves' },
  { id: 'herbs', label: 'Organic Herbs', match: 'Organic Herbs' },
];

interface ProductCardProps {
  product: Product;
  market?: Market | null;
  farmer?: FarmerProfile | null;
  qty: number;
  isAdded: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string | number) => void;
  onOpenReviews: (product: Product) => void;
  onOpenPriceTrend: (product: Product) => void;
  onQtyChange: (delta: number) => void;
  onSetQty?: (qtyVal: number) => void;
  onAdd: (isLocked: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  market,
  farmer,
  qty,
  isAdded,
  isFavorite,
  onToggleFavorite,
  onOpenReviews,
  onOpenPriceTrend,
  onQtyChange,
  onSetQty,
  onAdd,
}) => {
  const cutoff = useHarvestCutoff(product, market, farmer);

  return (
    <div
      className={`bg-white rounded-3xl border border-[#e2e8e5] shadow-xs card-3d-interactive flex flex-col justify-between h-full overflow-hidden relative group sweep-glare ${
        cutoff.isLocked ? 'opacity-80' : ''
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-[16/10] bg-[#eef2ec] overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Quiet Meta Tagging (Zero-Pill Discipline) */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/95 backdrop-blur-xs text-xs font-semibold text-[#10231d] shadow-xs border border-[#e2e8e5]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span>{product.farming_type || 'Organic'}</span>
        </div>

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`absolute top-3.5 right-3.5 p-2 rounded-xl backdrop-blur-xs shadow-xs transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-50 text-[#b3261e] border border-rose-200'
                : 'bg-white/90 text-[#64748b] hover:text-[#b3261e] hover:bg-white border border-[#e2e8e5]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#b3261e] text-[#b3261e]' : ''}`} />
          </button>
        )}

        <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#10231d]/90 backdrop-blur-xs text-white text-xs font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${product.in_stock > 10 ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`} />
          <span>{product.in_stock} {product.unit} left</span>
        </div>
      </div>

      {/* Content Body with Generous Padding */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl font-normal text-[#10231d] leading-snug line-clamp-1">
              {product.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="text-base sm:text-lg font-bold text-[#10231d] font-mono">
                {formatCurrency(product.price_per_unit)}
              </span>
              <span className="text-xs text-[#64748b] block font-mono">/{product.unit}</span>
            </div>
          </div>

          <p className="text-xs text-[#64748b] mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Harvest Cutoff Info & Reviews Link */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${
                cutoff.isLocked ? 'text-[#b3261e]' : 'text-[#64748b]'
              }`}
            >
              {cutoff.isLocked ? (
                <Lock className="w-3.5 h-3.5 text-[#b3261e] shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span>{cutoff.badgeText}</span>
            </div>

            {/* Reviews & Price Trends Triggers */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenPriceTrend(product)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#64748b] hover:text-[#064e3b] cursor-pointer group/trend"
                title="View Historical Price Trends"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trends</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenReviews(product)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#64748b] hover:text-[#064e3b] cursor-pointer group/rev"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Reviews</span>
              </button>
            </div>
          </div>

          {/* Farmer & Stall info */}
          <div className="mt-4 pt-3 border-t border-[#e2e8e5] flex items-center justify-between text-xs text-[#64748b]">
            <span className="font-medium text-[#10231d] flex items-center gap-1.5 truncate">
              <Store className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
              <span className="truncate">{farmer?.farm_name || product.farmer_name}</span>
            </span>
            <span className="font-mono text-xs text-[#64748b] shrink-0">
              {farmer?.stall_number || 'Stall A-14'}
            </span>
          </div>
        </div>

        {/* Selective Quantity Selection Bar */}
        <div className="pt-2 border-t border-[#e2e8e5]/80 flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-[#64748b] font-mono uppercase font-semibold mr-0.5">
              Qty:
            </span>
            {[1, 2, 3, 5, 10].map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={cutoff.isLocked || preset > product.in_stock}
                onClick={() => onSetQty && onSetQty(preset)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  qty === preset
                    ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-2xs'
                    : 'bg-[#f8f7f2] hover:bg-[#eef2ec] text-[#10231d] border-[#e2e8e5]'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {preset}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono font-bold text-[#064e3b]">
            Total: {formatCurrency(product.price_per_unit * qty)}
          </span>
        </div>

        {/* Action Row */}
        <div className="pt-1 flex items-center gap-2.5">
          <div className="flex items-center border border-[#e2e8e5] rounded-lg bg-[#eef2ec] overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => onQtyChange(-1)}
              disabled={cutoff.isLocked}
              className="p-2 text-[#64748b] hover:text-[#10231d] hover:bg-[#e2e8df] transition-colors cursor-pointer disabled:opacity-30"
              title="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold text-xs text-[#10231d] min-w-7 text-center font-mono">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => onQtyChange(1)}
              disabled={cutoff.isLocked}
              className="p-2 text-[#64748b] hover:text-[#10231d] hover:bg-[#e2e8df] transition-colors cursor-pointer disabled:opacity-30"
              title="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onAdd(cutoff.isLocked)}
            disabled={cutoff.isLocked}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
              cutoff.isLocked
                ? 'bg-[#eae8df] text-[#64748b]'
                : isAdded
                ? 'bg-[#064e3b] text-white border border-[#064e3b]'
                : 'bg-[#064e3b] hover:bg-[#043d2e] text-white active:scale-98'
            }`}
          >
            {cutoff.isLocked ? (
              <span>Time Over</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4 text-[#ecfdf5]" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add To Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export const ProduceCatalog: React.FC<ProduceCatalogProps> = React.memo(({
  products,
  markets,
  farmers,
  onAddToCart,
  selectedMarketFilter,
  onClearMarketFilter,
  selectedFarmerFilter,
  onClearFarmerFilter,
  searchQuery: externalSearchQuery,
  onSearchChange,
  favoriteProductIds,
  onToggleFavoriteProduct,
  currentUser,
  completedProductIds,
  selectedCategory: externalCategory,
  onSelectCategory,
}) => {
  const containerRef = useScrollReveal<HTMLDivElement>();
  const { city, province, countryConfig, openWelcomeModal, setCountrySelection } = useCountry();
  const [internalCategory, setInternalCategory] = useState<string>('All');
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');
  const [marketFilter, setMarketFilter] = useState<number | string | 'All'>(selectedMarketFilter || 'All');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'stock'>('featured');
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});
  const [addedAnimationId, setAddedAnimationId] = useState<string | number | null>(null);

  const selectedCategory = externalCategory !== undefined ? externalCategory : internalCategory;

  const handleCategorySelect = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  // Reviews modal state
  const [reviewModalProduct, setReviewModalProduct] = useState<Product | null>(null);
  // Price trend modal state
  const [priceTrendModalProduct, setPriceTrendModalProduct] = useState<Product | null>(null);

  const currentSearch = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  const handleSearchUpdate = (newQuery: string) => {
    if (onSearchChange) {
      onSearchChange(newQuery);
    } else {
      setInternalSearchQuery(newQuery);
    }
  };

  useEffect(() => {
    if (selectedMarketFilter) {
      setMarketFilter(selectedMarketFilter);
    } else {
      setMarketFilter('All');
    }
  }, [selectedMarketFilter]);

  const handleQtyChange = (productId: string | number, delta: number, maxStock: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleSetQty = (productId: string | number, qtyVal: number, maxStock: number) => {
    setQuantities((prev) => {
      const next = Math.max(1, Math.min(maxStock, qtyVal));
      return { ...prev, [productId]: next };
    });
  };

  const handleAdd = (product: Product, isLocked: boolean) => {
    if (isLocked) return;
    const qty = quantities[product.id] || 1;
    onAddToCart(product, qty);
    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (marketFilter !== 'All' && p.market_id.toString() !== marketFilter.toString()) return false;
      if (selectedFarmerFilter && p.farmer_id.toString() !== selectedFarmerFilter.toString()) return false;
      if (currentSearch.trim()) {
        const q = currentSearch.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchFarmer = p.farmer_name?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchFarmer) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price_per_unit - b.price_per_unit;
      if (sortBy === 'price_desc') return b.price_per_unit - a.price_per_unit;
      if (sortBy === 'stock') return b.in_stock - a.in_stock;
      return 0;
    });

  const selectedFarmer = selectedFarmerFilter
    ? farmers.find((f) => f.id.toString() === selectedFarmerFilter.toString())
    : null;

  const marketOptions: LuxurySelectOption<string | number>[] = [
    { value: 'All', label: 'All Mandi Markets' },
    ...markets.map((m) => ({
      value: m.id,
      label: m.name,
      subLabel: m.city || 'Mandi Hub',
    })),
  ];

  const sortOptions: LuxurySelectOption<'featured' | 'price_asc' | 'price_desc' | 'stock'>[] = [
    { value: 'featured', label: 'Freshest First' },
    { value: 'price_asc', label: 'Price: Kam Se Zyada' },
    { value: 'price_desc', label: 'Price: Zyada Se Kam' },
    { value: 'stock', label: 'Stock Quantity' },
  ];

  const canReviewSelectedProduct = Boolean(
    currentUser &&
      reviewModalProduct &&
      completedProductIds &&
      completedProductIds.has(reviewModalProduct.id.toString())
  );

  return (
    <section
      id="produce-catalog-section"
      ref={containerRef}
      className="reveal-section scroll-mt-20 py-16 sm:py-24 bg-[#faf6ee] border-t border-[#e2e8e5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#064e3b]">
              <Sprout className="w-4 h-4 text-[#064e3b]" />
              <span>SEEDHA KISAN SE</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#10231d]">
              Fresh Sabzi, Fruit &amp; Desi Items
            </h2>

            <p className="text-sm text-[#64748b] leading-relaxed font-normal">
              Bina kisi advance fee ke online order book karein. Stall par samaan dekh kar tasalli se cash ada karein.
            </p>
          </div>

          <button
            type="button"
            onClick={openWelcomeModal}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-[#e2e8e5] text-[#064e3b] hover:bg-[#eef2ec] text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-2 shrink-0 group"
          >
            <MapPin className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Showing Produce in {city}, {province} ({countryConfig.flag})</span>
          </button>
        </div>

        {/* Filters Bar: Responsive Grid System */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e2e8e5] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-2 lg:col-span-5 relative">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={currentSearch}
                onChange={(e) => handleSearchUpdate(e.target.value)}
                placeholder="Search tomatoes, swati apples, desi eggs..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl text-xs sm:text-sm text-[#10231d] placeholder:text-[#64748b]/60 focus:outline-hidden focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:bg-white transition-all font-medium"
              />
              {currentSearch && (
                <button
                  type="button"
                  onClick={() => handleSearchUpdate('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#10231d] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mandi Selector */}
            <div className="sm:col-span-1 lg:col-span-4">
              <LuxurySelect<string | number>
                options={marketOptions}
                value={marketFilter}
                onChange={(val) => {
                  setMarketFilter(val);
                  if (val === 'All') onClearMarketFilter();
                }}
                placeholder="All Mandis"
              />
            </div>

            {/* Sort Selector */}
            <div className="sm:col-span-1 lg:col-span-3">
              <LuxurySelect<'featured' | 'price_asc' | 'price_desc' | 'stock'>
                options={sortOptions}
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                placeholder="Sort by"
              />
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {CATEGORY_ITEMS.map((cat) => {
              const isSelected = selectedCategory === cat.match;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.match)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#064e3b] text-white shadow-xs font-semibold'
                      : 'bg-[#eef2ec] text-[#10231d] hover:bg-[#e2e8df]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Active Filter Indicators */}
          {(marketFilter !== 'All' || selectedFarmerFilter) && (
            <div className="flex items-center gap-2 pt-2 border-t border-[#e2e8e5] flex-wrap text-xs">
              <span className="text-[#64748b] font-medium">Active filters:</span>
              {marketFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ecfdf5] text-[#064e3b] font-semibold border border-emerald-200">
                  <span>Mandi Filtered</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMarketFilter('All');
                      onClearMarketFilter();
                    }}
                    className="hover:text-emerald-950 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedFarmer && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ecfdf5] text-[#064e3b] font-semibold border border-emerald-200">
                  <span>Stall: {selectedFarmer.farm_name}</span>
                  {onClearFarmerFilter && (
                    <button
                      type="button"
                      onClick={onClearFarmerFilter}
                      className="hover:text-emerald-950 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8e5] p-8 sm:p-12 text-center space-y-4 shadow-xs max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-normal text-[#10231d]">
              No Stalls or Produce Found for {city}, {province}
            </h3>
            <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
              We do not currently have live agricultural stalls or harvests registered in <strong>{city}</strong> yet. You can explore fresh produce from our active Mandi hubs below:
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCountrySelection('PK', 'Sindh', 'Hyderabad')}
                className="px-3.5 py-2 rounded-xl bg-[#ecfdf5] hover:bg-emerald-100 text-[#064e3b] border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                📍 Switch to Hyderabad, Sindh
              </button>
              <button
                type="button"
                onClick={() => setCountrySelection('PK', 'Sindh', 'Karachi')}
                className="px-3.5 py-2 rounded-xl bg-[#ecfdf5] hover:bg-emerald-100 text-[#064e3b] border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                📍 Switch to Karachi, Sindh
              </button>
              <button
                type="button"
                onClick={() => setCountrySelection('PK', 'Punjab', 'Lahore')}
                className="px-3.5 py-2 rounded-xl bg-[#ecfdf5] hover:bg-emerald-100 text-[#064e3b] border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                📍 Switch to Lahore, Punjab
              </button>
              <button
                type="button"
                onClick={() => setCountrySelection('PK', 'Islamabad Capital Territory', 'Islamabad')}
                className="px-3.5 py-2 rounded-xl bg-[#ecfdf5] hover:bg-emerald-100 text-[#064e3b] border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                📍 Switch to Islamabad
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  handleSearchUpdate('');
                  handleCategorySelect('All');
                  setMarketFilter('All');
                  onClearMarketFilter();
                  if (onClearFarmerFilter) onClearFarmerFilter();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#eef2ec] text-[#064e3b] font-semibold text-xs border border-[#e2e8e5] shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 perspective-1000">
            {filteredProducts.map((product) => {
              const market = markets.find((m) => m.id.toString() === product.market_id.toString());
              const farmer = farmers.find((f) => f.id.toString() === product.farmer_id.toString());
              const qty = quantities[product.id] || 1;
              const isAdded = addedAnimationId === product.id;
              const isFavorite = favoriteProductIds?.has(product.id.toString());

              return (
                <div key={product.id} className="reveal-stagger-item h-full">
                  <ProductCard
                    product={product}
                    market={market}
                    farmer={farmer}
                    qty={qty}
                    isAdded={isAdded}
                    isFavorite={isFavorite}
                    onToggleFavorite={onToggleFavoriteProduct}
                    onOpenReviews={(p) => setReviewModalProduct(p)}
                    onOpenPriceTrend={(p) => setPriceTrendModalProduct(p)}
                    onQtyChange={(delta) => handleQtyChange(product.id, delta, product.in_stock)}
                    onSetQty={(val) => handleSetQty(product.id, val, product.in_stock)}
                    onAdd={(isLocked) => handleAdd(product, isLocked)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Reviews Modal */}
      {reviewModalProduct && (
        <ProductReviewsModal
          product={reviewModalProduct}
          currentUser={currentUser || null}
          canReview={canReviewSelectedProduct}
          onClose={() => setReviewModalProduct(null)}
        />
      )}

      {/* Price Trend Chart Modal */}
      {priceTrendModalProduct && (
        <PriceTrendModal
          product={priceTrendModalProduct}
          onClose={() => setPriceTrendModalProduct(null)}
        />
      )}
    </section>
  );
});

ProduceCatalog.displayName = 'ProduceCatalog';
