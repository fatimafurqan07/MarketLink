import React, { useState } from 'react';
import {
  Clock,
  Store,
  MapPin,
  ShieldCheck,
  Ticket,
  Edit3,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  X,
  Receipt,
} from 'lucide-react';
import { Order, OrderItem } from '../types.ts';
import { api } from '../services/api.ts';
import { LuxurySelect } from './common/LuxurySelect.tsx';
import { OrderStatusBadge } from './common/StatusBadge.tsx';
import { formatCurrency } from '../utils/formatters.ts';
import { OrderReceiptModal } from './common/OrderReceiptModal.tsx';

interface OrderHistoryViewProps {
  orders: Order[];
  onRefreshOrders: () => void;
  onOpenPassModal: (order: Order) => void;
  onExploreProduce: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  onRefreshOrders,
  onOpenPassModal,
  onExploreProduce,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Modifying Order State
  const [modifyingOrder, setModifyingOrder] = useState<Order | null>(null);
  const [modifiedDate, setModifiedDate] = useState<string>('');
  const [modifiedTimeslot, setModifiedTimeslot] = useState<string>('');
  const [modifiedItems, setModifiedItems] = useState<{ productId: string | number; productName: string; quantity: number; price: number; unit: string }[]>([]);
  const [isSubmittingModify, setIsSubmittingModify] = useState<boolean>(false);
  const [modifyError, setModifyError] = useState<string | null>(null);

