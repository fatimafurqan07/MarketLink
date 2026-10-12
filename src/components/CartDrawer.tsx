import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  X,
  CreditCard,
  Banknote,
  AlertCircle,
  Store,
} from 'lucide-react';
import { CartItem, Market, FarmerProfile, Order, User } from '../types.ts';
import { api } from '../services/api.ts';
import { LuxurySelect } from './common/LuxurySelect.tsx';
import { formatCurrency } from '../utils/formatters.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (productId: number, qty: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  markets: Market[];
  farmers: FarmerProfile[];
  onOrdersSuccess?: (orders: Order[]) => void;
  onOrderSuccess?: (order: Order) => void;
  currentUser?: User | null;
  onRequireLogin?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  markets,
  farmers,
  onOrdersSuccess,
  onOrderSuccess,
  currentUser,
  onRequireLogin,
}) => {
  if (!isOpen) return null;

  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => getTodayDateStr(), []);
  const [pickupDate, setPickupDate] = useState<string>(todayStr);
  const [dateError, setDateError] = useState<string | null>(null);
  const [pickupTimeslot, setPickupTimeslot] = useState<string>('08:30 AM - 10:00 AM');
  const [paymentMethod, setPaymentMethod] = useState<'Cash On Pickup' | 'Contactless Tap at Stall'>('Cash On Pickup');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getTomorrowsDateStr = (daysAhead: number = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (newDate: string) => {
    setPickupDate(newDate);
    if (!newDate || !newDate.trim()) {
      setDateError('Please enter a valid pickup date.');
    } else if (newDate < todayStr) {
      setDateError(`Invalid date: "${newDate}" is in the past! Stall orders cannot be placed for past dates. Please select today (${todayStr}) or an upcoming operating day.`);
    } else {
      setDateError(null);
      setErrorMessage(null);
    }
  };

  const handleSetQuickDate = (dateVal: string) => {
    setPickupDate(dateVal);
    setDateError(null);
    setErrorMessage(null);
  };

  const farmerGroups = useMemo(() => {
    const map = new Map<number, { farmer: FarmerProfile; market?: Market; items: CartItem[]; total: number }>();

    cart.forEach((item) => {
      const fId = item.product.farmer_id;
      if (!map.has(fId)) {
        const farmer = farmers.find((f) => f.id === fId);
        if (farmer) {
          const market = markets.find((m) => m.id === farmer.market_id);
          map.set(fId, { farmer, market, items: [], total: 0 });
        }
      }
      const entry = map.get(fId);
      if (entry) {
        entry.items.push(item);
        entry.total += item.product.price_per_unit * item.quantity;
      }
    });

    return Array.from(map.values());
  }, [cart, farmers, markets]);

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price_per_unit * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!currentUser) {
      setErrorMessage('Please sign in or register to place your order.');
      if (onRequireLogin) onRequireLogin();
      return;
    }

    if (!pickupDate) {
      setErrorMessage('Please select a valid pickup date.');
      setDateError('Pickup date is required.');
      return;
    }

    if (pickupDate < todayStr) {
      const msg = `Invalid pickup date: "${pickupDate}" is in the past! Stall orders cannot be reserved for past dates. Please select today (${todayStr}) or an upcoming operating day.`;
      setErrorMessage(msg);
      setDateError(msg);
      return;
    }

    if (farmerGroups.length === 0) {
      setErrorMessage('Could not determine farmer stalls for these items.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const createdOrders: Order[] = [];

      for (const group of farmerGroups) {
        const itemsPayload = group.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));

        const res = await api.reserveOrder({
          marketId: group.market?.id || group.farmer.market_id,
          farmerId: group.farmer.id,
          pickupDate: pickupDate,
          pickupTimeslot: pickupTimeslot,
          paymentMethod: paymentMethod,
          items: itemsPayload,
          notes: orderNotes.trim() || undefined,
        });

        createdOrders.push(res.order);
      }

      if (onOrdersSuccess) {
        onOrdersSuccess(createdOrders);
      } else if (onOrderSuccess && createdOrders.length > 0) {
        onOrderSuccess(createdOrders[0]);
      }

      onClearCart();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not confirm pre-order reservation.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#10231d]/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden relative border-l border-[#e2e8e5]">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#064e3b] flex items-center justify-between bg-[#064e3b] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#ecfdf5]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-normal text-white leading-tight">
                My Cart &amp; Booking
              </h2>
              <p className="text-[11px] text-emerald-100">
                Rs. 0 Online • Inspect &amp; Pay Cash at Stall
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close basket drawer"
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#f8f7f2]">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#b3261e] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#b3261e] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
                {!currentUser && (
                  <button
                    type="button"
                    onClick={() => onRequireLogin && onRequireLogin()}
                    className="block mt-1 font-semibold text-[#064e3b] underline cursor-pointer"
                  >
                    Click to Sign In / Create Account →
                  </button>
                )}
              </div>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8e5] p-8 space-y-2 shadow-xs">
              <ShoppingBag className="w-10 h-10 text-[#64748b]/40 mx-auto" />
              <p className="font-serif text-lg font-normal text-[#10231d]">Your harvest basket is empty</p>
              <p className="text-xs text-[#64748b] max-w-xs mx-auto">
                Explore the daily harvest catalog to reserve fresh crops for mandi stall pickup.
              </p>
            </div>
          ) : (
            <>
              {farmerGroups.length > 1 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Multi-Stall Reservation</strong>
                    <span className="text-[11px] text-amber-800 leading-snug">
                      Your items come from {farmerGroups.length} different grower stalls. Dedicated pickup passes with separate PINs will be issued for each stall.
                    </span>
                  </div>
                </div>
              )}

              {/* Grouped Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#64748b] font-medium px-1">
                  <span>Items in Basket ({cart.length})</span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[#64748b] hover:text-[#b3261e] transition-colors text-[11px] cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {farmerGroups.map((group) => (
                  <div key={group.farmer.id} className="space-y-2">
                    <div className="bg-white border border-[#e2e8e5] rounded-xl p-3 text-xs space-y-1 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#10231d] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#064e3b]" />
                          {group.farmer.farm_name} ({group.farmer.stall_number})
                        </span>
                        <span className="font-bold text-[#064e3b] font-mono">
                          {formatCurrency(group.total)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {group.items.map((item) => {
                        const unitName = item.product.unit || 'kg';
                        const quickPresets = [1, 2, 3, 5, 10];
                        const itemSubtotal = item.product.price_per_unit * item.quantity;

                        return (
                          <div
                            key={item.product.id}
                            className="p-4 bg-white rounded-2xl border border-[#e2e8e5] shadow-xs space-y-3 transition-all hover:border-[#064e3b]/30"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-16 h-16 rounded-xl object-cover border border-[#e2e8e5] shrink-0 bg-[#eef2ec]"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-semibold text-[#064e3b] flex items-center gap-1 font-mono uppercase tracking-wider">
                                  <Store className="w-3 h-3 text-[#064e3b] shrink-0" />
                                  <span className="truncate">{group.farmer.farm_name} • {group.farmer.stall_number}</span>
                                </div>
                                <h4 className="font-semibold text-[#10231d] text-sm mt-0.5 truncate">
                                  {item.product.name}
                                </h4>
                                {item.product.description && (
                                  <p className="text-[11px] text-[#64748b] line-clamp-2 mt-0.5 leading-relaxed font-normal">
                                    {item.product.description}
                                  </p>
                                )}
                                <div className="mt-1 text-xs font-mono text-[#64748b] flex items-center gap-1.5">
                                  <span>Unit Price:</span>
                                  <span className="font-bold text-[#10231d]">{formatCurrency(item.product.price_per_unit)}</span>
                                  <span>/{unitName}</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                                <div>
                                  <span className="text-[10px] text-[#64748b] font-mono block">Subtotal</span>
                                  <div className="font-bold text-[#064e3b] text-base font-mono">
                                    {formatCurrency(itemSubtotal)}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onRemoveItem(item.product.id)}
                                  className="text-[#b3261e] hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1 border border-rose-100"
                                  title="Remove from cart"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>

                            {/* Quantity Adjustment Bar */}
                            <div className="pt-2.5 border-t border-[#e2e8e5]/80 flex flex-wrap items-center justify-between gap-2">
                              {/* Quick Selective Quantity Buttons */}
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] text-[#64748b] font-mono uppercase font-semibold mr-0.5">
                                  Quick Qty:
                                </span>
                                {quickPresets.map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => onUpdateQty(item.product.id, preset)}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                                      item.quantity === preset
                                        ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-2xs'
                                        : 'bg-[#f8f7f2] hover:bg-[#eef2ec] text-[#10231d] border-[#e2e8e5]'
                                    }`}
                                  >
                                    {preset} {unitName}
                                  </button>
                                ))}
                              </div>

                              {/* Stepper with custom input */}
                              <div className="flex items-center border border-[#e2e8e5] rounded-lg bg-[#eef2ec] text-xs shrink-0 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQty(item.product.id, Math.max(1, item.quantity - 1))}
                                  disabled={item.quantity <= 1}
                                  className="px-2.5 py-1 text-[#64748b] hover:bg-[#e2e8df] hover:text-[#10231d] disabled:opacity-30 cursor-pointer font-bold transition-colors"
                                  title="Decrease quantity (-1)"
                                >
                                  -
                                </button>
                                <span className="w-9 text-center font-bold text-[#10231d] font-mono text-xs py-1 select-none">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                                  className="px-2.5 py-1 text-[#64748b] hover:bg-[#e2e8df] hover:text-[#10231d] cursor-pointer font-bold transition-colors"
                                  title="Increase quantity (+1)"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pickup Window Selection */}
              <div className="bg-white rounded-xl p-4 border border-[#e2e8e5] space-y-3 text-xs shadow-xs">
                <div className="flex items-center gap-2 text-[#10231d] font-semibold">
                  <Calendar className="w-4 h-4 text-[#064e3b]" />
                  <span>Stall Pickup Time Window</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider block">
                        Pickup Date
                      </label>
                      {pickupDate && (
                        <span className={`text-[10px] font-mono font-bold ${dateError ? 'text-[#b3261e]' : 'text-[#064e3b]'}`}>
                          {dateError ? 'INVALID' : 'VALID'}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg transition-colors focus:outline-hidden ${
                        dateError
                          ? 'bg-rose-50 border-2 border-rose-400 text-[#b3261e] ring-2 ring-rose-200'
                          : 'bg-[#f8f7f2] border border-[#e2e8e5] text-[#10231d] focus:border-[#064e3b]'
                      }`}
                    />

                    {/* Quick 1-Click Valid Date Options */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(todayStr)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer ${
                          pickupDate === todayStr && !dateError
                            ? 'bg-[#064e3b] text-white border-[#064e3b]'
                            : 'bg-[#eef2ec] hover:bg-[#e2e8df] text-[#10231d] border-[#e2e8e5]'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(getTomorrowsDateStr(1))}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer ${
                          pickupDate === getTomorrowsDateStr(1) && !dateError
                            ? 'bg-[#064e3b] text-white border-[#064e3b]'
                            : 'bg-[#eef2ec] hover:bg-[#e2e8df] text-[#10231d] border-[#e2e8e5]'
                        }`}
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(getTomorrowsDateStr(2))}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer ${
                          pickupDate === getTomorrowsDateStr(2) && !dateError
                            ? 'bg-[#064e3b] text-white border-[#064e3b]'
                            : 'bg-[#eef2ec] hover:bg-[#e2e8df] text-[#10231d] border-[#e2e8e5]'
                        }`}
                      >
                        +2 Days
                      </button>
                    </div>

                    {dateError && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-300 text-[11px] text-[#b3261e] font-semibold leading-tight flex items-start gap-1.5 animate-in fade-in">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#b3261e] shrink-0 mt-0.5" />
                        <span>{dateError}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                      Time Slot
                    </label>
                    <LuxurySelect<string>
                      value={pickupTimeslot}
                      onChange={(val) => setPickupTimeslot(val)}
                      size="sm"
                      options={[
                        { value: '08:00 AM - 09:30 AM', label: '08:00 AM - 09:30 AM', subLabel: 'Early Dawn' },
                        { value: '08:30 AM - 10:00 AM', label: '08:30 AM - 10:00 AM', subLabel: 'Peak Freshness' },
                        { value: '10:00 AM - 11:30 AM', label: '10:00 AM - 11:30 AM', subLabel: 'Mid-Morning' },
                      ]}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e2e8e5] flex items-center justify-between text-[11px] text-amber-800">
                  <div className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Harvest Cutoff: 12h Prior Buffer</span>
                  </div>
                  <span className="font-mono text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Active
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-4 border border-[#e2e8e5] space-y-2 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#10231d] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#064e3b]" />
                    <span>Payment at Stall</span>
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] border border-emerald-200">
                    Rs. 0 Online Today
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'Cash On Pickup'
                        ? 'border-[#064e3b] bg-[#ecfdf5] ring-1 ring-[#10b981]'
                        : 'border-[#e2e8e5] hover:bg-[#eef2ec]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash On Pickup"
                      checked={paymentMethod === 'Cash On Pickup'}
                      onChange={() => setPaymentMethod('Cash On Pickup')}
                      className="mt-0.5 text-[#064e3b]"
                    />
                    <div>
                      <div className="font-semibold text-[#10231d] flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5 text-[#064e3b]" />
                        <span>Cash at Stall</span>
                      </div>
                      <p className="text-[10px] text-[#64748b] mt-0.5">Exact cash on inspection</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'Contactless Tap at Stall'
                        ? 'border-[#064e3b] bg-[#ecfdf5] ring-1 ring-[#10b981]'
                        : 'border-[#e2e8e5] hover:bg-[#eef2ec]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Contactless Tap at Stall"
                      checked={paymentMethod === 'Contactless Tap at Stall'}
                      onChange={() => setPaymentMethod('Contactless Tap at Stall')}
                      className="mt-0.5 text-[#064e3b]"
                    />
                    <div>
                      <div className="font-semibold text-[#10231d] flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-[#064e3b]" />
                        <span>Card at Stall</span>
                      </div>
                      <p className="text-[10px] text-[#64748b] mt-0.5">POS terminal at booth</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                  Stall Quality Note (Optional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g., please pack slightly firm tomatoes"
                  className="w-full px-3 py-2 text-xs border border-[#e2e8e5] rounded-lg bg-white text-[#10231d] focus:outline-hidden focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981]"
                />
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#e2e8e5] bg-white space-y-3 shrink-0">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#64748b]">
                <span>Produce Total:</span>
                <span className="font-semibold text-[#10231d]">Rs. {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#064e3b] font-semibold">
                <span>Online Charge Today:</span>
                <span>Rs. 0 (Free Pre-Order)</span>
              </div>
              <div className="pt-2 border-t border-[#e2e8e5] flex justify-between text-[#10231d] font-semibold text-sm">
                <span>Total Due at Stall:</span>
                <span className="text-[#064e3b] font-mono text-base font-bold">
                  Rs. {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {dateError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-[#b3261e] font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#b3261e] shrink-0" />
                <span>{dateError}</span>
              </div>
            )}

            {errorMessage && !dateError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isSubmitting || Boolean(dateError) || !pickupDate}
              className="w-full py-3 px-4 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Booking Order...'
              ) : dateError ? (
                'Please Select Valid Pickup Date'
              ) : (
                <>
                  <span>Order Confirm Karein (Rs. 0 Advance)</span>
                  <ArrowRight className="w-4 h-4 text-[#ecfdf5]" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
