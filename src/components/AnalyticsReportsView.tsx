import React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Package,
  Store,
  CheckCircle2,
  Clock,
  Sprout,
  Users,
  Download,
} from 'lucide-react';
import { Order, Product, Market } from '../types.ts';

interface AnalyticsReportsViewProps {
  orders: Order[];
  products: Product[];
  markets: Market[];
}

export const AnalyticsReportsView: React.FC<AnalyticsReportsViewProps> = ({
  orders,
  products,
  markets,
}) => {
  const formatOperatingDaysBadge = (rawDays?: string) => {
    if (!rawDays) return 'Everyday';
    const lower = rawDays.toLowerCase();
    if (
      lower.includes('daily') ||
      lower.includes('mon – sun') ||
      lower.includes('mon - sun') ||
      lower.includes('7 days') ||
      lower.includes('monday – sunday') ||
      lower.includes('everyday')
    ) {
      return 'Everyday';
    }
    if (lower.includes('tue') && lower.includes('sun')) {
      return 'Tuesday to Sunday';
    }
    if (lower.includes('mon') && lower.includes('fri')) {
      return 'Monday to Friday';
    }
    return rawDays;
  };
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.order_status === 'completed');
  const pendingOrders = orders.filter((o) => o.order_status === 'placed' || o.order_status === 'accepted');

  const totalCashProjected = orders.reduce((sum, o) => sum + (o.final_total_due ?? 0), 0);
  const totalCashCollected = completedOrders.reduce((sum, o) => sum + (o.final_total_due ?? 0), 0);
  const totalCashPending = totalCashProjected - totalCashCollected;

  const totalCropUnitsInStock = products.reduce((sum, p) => sum + (p.in_stock || 0), 0);

  const handleExportCSV = () => {
    const headers = ['Order Code', 'Customer', 'Status', 'Total Amount', 'Pickup Date', 'Mandi Hub'];
    const rows = orders.map((o) => [
      o.order_code,
      o.customer_name || 'Buyer',
      o.order_status,
      o.final_total_due || 0,
      o.pickup_date,
      o.market_name || 'Sabzi Mandi',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `marketlink_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#e2e8e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] font-semibold text-[10px] uppercase border border-emerald-200">
              Fulfillment & Market Metrics
            </span>
            <span className="text-xs text-[#64748b] font-medium">Real-Time Aggregates</span>
          </div>
          <h2 className="text-2xl font-serif font-normal text-[#10231d] tracking-tight">
            Market Activity & Analytics
          </h2>
          <p className="text-xs text-[#64748b] mt-1 max-w-xl font-normal">
            Live overview of physical stall reservations, customer pickup rates, cash collection compliance, and farm inventory volume.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>Export Reports to CSV</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 bg-[#ecfdf5] border border-emerald-200 rounded-xl text-xs font-semibold text-[#064e3b]">
            <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
            <span>Strictly Rs. 0 Online Fees • 100% Cash</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e2e8e5] shadow-xs">
          <div className="flex items-center justify-between text-[#64748b] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Total Pre-Orders</span>
            <div className="p-2 rounded-xl bg-[#ecfdf5] text-[#064e3b]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-[#10231d]">{totalOrders}</div>
          <p className="text-[11px] text-[#64748b] mt-1">
            {completedOrders.length} completed • {pendingOrders.length} pending pickup
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e8e5] shadow-xs">
          <div className="flex items-center justify-between text-[#64748b] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Cash at Stalls</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-[#064e3b]">
            Rs. {totalCashProjected.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#64748b] mt-1 font-medium">
            Rs. {totalCashCollected.toLocaleString()} collected • Rs. {totalCashPending.toLocaleString()} pending
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e8e5] shadow-xs">
          <div className="flex items-center justify-between text-[#64748b] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">In-Stock Crops</span>
            <div className="p-2 rounded-xl bg-[#ecfdf5] text-[#064e3b]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-[#10231d]">{totalCropUnitsInStock}</div>
          <p className="text-[11px] text-[#64748b] mt-1">
            Across {products.length} agricultural crop varieties
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e8e5] shadow-xs">
          <div className="flex items-center justify-between text-[#64748b] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Physical Markets</span>
            <div className="p-2 rounded-xl bg-[#eef2ec] text-[#064e3b]">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-[#10231d]">{markets.length}</div>
          <p className="text-[11px] text-[#64748b] mt-1">
            Active Mandi Markets
          </p>
        </div>
      </div>

      {/* Grid: Popular Produce & Mandi Markets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Fresh Crops Volume */}
        <div className="bg-white rounded-2xl border border-[#e2e8e5] shadow-xs p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8e5] mb-4">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#064e3b]" />
              <h3 className="font-serif font-normal text-base text-[#10231d]">Current Produce Stock Levels</h3>
            </div>
            <span className="text-[11px] text-[#64748b] font-medium">In-Stock Units</span>
          </div>

          <div className="space-y-3.5">
            {products.slice(0, 6).map((prod) => {
              const pct = Math.min(100, Math.round((prod.in_stock / (prod.stock_limit || 50)) * 100));

              return (
                <div key={prod.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#10231d] font-semibold">{prod.name}</span>
                    <span className="text-[#64748b] font-mono">
                      {prod.in_stock} {prod.unit}s (Rs. {prod.price_per_unit.toFixed(0)}/{prod.unit})
                    </span>
                  </div>
                  <div className="w-full bg-[#f8f7f2] border border-[#e2e8e5] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 40 ? 'bg-[#064e3b]' : pct > 15 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operating Mandi Markets */}
        <div className="bg-white rounded-2xl border border-[#e2e8e5] shadow-xs p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8e5] mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#064e3b]" />
              <h3 className="font-serif font-normal text-base text-[#10231d]">Registered Mandi Markets</h3>
            </div>
            <span className="text-[11px] text-[#64748b] font-medium">Status</span>
          </div>

          <div className="space-y-3">
            {markets.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <h4 className="font-semibold text-[#10231d] text-sm leading-snug">{m.name}</h4>
                  <p className="text-[#64748b] text-xs leading-relaxed">{m.location_address}</p>
                </div>
                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-[#ecfdf5] text-[#064e3b] font-semibold text-xs border border-emerald-200 shadow-2xs">
                    {formatOperatingDaysBadge(m.operating_days)}
                  </span>
                  <span className="text-xs text-[#64748b] font-mono">
                    {m.opening_time?.slice(0, 5)} - {m.closing_time?.slice(0, 5)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