  // Cancelling Order State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Receipt modal state
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null);

  const activeOrders = orders.filter((o) => ['placed', 'accepted', 'ready'].includes(o.order_status));
  const completedOrders = orders.filter((o) => o.order_status === 'completed');
  const cancelledOrders = orders.filter((o) => o.order_status === 'cancelled');

  const displayedOrders =
    filterTab === 'active'
      ? activeOrders
      : filterTab === 'completed'
      ? completedOrders
      : filterTab === 'cancelled'
      ? cancelledOrders
      : orders;

  const handleOpenModifyModal = (order: Order) => {
    setModifyingOrder(order);
    setModifiedDate(order.pickup_date);
    setModifiedTimeslot(order.pickup_timeslot);
    setModifiedItems(
      (order.items || []).map((it) => ({
        productId: it.product_id,
        productName: it.product_name,
        quantity: it.reserved_qty || 1,
        price: it.unit_price,
        unit: it.unit || 'kg',
      }))
    );
    setModifyError(null);
  };

  const handleItemQtyChange = (productId: string | number, delta: number) => {
    setModifiedItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string | number) => {
    if (modifiedItems.length <= 1) {
      setModifyError('An order must have at least one item. If you want to cancel the entire order, please use Cancel Order instead.');
      return;
    }
    setModifiedItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const handleSaveModification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyingOrder) return;
    if (modifiedItems.length === 0) {
      setModifyError('Order must contain at least one item.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (!modifiedDate || modifiedDate < today) {
      setModifyError(`Invalid pickup date: "${modifiedDate}" is in the past! Please select today (${today}) or an upcoming operating day.`);
      return;
    }

    setIsSubmittingModify(true);
    setModifyError(null);

    try {
      await api.modifyOrder(modifyingOrder.id, {
        pickupDate: modifiedDate,
        pickupTimeslot: modifiedTimeslot,
        items: modifiedItems.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
      });

      setFeedback({
        type: 'success',
        message: `Order #${modifyingOrder.order_code} was updated successfully!`,
      });
      setModifyingOrder(null);
      onRefreshOrders();
    } catch (err: unknown) {
      setModifyError(err instanceof Error ? err.message : 'Failed to update order.');
    } finally {
      setIsSubmittingModify(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsSubmittingCancel(true);
    setCancelError(null);

    try {
      await api.cancelOrder(cancellingOrder.id, cancelReason.trim() || undefined);
      setFeedback({
        type: 'success',
        message: `Order #${cancellingOrder.order_code} was cancelled. Reserved crops were released back to the stall.`,
      });
      setCancellingOrder(null);
      setCancelReason('');
      onRefreshOrders();
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel order.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const calculatedModifyTotal = modifiedItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e2e8e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Inspection &amp; Settlement Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#10231d]">
            Order History &amp; Modifications
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-2 max-w-xl font-normal leading-relaxed">
            Manage your daily harvest reservations. Modify items or pickup windows prior to stall preparation, or cancel reservations anytime before pickup ready.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExploreProduce}
            className="px-4 py-2.5 rounded-xl bg-[#eef2ec] hover:bg-[#eae8df] text-[#064e3b] text-xs font-semibold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer border border-[#e2e8e5]"
          >
            <span>Reserve More Crops</span>
            <ArrowRight className="w-4 h-4 text-[#064e3b]" />
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-[#ecfdf5] border border-emerald-200 text-[#064e3b]'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#064e3b] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2e8e5] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            filterTab === 'all'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:bg-[#eef2ec]'
          }`}
        >
          All Orders ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('active')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            filterTab === 'active'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:bg-[#eef2ec]'
          }`}
        >
          Active ({activeOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('completed')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            filterTab === 'completed'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:bg-[#eef2ec]'
          }`}
        >
          Completed ({completedOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('cancelled')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            filterTab === 'cancelled'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:bg-[#eef2ec]'
          }`}
        >
          Cancelled ({cancelledOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {displayedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8e5] p-12 sm:p-16 text-center space-y-4 shadow-xs">
            <Store className="w-12 h-12 text-[#64748b]/40 mx-auto" />
            <h3 className="text-lg font-serif font-normal text-[#10231d]">
              No orders found in this view.
            </h3>
            <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
              Explore today&apos;s daily harvest catalog to pre-order fresh organic produce with zero advance payment.
            </p>
            <button
              onClick={onExploreProduce}
              className="px-5 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs border border-[#064e3b] transition-all"
            >
              Browse Fresh Produce
            </button>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const isPlaced = order.order_status === 'placed';
            const isAccepted = order.order_status === 'accepted';
            const isReady = order.order_status === 'ready';
            const isCompleted = order.order_status === 'completed';
            const isCancelled = order.order_status === 'cancelled';

            const canModify = isPlaced;
            const canCancel = isPlaced || isAccepted;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#e2e8e5] shadow-xs hover:border-[#064e3b]/30 transition-all p-6 sm:p-8 space-y-6"
              >
                {/* Header: Order Code, PIN, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e2e8e5]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm sm:text-base font-bold text-[#10231d]">
                        {order.order_code}
                      </span>
                      <OrderStatusBadge status={order.order_status} />
                    </div>

                    <div className="text-xs text-[#64748b] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        Pickup: <strong>{order.pickup_date}</strong> ({order.pickup_timeslot})
                      </span>
                    </div>
                  </div>

                  {/* PIN & Total Cash */}
                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    <div className="bg-[#f8f7f2] border border-dashed border-[#10b981]/50 rounded-xl px-4 py-2 text-center">
                      <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                        Pickup PIN
                      </span>
                      <span className="text-xl font-mono font-bold text-[#064e3b] tracking-wider">
                        {order.pickup_pin}
                      </span>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-right">
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">
                        Cash Due at Stall
                      </span>
                      <span className="text-base font-bold text-[#10231d] font-mono">
                        {formatCurrency(order.final_total_due)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stall & Mandi Info */}
                <div className="text-xs text-[#64748b] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-medium text-[#10231d]">
                    <Store className="w-4 h-4 text-[#064e3b]" />
                    <span>
                      {order.farm_name} • <strong>{order.stall_number || 'Stall A-14'}</strong>
                    </span>
                    <span className="text-stone-400">({order.market_name})</span>
                  </div>

                  <span className="text-[11px] text-[#64748b]">
                    Payment: {order.payment_method} • Strictly Rs. 0 online
                  </span>
                </div>

                {/* Produce Items */}
                <div className="bg-[#f8f7f2] rounded-xl p-4 sm:p-5 border border-[#e2e8e5] space-y-2 text-xs">
                  <span className="font-semibold text-[#10231d] uppercase tracking-wider text-[11px] block">
                    Ordered Items:
                  </span>
                  <div className="space-y-2 pt-1 divide-y divide-[#e2e8e5]">
                    {order.items?.map((it) => (
                      <div key={it.id} className="flex justify-between items-center pt-2 text-[#64748b]">
                        <div>
                          <span className="font-medium text-[#10231d] block">
                            {it.reserved_qty}x {it.product_name}
                          </span>
                          <span className="text-[11px] text-[#64748b] font-mono">
                            Rs. {it.unit_price.toLocaleString()} / {it.unit}
                          </span>
                        </div>
                        <span className="font-bold font-mono text-[#064e3b]">
                          Rs. {it.subtotal.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancellation Note if cancelled */}
                {isCancelled && order.cancelled_reason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <strong>Cancellation Note:</strong> {order.cancelled_reason}
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onOpenPassModal(order)}
                      className="px-4 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 border border-[#064e3b]"
                    >
                      <Ticket className="w-3.5 h-3.5 text-emerald-300" />
                      <span>View Digital Pass</span>
                    </button>

                    {/* Download Receipt Button (if completed) */}
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => setReceiptModalOrder(order)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Download Receipt</span>
                      </button>
                    )}

                    {/* Share via WhatsApp Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const text = `🌱 *MarketLink (eGreen Basket) - Order Receipt*\nOrder Code: *${order.order_code}*\nStatus: *${order.order_status.toUpperCase()}*\nMandi: ${order.market_name} (${order.stall_number})\nPickup: ${order.pickup_date} (${order.pickup_timeslot})\nTotal Amount: *${formatCurrency(order.final_total_due ?? 0)}*\nNote: Zero advance fee, cash paid at stall.`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="text-sky-700 font-bold">💬</span>
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Modify Button (ONLY if placed) */}
                    {canModify && (
                      <button
                        type="button"
                        onClick={() => handleOpenModifyModal(order)}
                        className="px-4 py-2.5 rounded-xl border border-[#e2e8e5] hover:border-[#064e3b] bg-white hover:bg-[#eef2ec] text-[#10231d] text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#064e3b]" />
                        <span>Modify Order</span>
                      </button>
                    )}

                    {/* Cancel Button (ONLY if placed or accepted) */}
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancellingOrder(order);
                          setCancelReason('');
                          setCancelError(null);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-rose-200 hover:border-rose-400 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODIFY ORDER MODAL (Only for 'placed' status)                             */}
      {/* ========================================================================= */}
      {modifyingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#10231d]/60 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e2e8e5] overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-white p-5 sm:p-6 border-b border-[#e2e8e5] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#064e3b] tracking-wider block">
                  Modify Reservation
                </span>
                <h3 className="text-lg font-serif font-normal text-[#10231d]">
                  Order #{modifyingOrder.order_code}
                </h3>
              </div>

              <button
                onClick={() => setModifyingOrder(null)}
                aria-label="Close modify dialog"
                className="p-1.5 rounded-lg text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModification} className="p-6 space-y-5 bg-[#f8f7f2] overflow-y-auto flex-1">
              {modifyError && (
                <div className="p-3 bg-[#b3261e]/10 border border-[#b3261e]/30 text-[#b3261e] rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#b3261e] shrink-0" />
                  <span>{modifyError}</span>
                </div>
              )}

              {/* Timing Selection */}
              <div className="bg-white p-4 rounded-xl border border-[#e2e8e5] space-y-3 shadow-2xs">
                <span className="text-xs font-semibold text-[#10231d] uppercase tracking-wider block">
                  1. Adjust Pickup Window
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#64748b] block mb-1">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      required
                      value={modifiedDate}
                      onChange={(e) => setModifiedDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#e2e8e5] rounded-lg bg-white text-[#10231d] focus:outline-hidden focus:border-[#10b981]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#64748b] block mb-1">
                      Time Slot
                    </label>
                    <LuxurySelect<string>
                      value={modifiedTimeslot}
                      onChange={(val) => setModifiedTimeslot(val)}
                      size="sm"
                      options={[
                        { value: '08:00 AM - 09:30 AM', label: '08:00 AM - 09:30 AM', subLabel: 'Early Dawn' },
                        { value: '08:30 AM - 10:00 AM', label: '08:30 AM - 10:00 AM', subLabel: 'Peak Freshness' },
                        { value: '10:00 AM - 11:30 AM', label: '10:00 AM - 11:30 AM', subLabel: 'Mid-Morning' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Items Modification */}
              <div className="bg-white p-4 rounded-xl border border-[#e2e8e5] space-y-3 shadow-2xs">
                <span className="text-xs font-semibold text-[#10231d] uppercase tracking-wider block">
                  2. Adjust Item Quantities
                </span>

                <div className="space-y-2.5">
                  {modifiedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#f8f7f2] border border-[#e2e8e5] text-xs"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <span className="font-semibold text-[#10231d] block truncate">
                          {item.productName}
                        </span>
                        <span className="text-[11px] text-[#64748b] font-mono">
                          Rs. {item.price.toLocaleString()} / {item.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-[#e2e8e5] rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleItemQtyChange(item.productId, -1)}
                            className="px-2.5 py-1 text-[#10231d] hover:bg-[#eef2ec] cursor-pointer font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 font-bold font-mono text-[#10231d]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleItemQtyChange(item.productId, 1)}
                            className="px-2.5 py-1 text-[#10231d] hover:bg-[#eef2ec] cursor-pointer font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold font-mono text-[#10231d] min-w-14 text-right">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="p-1 text-[#64748b] hover:text-[#b3261e] transition-colors cursor-pointer"
                          title="Remove crop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#e2e8e5] flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#10231d]">New Total Due at Stall:</span>
                  <span className="font-bold text-base font-mono text-[#064e3b]">
                    Rs. {calculatedModifyTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModifyingOrder(null)}
                  className="px-4 py-2.5 rounded-lg border border-[#e2e8e5] text-[#10231d] text-xs font-semibold hover:bg-[#eef2ec] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingModify}
                  className="px-5 py-2.5 rounded-lg bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingModify ? 'Saving...' : 'Save Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CANCEL ORDER CONFIRMATION DIALOG (No window.confirm)                      */}
      {/* ========================================================================= */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10231d]/60 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#e2e8e5] space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-[#b3261e]/10 text-[#b3261e] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-serif font-normal text-[#10231d]">
                Cancel Order #{cancellingOrder.order_code}?
              </h3>
              <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                Cancelling will release your reserved items back into the farmer&apos;s stall stock. There is no cancellation fee.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 bg-[#b3261e]/10 border border-[#b3261e]/30 text-[#b3261e] rounded-xl text-xs">
                {cancelError}
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-[#64748b] block mb-1">
                Reason for Cancellation (Optional):
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule changed, will visit next week..."
                className="w-full px-3 py-2 text-xs border border-[#e2e8e5] rounded-lg bg-[#f8f7f2] focus:bg-white focus:outline-hidden focus:border-[#10b981] text-[#10231d]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2.5 rounded-lg border border-[#e2e8e5] text-[#10231d] text-xs font-semibold hover:bg-[#eef2ec] cursor-pointer"
              >
                Keep Reservation
              </button>

              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-lg bg-[#b3261e] hover:bg-[#8f1e17] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Receipt Modal */}
      {receiptModalOrder && (
        <OrderReceiptModal
          order={receiptModalOrder}
          onClose={() => setReceiptModalOrder(null)}
        />
      )}
    </div>
  );
};
