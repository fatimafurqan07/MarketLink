import React from 'react';
import { X, Printer, CheckCircle2, Download, Store, Sprout } from 'lucide-react';
import { Order } from '../../types.ts';
import { formatCurrency } from '../../utils/formatters.ts';

interface OrderReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose }) => {
  const handlePrintOrDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10231d]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#e2e8e5] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (Hidden on print) */}
        <div className="p-5 bg-[#064e3b] text-white flex items-center justify-between relative print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-normal">Mandi Official Receipt</h3>
              <p className="text-[10px] font-mono text-emerald-200">Order #{order.order_code || order.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#10231d] bg-white print:p-0">
          {/* Brand header */}
          <div className="text-center pb-6 border-b border-dashed border-[#cbd5e1] space-y-1">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#064e3b] text-white mb-1 shadow-xs">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <h2 className="font-serif text-2xl font-normal tracking-tight">Market<span className="text-[#064e3b] italic">Link</span></h2>
            <p className="text-xs text-[#64748b]">eGreen Basket • Direct Farm to Mandi Stalls</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Pickup &amp; Cash Paid</span>
            </div>
          </div>

          {/* Meta details */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#f8f7f2] p-4 rounded-2xl border border-[#e2e8e5]">
            <div>
              <span className="text-[#64748b] block text-[10px] uppercase font-bold">Pass Code</span>
              <span className="font-bold text-base text-[#064e3b]">{order.order_code}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px] uppercase font-bold">Date</span>
              <span className="font-medium text-[#10231d]">{new Date(order.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px] uppercase font-bold">Customer</span>
              <span className="font-medium text-[#10231d]">{order.customer_name || 'Valued Buyer'}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px] uppercase font-bold">Payment Method</span>
              <span className="font-semibold text-emerald-700">Cash on Pickup</span>
            </div>
          </div>

          {/* Location info */}
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-[#10231d] flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#064e3b]" />
              <span>{order.market_name || 'Sabzi Mandi Hub'}</span>
            </div>
            <p className="text-[#64748b] pl-5">{order.stall_number || 'Stall Bay A-14'}</p>
          </div>

          {/* Itemized table */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase font-bold text-[#64748b] border-b border-[#e2e8e5] pb-1.5">
              Itemized Harvest Summary
            </h4>
            <div className="divide-y divide-[#e2e8e5]">
              {(order.items || []).map((it, idx) => {
                const qty = (it as any).quantity ?? it.reserved_qty ?? 1;
                const price = (it as any).price_per_unit ?? it.unit_price ?? 0;
                return (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-[#10231d] block">{it.product_name}</span>
                      <span className="text-[#64748b] font-mono text-[11px]">{qty} {it.unit || 'kg'} × {formatCurrency(price)}</span>
                    </div>
                    <span className="font-mono font-bold text-[#10231d]">
                      {formatCurrency(it.subtotal || (qty * price))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t-2 border-[#10231d] flex items-center justify-between">
            <span className="font-serif text-lg font-bold text-[#10231d]">Total Cash Paid:</span>
            <span className="font-mono text-xl font-bold text-[#064e3b]">{formatCurrency(order.final_total_due ?? order.initial_total_due ?? (order as any).total_amount ?? 0)}</span>
          </div>

          {/* Footer note */}
          <div className="text-center text-[11px] text-[#64748b] pt-2">
            <p>Thank you for supporting local regional farmers through MarketLink.</p>
            <p className="font-mono mt-1">Seedha Kisan Se • Zero Advance Fees</p>
          </div>
        </div>

        {/* Actions Footer (Hidden on print) */}
        <div className="p-4 bg-[#f8f7f2] border-t border-[#e2e8e5] flex items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrintOrDownload}
            className="flex-1 py-3 px-4 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>Download / Print PDF Receipt</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-white hover:bg-[#eef2ec] border border-[#e2e8e5] text-[#10231d] text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
