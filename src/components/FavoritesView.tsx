import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Store,
  Trash2,
  ArrowRight,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Favorite, Product } from '../types.ts';
import { ProductStockBadge } from './common/StatusBadge.tsx';
import { formatCurrency } from '../utils/formatters.ts';

interface FavoritesViewProps {
  favorites: Favorite[];
  onRemoveFavorite: (favId: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onExploreProduce: () => void;
  onExploreMap: () => void;
  onFilterByFarmer?: (farmerId: number | string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onRemoveFavorite,
  onAddToCart,
  onExploreProduce,
  onExploreMap,
  onFilterByFarmer,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'farmers'>('products');

  const favoriteProducts = favorites.filter((f) => f.product && f.product_id);
  const favoriteFarmers = favorites.filter((f) => f.farmer && f.farmer_id);

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e2e8e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] text-xs font-semibold mb-3">
            <Heart className="w-3.5 h-3.5 fill-[#064e3b] text-[#064e3b]" />
            <span>Personal Agricultural Bookmarks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#10231d]">
            Saved Favorites &amp; Verified Growers
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-2 max-w-xl font-normal leading-relaxed">
            Quickly re-order dawn harvest batches from your trusted grower stalls and keep track of your favorite seasonal crops.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onExploreProduce}
            className="px-4 py-2.5 rounded-xl bg-[#eef2ec] hover:bg-[#eae8df] text-[#064e3b] text-xs font-semibold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer border border-[#e2e8e5]"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4 text-[#064e3b]" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#e2e8e5] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'text-[#64748b] hover:bg-[#eef2ec]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Saved Crops ({favoriteProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('farmers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'farmers'
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'text-[#64748b] hover:bg-[#eef2ec]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Grower Stalls ({favoriteFarmers.length})</span>
          </button>
        </div>

        <span className="text-xs text-[#64748b] font-medium hidden sm:inline">
          {favorites.length} total saved items
        </span>
      </div>

      {/* Tab 1: Saved Products */}
      {activeTab === 'products' && (
        <div>
          {favoriteProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e2e8e5] p-12 sm:p-16 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-normal text-[#10231d]">
                No saved produce crops yet.
              </h3>
              <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
                Click the heart icon on any product in the harvest catalog to bookmark fresh heirloom crops for easy future pre-ordering.
              </p>
              <button
                onClick={onExploreProduce}
                className="px-5 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs border border-[#064e3b] transition-all"
              >
                Explore Fresh Produce
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map((fav) => {
                const prod = fav.product!;
                const isOutOfStock = prod.in_stock <= 0 || prod.status === 'out_of_stock';

                return (
                  <div
                    key={fav.id}
                    className="bg-white rounded-2xl border border-[#e2e8e5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail & Unfavorite Button */}
                      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveFavorite(fav.id)}
                          aria-label="Remove from favorites"
                          title="Remove from favorites"
                          className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-rose-600 shadow-sm transition-all cursor-pointer backdrop-blur-xs"
                        >
                          <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                        </button>

                        <div className="absolute bottom-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-[#064e3b]/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                            {prod.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#064e3b] font-semibold">
                              {prod.farmer_name || 'Verified Grower'}
                            </span>
                            <span className="text-[10px] text-[#64748b] font-medium">
                              {prod.stall_number || 'Stall A-14'}
                            </span>
                          </div>
                          <h3 className="text-base font-serif font-normal text-[#10231d] mt-1">
                            {prod.name}
                          </h3>
                        </div>

                        <div className="flex items-baseline justify-between pt-1 border-t border-[#e2e8e5]">
                          <div>
                            <span className="text-lg font-mono font-bold text-[#10231d]">
                              {formatCurrency(prod.price_per_unit)}
                            </span>
                            <span className="text-xs text-[#64748b] ml-1">/ {prod.unit}</span>
                          </div>

                          <ProductStockBadge inStock={prod.in_stock} isSoldOut={isOutOfStock} unit={prod.unit} />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onRemoveFavorite(fav.id)}
                        className="py-2.5 px-3 rounded-xl border border-[#e2e8e5] text-[#64748b] hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Unfavorite</span>
                      </button>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => onAddToCart(prod, 1)}
                        className="py-2.5 px-3 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 border border-[#064e3b]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Add Basket</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Farmer Stalls */}
      {activeTab === 'farmers' && (
        <div>
          {favoriteFarmers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e2e8e5] p-12 sm:p-16 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-normal text-[#10231d]">
                No saved farmer stalls yet.
              </h3>
              <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
                Save local farmers from the Mandi Map to stay connected with their daily fresh harvest.
              </p>
              <button
                onClick={onExploreMap}
                className="px-5 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs border border-[#064e3b] transition-all"
              >
                View Mandi &amp; Stalls Map
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favoriteFarmers.map((fav) => {
                const farm = fav.farmer!;
                return (
                  <div
                    key={fav.id}
                    className="bg-white rounded-2xl border border-[#e2e8e5] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] text-[10px] font-bold border border-emerald-200 mb-1.5">
                            <ShieldCheck className="w-3 h-3 text-[#10b981]" />
                            <span>{farm.farming_practices || 'Organic Certified'}</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-serif font-normal text-[#10231d]">
                            {farm.farm_name}
                          </h3>
                          <p className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#064e3b]" />
                            <span>{farm.stall_number || 'Stall A-14'} • {farm.market_name || 'Sabzi Mandi'}</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveFavorite(fav.id)}
                          aria-label="Remove from favorites"
                          title="Remove from favorites"
                          className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                        </button>
                      </div>

                      <p className="text-xs text-[#64748b] leading-relaxed line-clamp-2">
                        {farm.bio || 'Daily dawn harvest grower offering organic regional produce with direct stall inspection.'}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-[#64748b] pt-1 border-t border-[#e2e8e5]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Cutoff: {farm.cutoff_hours || 12}h prior</span>
                        </span>
                        <span>•</span>
                        <span>{farm.contact_phone || '+92 300 0000000'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => onRemoveFavorite(fav.id)}
                        className="py-2.5 px-3 rounded-xl border border-[#e2e8e5] text-[#64748b] hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Unfavorite</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onFilterByFarmer) {
                            onFilterByFarmer(farm.id);
                          } else {
                            onExploreProduce();
                          }
                        }}
                        className="py-2.5 px-4 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[#064e3b]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
                        <span>View Stall Crops</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
