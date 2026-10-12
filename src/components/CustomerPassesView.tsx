import React from 'react';
import { Clock, Store, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { Order } from '../types.ts';
import { StatusBadge } from './common/index.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface CustomerPassesViewProps {
  orders: Order[];
  onOpenPassModal: (order: Order) => void;
  onExploreProduce: () => void;
}

export const CustomerPassesView: React.FC<CustomerPassesViewProps> = ({
  orders,
  onOpenPassModal,
  onExploreProduce,
}) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#e2e8e5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Pay Cash on Physical Collection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#10231d]">
            My Pickup Passes
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-2 max-w-xl font-normal leading-relaxed">
            Show your 4-digit PIN code to the farmer at the market stall to collect and inspect your produce before paying cash.
          </p>
        </div>

        <button
          onClick={onExploreProduce}
          className="px-4 py-2.5 rounded-xl bg-[#eef2ec] hover:bg-[#eae8df] text-[#064e3b] text-xs font-semibold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer border border-[#e2e8e5]"
        >
          <span>Find More Produce</span>
          <ArrowRight className="w-4 h-4 text-[#064e3b]" />
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8e5] p-12 sm:p-16 text-center space-y-4 shadow-xs">
            <Store className="w-12 h-12 text-[#64748b]/40 mx-auto" />
            <h3 className="text-lg font-serif font-normal text-[#10231d]">You have no active pickup passes yet.</h3>
            <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
              Choose fresh produce from local farmers and reserve your pickup window. Strictly Rs. 0 charge online!
            </p>
            <button
              onClick={onExploreProduce}
              className="px-5 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs border border-[#064e3b] transition-all"
            >
              Browse Fresh Produce
            </button>
          </div>
        ) : (
          orders.map((order) => {
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#e2e8e5] shadow-xs hover:border-[#064e3b]/30 transition-all p-6 sm:p-8 space-y-6"
              >
                {/* Top Pass Card: PIN, Stall Number, Cash to Pay */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[#e2e8e5]">
                  {/* Big PIN Highlight */}
                  <div className="bg-[#f8f7f2] border-2 border-dashed border-[#10b981]/50 rounded-xl p-4 sm:px-6 text-center sm:text-left flex items-center gap-4">
                    <div>
                      <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider block">
                        Your 4-Digit Pickup PIN
                      </span>
                      <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-[#064e3b]">
                        {order.pickup_pin}
                      </span>
                    </div>
                  </div>

                  {/* Stall Number & Cash Amount */}
                  <div className="space-y-2 text-left sm:text-right">
                    <div>
                      <span className="text-xs text-[#64748b] block">Stall Number</span>
                      <span className="text-base sm:text-lg font-serif font-normal text-[#10231d]">
                        {order.stall_number || 'Stall A-14'}
                      </span>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 text-amber-950 px-3.5 py-1.5 rounded-xl inline-block text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">
                        Pay Cash at Stall
                      </span>
                      <span className="text-lg font-mono font-bold text-[#10231d]">
                        {formatCurrency(order.final_total_due ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details: Market, Timing, Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#64748b]">
                  <div className="space-y-2">
                    <p className="font-semibold text-[#10231d] flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-[#064e3b]" />
                      <span>{order.farm_name} • {order.market_name}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[#64748b]">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span>Pickup Time: {order.pickup_date} ({order.pickup_timeslot})</span>
                    </p>
                  </div>

                  <div className="sm:text-right space-y-1.5">
                    <div>
                      <StatusBadge type="order" status={order.order_status} size="sm" />
                    </div>
                    <p className="text-[#64748b] text-xs">
                      Order Code: <span className="font-mono font-bold text-[#10231d]">{order.order_code}</span>
                    </p>
                  </div>
                </div>

                {/* Produce Items Summary */}
                <div className="bg-[#f8f7f2] rounded-xl p-4 sm:p-5 space-y-2 text-xs border border-[#e2e8e5]">
                  <span className="font-semibold text-[#10231d] block uppercase tracking-wider text-xs">
                    Reserved Farm Items:
                  </span>
                  <div className="space-y-2 pt-1">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-[#64748b]">
                        <span className="font-medium text-[#10231d]">
                          {item.reserved_qty ?? 1}x {item.product_name}
                        </span>
                        <span className="font-mono font-bold text-[#064e3b]">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => onOpenPassModal(order)}
                    className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 border border-[#064e3b]"
                  >
                    <Ticket className="w-3.5 h-3.5 text-emerald-300" />
                    <span>View Pickup Pass &amp; Code</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
