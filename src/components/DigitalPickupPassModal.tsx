import React, { useState, useEffect } from 'react';
import {
  QrCode,
  X,
  Mail,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Navigation,
  Calendar,
  Layers,
  MapPin,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Order } from '../types.ts';
import { api } from '../services/api.ts';
import { cn } from '../utils/cn.ts';
import { formatCurrency } from '../utils/formatters.ts';

export interface DigitalPickupPassModalProps {
  order?: Order;
  orders?: Order[];
  allOrders?: Order[];
  onClose: () => void;
  onViewStallMap?: () => void;
}

export const DigitalPickupPassModal: React.FC<DigitalPickupPassModalProps> = ({
  order,
  orders,
  allOrders = [],
  onClose,
  onViewStallMap,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'pass' | 'thermal'>('pass');

  // Determine the primary order and list of orders
  const providedOrders = orders && orders.length > 0 ? orders : allOrders;
  const initialOrder = order || providedOrders[0];

  // Filter orders matching the same batch/date if multi-stall
  const activeOrders =
    providedOrders.length > 0
      ? providedOrders.filter(
          (o) =>
            o.pickup_date === initialOrder?.pickup_date &&
            o.pickup_timeslot === initialOrder?.pickup_timeslot &&
            o.order_status !== 'cancelled'
        )
      : (initialOrder ? [initialOrder] : []);

  const [activeStallIndex, setActiveStallIndex] = useState<number>(
    Math.max(0, activeOrders.findIndex((o) => o.id === initialOrder?.id))
  );

  const safeIndex = activeStallIndex < activeOrders.length ? activeStallIndex : 0;
  const currentOrder = activeOrders[safeIndex] || initialOrder;

  // Generate real QR code data URL using `qrcode` library
  useEffect(() => {
    const payload = JSON.stringify({
      orderId: currentOrder.id,
      code: currentOrder.order_code,
      pin: currentOrder.pickup_pin,
      date: currentOrder.pickup_date,
      time: currentOrder.pickup_timeslot,
      token: currentOrder.pickup_token,
    });

    QRCode.toDataURL(payload, {
      width: 240,
      margin: 2,
      color: {
        dark: '#10231d',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [currentOrder]);

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      await api.emailVoucher(currentOrder.id);
      setEmailStatus('Pickup voucher emailed successfully!');
      setTimeout(() => setEmailStatus(null), 4000);
    } catch {
      setEmailStatus('Could not send email. Please use print/screenshot.');
      setTimeout(() => setEmailStatus(null), 4000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#10231d]/60 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e2e8e5] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-white text-[#10231d] p-5 sm:p-6 border-b border-[#e2e8e5] relative text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] border border-emerald-200 text-xs font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            Official Stall Pickup Pass
          </div>

          <h2 className="text-lg sm:text-xl font-serif font-normal text-[#10231d]">
            Stall Pickup Pass &amp; PIN Code
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5 font-mono">
            Order: <strong className="text-[#10231d] font-sans">{currentOrder.order_code}</strong>
          </p>

          {/* Multi-Stall Tabs */}
          {activeOrders.length > 1 && (
            <div className="mt-3 pt-2.5 border-t border-[#e2e8e5]">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#64748b] mb-1.5 font-semibold flex items-center justify-center gap-1">
                <Layers className="w-3 h-3 text-[#f59e0b]" />
                <span>Multi-Stall Passes ({activeOrders.length})</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 justify-center">
                {activeOrders.map((ord, idx) => {
                  const isSelected = idx === safeIndex;
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => setActiveStallIndex(idx)}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        isSelected
                          ? 'bg-[#064e3b] text-white shadow-xs'
                          : 'bg-[#eef2ec] text-[#064e3b] hover:bg-[#eae8df]'
                      )}
                    >
                      <span>Pass 0{idx + 1}</span>
                      <span className="text-[10px] ml-1 opacity-80">
                        ({ord.stall_number || `#${ord.farmer_id}`})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="mt-3 flex items-center justify-center gap-1 bg-[#eef2ec] p-1 rounded-xl max-w-xs mx-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewTab('pass')}
              className={cn(
                'flex-1 py-1 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
                viewTab === 'pass' ? 'bg-[#064e3b] text-white shadow-xs' : 'text-[#064e3b] hover:bg-white/60'
              )}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Digital Pass</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab('thermal')}
              className={cn(
                'flex-1 py-1 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5',
                viewTab === 'thermal' ? 'bg-[#064e3b] text-white shadow-xs' : 'text-[#064e3b] hover:bg-white/60'
              )}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* Scrollable Pass Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#f8f7f2]">
          {viewTab === 'pass' ? (
            <>
              {emailStatus && (
                <div className="p-3 bg-[#ecfdf5] border border-emerald-200 rounded-xl text-xs text-[#064e3b] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#064e3b] shrink-0" />
                  <span>{emailStatus}</span>
                </div>
              )}

              {/* QR & 4-Digit PIN */}
              <div className="bg-white border-2 border-dashed border-[#e2e8e5] rounded-2xl p-4 text-center flex flex-col items-center justify-center shadow-xs">
                <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">
                  Present at Stall Counter
                </span>

                {/* QR Code */}
                <div className="p-2 bg-white rounded-xl border border-[#e2e8e5] shadow-xs">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Order QR Code"
                      className="w-32 h-32 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-[#f8f7f2] flex items-center justify-center rounded-lg text-[#64748b]">
                      <QrCode className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* PIN Display */}
                <div className="mt-3 bg-[#eef2ec] text-[#064e3b] px-5 py-2.5 rounded-xl shadow-xs w-full max-w-xs text-center border border-[#e2e8e5]">
                  <span className="text-[10px] uppercase font-semibold text-[#064e3b] block tracking-wider">
                    Express 4-Digit PIN
                  </span>
                  <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold font-mono tracking-widest text-[#064e3b] mt-0.5">
                    {currentOrder.pickup_pin.split('').map((char, i) => (
                      <span key={`pin-digit-${currentOrder.id}-${i}`} className="px-2 py-0.5 rounded-md bg-white border border-[#e2e8e5]">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wayfinding Info */}
              <div className="bg-white rounded-xl p-4 border border-[#e2e8e5] space-y-2 text-xs shadow-xs">
                <div className="flex items-start justify-between">
                  <span className="text-[#64748b] flex items-center gap-1.5 font-medium">
                    <Navigation className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
                    Stall Location:
                  </span>
                  <span className="font-semibold text-[#10231d] text-right">
                    {currentOrder.stall_number || 'Stall A-14'} • {currentOrder.farm_name || 'Farm'}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-[#64748b] flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
                    Pickup Window:
                  </span>
                  <span className="font-semibold text-[#10231d]">
                    {currentOrder.pickup_date} ({currentOrder.pickup_timeslot})
                  </span>
                </div>

                <div className="pt-2 border-t border-[#e2e8e5] flex items-start justify-between">
                  <span className="text-[#64748b] font-medium">Cash Due on Collection:</span>
                  <span className="font-mono text-base font-bold text-[#064e3b]">
                    {formatCurrency(currentOrder.final_total_due ?? 0)}
                  </span>
                </div>
              </div>

              {/* Reserved Items */}
              {currentOrder.items && currentOrder.items.length > 0 && (
                <div className="bg-white rounded-xl p-3.5 border border-[#e2e8e5] space-y-1.5 text-xs">
                  <span className="font-semibold text-[#64748b] uppercase tracking-wider block text-[10px]">
                    Reserved Items ({currentOrder.items.length}):
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {currentOrder.items.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-[#10231d]">
                        <span className="truncate max-w-[200px]">{it.product_name}</span>
                        <span className="font-mono font-semibold text-[#10231d]">
                          {it.reserved_qty} {it.unit} • {formatCurrency(it.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="py-2.5 px-3 rounded-lg border border-[#e2e8e5] bg-white hover:bg-[#eef2ec] text-[#10231d] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>{isSendingEmail ? 'Sending...' : 'Email Pass'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-lg border border-[#e2e8e5] bg-white hover:bg-[#eef2ec] text-[#10231d] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = `🌱 *MarketLink (eGreen Basket) - Pickup Pass*\nOrder Code: *${currentOrder.order_code}*\nStall PIN: *${currentOrder.pickup_pin}*\nMandi: ${currentOrder.market_name} (${currentOrder.stall_number})\nPickup: ${currentOrder.pickup_date} (${currentOrder.pickup_timeslot})\nTotal Cash Due: *${formatCurrency(currentOrder.final_total_due ?? 0)}*\nNote: Inspect quality at stall before paying cash. Zero advance fee!`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="col-span-2 py-2.5 px-3 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-emerald-700 font-bold">💬</span>
                  <span>Share via WhatsApp</span>
                </button>
              </div>

              {onViewStallMap && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewStallMap();
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#eef2ec] hover:bg-[#eae8df] text-[#064e3b] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#064e3b]" />
                  <span>Locate Stall on Map</span>
                </button>
              )}
            </>
          ) : (
            /* Printable Thermal Slip Layout */
            <div className="bg-white p-4 font-mono text-xs text-[#10231d] border border-[#e2e8e5] rounded-xl space-y-4">
              <div className="text-center pb-2 border-b border-dashed border-[#e2e8e5]">
                <div className="font-bold text-sm text-[#064e3b]">MARKETLINK PICKUP PASS</div>
                <div className="text-[10px] text-[#64748b]">Mandi Pickup Slip</div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>ORDER CODE:</span>
                  <strong>{currentOrder.order_code}</strong>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{currentOrder.pickup_date}</span>
                </div>
                <div className="flex justify-between">
                  <span>TIME SLOT:</span>
                  <span>{currentOrder.pickup_timeslot}</span>
                </div>
                <div className="flex justify-between">
                  <span>FARMER/STALL:</span>
                  <span>{currentOrder.stall_number || 'Stall A-14'} ({currentOrder.farm_name})</span>
                </div>
                <div className="flex justify-between">
                  <span>MARKET:</span>
                  <span>{currentOrder.market_name}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-[#e2e8e5] py-2 space-y-1">
                <div className="font-bold text-[10px] uppercase text-[#64748b] mb-1">
                  ITEMS ORDERED:
                </div>
                {currentOrder.items?.map((it) => (
                  <div key={it.id} className="flex justify-between text-[11px]">
                    <span>{it.reserved_qty}x {it.product_name}</span>
                    <span>{formatCurrency(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex justify-between font-bold text-sm">
                <span>TOTAL CASH DUE:</span>
                <span className="text-[#064e3b]">{formatCurrency(currentOrder.final_total_due ?? 0)}</span>
              </div>

              <div className="text-center pt-3 border-t border-[#e2e8e5]">
                <div className="text-2xl font-bold tracking-widest bg-[#f8f7f2] py-2 rounded-lg border border-[#e2e8e5] text-[#064e3b]">
                  PIN: {currentOrder.pickup_pin}
                </div>
                <p className="text-[10px] text-[#64748b] mt-2">
                  Inspect produce quality at stall before paying cash. Rs. 0 advance online fee.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Printer className="w-4 h-4" />
                <span>Print Physical Slip</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
