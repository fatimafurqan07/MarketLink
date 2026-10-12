import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { Market, FarmerProfile } from '../types.ts';
import { MarketMap } from './MarketMap.tsx';

interface ContactViewProps {
  markets: Market[];
  farmers: FarmerProfile[];
  onSelectFarmer?: (farmerId: number | string) => void;
  onFilterMarket?: (marketId: number | string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  markets,
  farmers,
  onSelectFarmer,
  onFilterMarket,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Question',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Question', message: '' });
      setTimeout(() => setIsSubmitted(false), 6000);
    }, 600);
  };

  return (
    <div className="w-full space-y-10 py-6 sm:py-10 animate-in fade-in duration-200">
      {/* Header Banner */}
      <section className="rounded-2xl bg-white border border-[#e2e8e5] p-8 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] text-xs font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>MarketLink Support &amp; Help Desk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#10231d]">
            Get in Touch with MarketLink
          </h1>

          <p className="text-sm sm:text-base text-[#64748b] leading-relaxed">
            Have questions about stall registration, pickup codes, or daily mandi rates? Our team is here to help you.
          </p>
        </div>
      </section>

      {/* Grid: Contact Details + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Contact Info & Hub Locations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e2e8e5] shadow-xs space-y-6">
            <h2 className="text-lg font-serif font-normal text-[#10231d] border-b border-[#e2e8e5] pb-3">
              Contact Information
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#064e3b]" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider font-mono">
                    Email Support
                  </span>
                  <a
                    href="mailto:support@marketlink.pk"
                    className="font-semibold text-[#10231d] hover:text-[#064e3b] transition-colors"
                  >
                    support@marketlink.pk
                  </a>
                  <span className="block text-xs text-[#64748b]">Quick reply within 2 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#064e3b]" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider font-mono">
                    Helpline &amp; Support Call
                  </span>
                  <a
                    href="tel:+92518443200"
                    className="font-semibold text-[#10231d] hover:text-[#064e3b] transition-colors font-mono"
                  >
                    +92 (51) 844-3200
                  </a>
                  <span className="block text-xs text-[#64748b]">Available 04:30 AM – 06:00 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#064e3b]" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider font-mono">
                    Main Office Address
                  </span>
                  <p className="font-medium text-[#10231d] leading-snug">
                    Sabzi Mandi Sector I-11/4, Islamabad, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#064e3b]" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider font-mono">
                    Mandi Stall Timings
                  </span>
                  <p className="font-medium text-[#10231d]">
                    Daily Early Morning: 04:30 AM – 01:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#064e3b] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Farmer Stall Registration</span>
            </h3>
            <p className="text-xs text-[#10231d]/80 leading-relaxed">
              Farmers who want to set up a stall in the mandi can register online or visit our help counter at the mandi with their CNIC daily before 07:00 AM.
            </p>
          </div>
        </div>

        {/* Right: Interactive Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e2e8e5] shadow-xs space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-normal text-[#10231d]">
                Send Us a Message
              </h2>
              <p className="text-xs text-[#64748b] mt-1">
                Fill in your details below and our team will get back to you promptly.
              </p>
            </div>

            {isSubmitted && (
              <div className="p-4 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-[#064e3b] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-[#064e3b]">Message Sent Successfully!</p>
                  <p className="text-[#064e3b]/80 mt-0.5">
                    Thank you. Our support team will reply to you shortly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#10231d] mb-1.5">
                    Your Name <span className="text-[#b3261e]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Qureshi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-lg border border-[#e2e8e5] bg-[#f8f7f2] text-xs text-[#10231d] focus:outline-hidden focus:border-[#10b981] focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#10231d] mb-1.5">
                    Email Address <span className="text-[#b3261e]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-lg border border-[#e2e8e5] bg-[#f8f7f2] text-xs text-[#10231d] focus:outline-hidden focus:border-[#10b981] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#10231d] mb-1.5">
                  Subject / Topic
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-lg border border-[#e2e8e5] bg-[#f8f7f2] text-xs text-[#10231d] focus:outline-hidden focus:border-[#10b981] focus:bg-white transition-all shadow-2xs"
                >
                  <option value="General Question">General Mandi Question</option>
                  <option value="Farmer Stall Registration">Farmer Stall Registration (Kisan)</option>
                  <option value="Produce Quality & Pickup Inspection">Quality &amp; Pickup Help</option>
                  <option value="Wholesale Batch Bulk Orders">Bulk / Wholesale Orders</option>
                  <option value="Technical & Platform Feedback">App Help &amp; Suggestions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#10231d] mb-1.5">
                  Message <span className="text-[#b3261e]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help you? You can write in English or Roman Urdu..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3.5 rounded-lg border border-[#e2e8e5] bg-[#f8f7f2] text-xs text-[#10231d] focus:outline-hidden focus:border-[#10b981] focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-emerald-300" />
                    <span>Send Message to Support</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Embedded Mandi Location Map */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8e5] pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#10231d]">
              Active Mandi Locations &amp; Maps
            </h2>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1">
              Find Mandi locations and farmer stalls in Islamabad, Karachi, and Lahore.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-medium text-[#064e3b]">
              Live Stalls Active
            </span>
          </div>
        </div>

        <div className="w-full pt-2">
          <MarketMap
            markets={markets}
            farmers={farmers}
            onSelectFarmer={onSelectFarmer || (() => {})}
            onFilterMarket={onFilterMarket || (() => {})}
          />
        </div>
      </section>
    </div>
  );
};
