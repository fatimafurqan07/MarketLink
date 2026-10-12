import React, { useState } from 'react';
import {
  Sprout,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  User as UserIcon,
  Phone,
  Store,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { User, FarmerProfile, Market } from '../types.ts';
import { LuxurySelect, LuxurySelectOption } from './common/LuxurySelect.tsx';
import { LocationDiscoverySelector } from './LocationDiscoverySelector.tsx';
import { matchOrFindNearestMarkets } from '../data/pakistanLocations.ts';
import { LeafletMapView } from './common/LeafletMapView.tsx';

interface LoginPageProps {
  onLoginSuccess: (user: User, farmerProfile?: FarmerProfile) => void;
  onClose?: () => void;
  markets?: Market[];
  initialTab?: AuthTab;
}

type AuthTab = 'signin' | 'customer_register' | 'farmer_register';

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onClose,
  markets = [],
  initialTab = 'signin',
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Customer / Vendor Register State
  const [custName, setCustName] = useState<string>('');
  const [custEmail, setCustEmail] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custOrgType, setCustOrgType] = useState<'household' | 'commercial_vendor'>('household');
  const [custPassword, setCustPassword] = useState<string>('');
  const [showCustPassword, setShowCustPassword] = useState<boolean>(false);

  // Farmer Register State
  const [farmerStep, setFarmerStep] = useState<1 | 2>(1);
  const [showMapPreview, setShowMapPreview] = useState<boolean>(false);
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmName, setFarmName] = useState<string>('');
  const [farmerCnic, setFarmerCnic] = useState<string>('');
  const [farmerEmail, setFarmerEmail] = useState<string>('');
  const [farmerPhone, setFarmerPhone] = useState<string>('');
  const [farmerPassword, setFarmerPassword] = useState<string>('');
  const [showFarmerPassword, setShowFarmerPassword] = useState<boolean>(false);
  const [selectedMarketId, setSelectedMarketId] = useState<number>(markets[0]?.id || 1);
  const [farmingPractices, setFarmingPractices] = useState<
    'Organic Certified' | 'Transitional Organic' | 'Conventional Eco-Safe'
  >('Organic Certified');
  const [cutoffHours, setCutoffHours] = useState<number>(12);
  const [farmerBio, setFarmerBio] = useState<string>('');

  // Location Discovery State (Cascading Country -> Province -> City)
  const [farmerCountry, setFarmerCountry] = useState<string>('Pakistan');
  const [farmerProvince, setFarmerProvince] = useState<string>('Sindh');
  const [farmerCity, setFarmerCity] = useState<string>('Karachi');

  // Status State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtered/Nearest Markets based on location selection
  const marketMatchResult = React.useMemo(() => {
    return matchOrFindNearestMarkets(markets, farmerProvince, farmerCity);
  }, [markets, farmerProvince, farmerCity]);

  // Sync selectedMarketId when matching markets change
  React.useEffect(() => {
    if (marketMatchResult.markets.length > 0) {
      const isCurrentInList = marketMatchResult.markets.some(
        (m) => m.id.toString() === selectedMarketId.toString()
      );
      if (!isCurrentInList) {
        setSelectedMarketId(Number(marketMatchResult.markets[0].id));
      }
    }
  }, [marketMatchResult.markets, selectedMarketId]);

  const filteredMarketSelectOptions: LuxurySelectOption<number>[] =
    marketMatchResult.markets.length > 0
      ? marketMatchResult.markets.map((m) => ({
          value: Number(m.id),
          label: m.name,
          subLabel: m.location_address,
          badge: m.distanceKm !== undefined ? `${m.distanceKm} km away` : `${m.city || 'Mandi'}`,
          icon: Store,
        }))
      : markets.map((m) => ({
          value: Number(m.id),
          label: m.name,
          subLabel: m.location_address,
          badge: `${m.operating_days}`,
          icon: Store,
        }));

  const selectedMarketPreview =
    markets.find((m) => m.id.toString() === selectedMarketId.toString()) ||
    marketMatchResult.markets[0] ||
    markets[0];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.login(loginEmail.trim(), loginPassword.trim());
      onLoginSuccess(res.user, res.farmerProfile);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Invalid credentials. Please verify email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custEmail.trim() || !custPassword.trim()) {
      setErrorMessage('Please fill in your name, email, and password.');
      return;
    }

    if (custPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.registerVendor({
        name: custName.trim(),
        email: custEmail.trim(),
        password: custPassword.trim(),
        phone: custPhone.trim() || undefined,
        organization_type: custOrgType,
      });

      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not complete registration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim() || !farmName.trim() || !farmerEmail.trim() || !farmerPassword.trim()) {
      setErrorMessage('Please fill in grower name, farm name, email, and password.');
      return;
    }

    if (farmerPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!farmerCountry || !farmerProvince || !farmerCity) {
      setErrorMessage('Please select your Country, Province, and City to assign your Mandi stall.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.registerFarmer({
        name: farmerName.trim(),
        farm_name: farmName.trim(),
        cnic_id: farmerCnic.trim() || undefined,
        email: farmerEmail.trim(),
        phone: farmerPhone.trim() || undefined,
        password: farmerPassword.trim(),
        country: farmerCountry.trim() || 'Pakistan',
        province: farmerProvince.trim() || undefined,
        city: farmerCity.trim() || undefined,
        market_id: selectedMarketId,
        farming_practices: farmingPractices,
        cutoff_hours: cutoffHours,
        bio: farmerBio.trim() || undefined,
      });

      setSuccessMessage(`Stall registered successfully at ${res.farmerProfile.stall_number}!`);
      setTimeout(() => {
        onLoginSuccess(res.user, res.farmerProfile);
      }, 600);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not complete stall registration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isModal = Boolean(onClose);

  return (
    <div
      className={`w-full flex flex-col lg:flex-row bg-[#f8f7f2] text-[#10231d] ${
        isModal ? 'max-h-[92vh] overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Left Column: Forest Brand Showcase */}
      <div className="relative w-full lg:w-[42%] bg-gradient-to-br from-[#064e3b] via-[#043d2e] to-[#022c22] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-900 shrink-0 overflow-hidden">
        {/* Ambient floating glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="bg-white/10 border border-white/20 text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform backdrop-blur-md">
              <Sprout className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <span className="font-serif text-2xl text-white tracking-tight">
              Market<span className="text-emerald-300 italic">Link</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#ecfdf5] text-xs font-medium mb-4 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Seedha Kisan Se (Direct from Farmer)</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-tight leading-snug">
            Fresh Produce Direct to Your Mandi Stall.
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
            Whether ordering fresh produce as a customer or managing stall stock as a farmer—enjoy zero advance online fees and cash payment on pickup.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-emerald-100 p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Rs. 0 Advance Fee — Inspect before paying cash</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-emerald-100 p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Direct stall assignment &amp; wayfinding</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-emerald-100 p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dawn harvest locking buffers</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 mt-6 border-t border-white/15 text-[11px] text-emerald-200/80 font-mono flex items-center justify-between">
          <span>Karachi • Lahore • Islamabad</span>
          <span className="text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>100% Cash at Stall</span>
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Form (Single Clean Scroll Container) */}
      <div className="flex-1 flex flex-col justify-start p-4 sm:p-7 lg:p-9 bg-[#f8f7f2] relative overflow-y-auto scrollbar-thin">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-lg text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] transition-all cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className={`w-full ${activeTab === 'farmer_register' ? 'max-w-xl' : 'max-w-md'} mx-auto transition-all duration-300 py-1`}>
          {/* Tabs */}
          <div className="p-1 rounded-xl bg-white border border-[#e2e8e5] shadow-xs mb-6 grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#10231d]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('customer_register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'customer_register'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#10231d]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buyer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('farmer_register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'farmer_register'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#10231d]'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Farmer</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#e2e8e5] shadow-xs space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-[#b3261e] flex flex-col gap-1.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#b3261e] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
                {(errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('already registered')) && (
                  <button
                    type="button"
                    onClick={() => {
                      const emailToFill = custEmail || farmerEmail;
                      if (emailToFill) setLoginEmail(emailToFill);
                      setActiveTab('signin');
                      setErrorMessage(null);
                    }}
                    className="self-start text-[11px] font-bold text-[#064e3b] underline hover:text-[#043d2e] cursor-pointer pl-6"
                  >
                    Click here to Sign In with this email →
                  </button>
                )}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-[#ecfdf5] border border-emerald-200 rounded-lg text-xs text-[#064e3b] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#064e3b] shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === 'signin' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. zavimalik23@gmail.com"
                      autoComplete="username"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#10231d] cursor-pointer"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#064e3b] to-[#043d2e] hover:from-[#043d2e] hover:to-[#022c22] text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 relative overflow-hidden group/sub"
                >
                  <span className="relative z-10">{isLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4 text-[#ecfdf5] relative z-10 group-hover/sub:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/sub:opacity-100 transition-opacity" />
                </button>
              </form>
            )}

            {/* TAB 2: BUYER REGISTER */}
            {activeTab === 'customer_register' && (
              <form onSubmit={handleCustomerRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Asad Khan"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      placeholder="asad@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showCustPassword ? 'text' : 'password'}
                        required
                        value={custPassword}
                        onChange={(e) => setCustPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustPassword(!showCustPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#10231d] cursor-pointer"
                        title={showCustPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCustPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Register Buyer Account'}
                  <ArrowRight className="w-4 h-4 text-[#ecfdf5]" />
                </button>
              </form>
            )}

            {/* TAB 3: FARMER REGISTER (Sleek 2-Step Responsive Flow & Zero Double-Scroll) */}
            {activeTab === 'farmer_register' && (
              <form onSubmit={handleFarmerRegister} className="space-y-4">
                {/* 2-Step Progress Stepper Indicator */}
                <div className="flex items-center justify-between p-1.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setFarmerStep(1);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      farmerStep === 1
                        ? 'bg-[#064e3b] text-white shadow-xs'
                        : 'text-[#64748b] hover:text-[#10231d]'
                    }`}
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>1. Farm Identity</span>
                  </button>

                  <div className="w-4 h-0.5 bg-[#e2e8e5] mx-1 shrink-0" />

                  <button
                    type="button"
                    onClick={() => {
                      if (!farmerName.trim() || !farmName.trim()) {
                        setErrorMessage('Please enter your Grower Name and Farm Name first.');
                        return;
                      }
                      setErrorMessage(null);
                      setFarmerStep(2);
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      farmerStep === 2
                        ? 'bg-[#064e3b] text-white shadow-xs'
                        : 'text-[#64748b] hover:text-[#10231d]'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>2. Mandi &amp; Login</span>
                  </button>
                </div>

                {/* STEP 1: Farm & Personal Identity */}
                {farmerStep === 1 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                          Grower Full Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={farmerName}
                            onChange={(e) => setFarmerName(e.target.value)}
                            placeholder="e.g. Tariq Mehmood"
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                          Farm / Orchard Name *
                        </label>
                        <div className="relative">
                          <Store className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={farmName}
                            onChange={(e) => setFarmName(e.target.value)}
                            placeholder="e.g. Sindh Agro Orchards"
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                          CNIC / National ID
                        </label>
                        <div className="relative">
                          <ShieldCheck className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={farmerCnic}
                            onChange={(e) => setFarmerCnic(e.target.value)}
                            placeholder="42101-1234567-1"
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                          Contact Phone
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="tel"
                            value={farmerPhone}
                            onChange={(e) => setFarmerPhone(e.target.value)}
                            placeholder="0321-2345678"
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                        Farming Practices
                      </label>
                      <select
                        value={farmingPractices}
                        onChange={(e) => setFarmingPractices(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                      >
                        <option value="Organic Certified">Organic Certified (100% Pesticide-Free)</option>
                        <option value="Transitional Organic">Transitional Organic</option>
                        <option value="Conventional Eco-Safe">Conventional Eco-Safe</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!farmerName.trim() || !farmName.trim()) {
                          setErrorMessage('Please enter both Grower Name and Farm Name to proceed.');
                          return;
                        }
                        setErrorMessage(null);
                        setFarmerStep(2);
                      }}
                      className="w-full py-2.5 px-4 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <span>Proceed to Mandi Allocation &amp; Security</span>
                      <ArrowRight className="w-4 h-4 text-[#ecfdf5]" />
                    </button>
                  </div>
                )}

                {/* STEP 2: Mandi Location & Credentials */}
                {farmerStep === 2 && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    {/* Location Discovery */}
                    <div className="p-3 bg-[#f8f7f2] border border-[#e2e8e5] rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#064e3b] flex items-center gap-1.5 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-[#064e3b]" />
                          <span>Mandi Facility Assignment</span>
                        </span>
                        <span className="text-[10px] text-[#64748b]">Step 2 of 2</span>
                      </div>

                      <LocationDiscoverySelector
                        country={farmerCountry}
                        onCountryChange={setFarmerCountry}
                        province={farmerProvince}
                        onProvinceChange={setFarmerProvince}
                        city={farmerCity}
                        onCityChange={setFarmerCity}
                        size="sm"
                      />

                      <div>
                        <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748b] mb-1">
                          Assigned Mandi Pavilion:
                        </label>
                        <LuxurySelect<number>
                          value={selectedMarketId}
                          onChange={(val) => setSelectedMarketId(val)}
                          options={filteredMarketSelectOptions}
                          size="sm"
                        />
                      </div>

                      {/* Map Toggle Button */}
                      {selectedMarketPreview && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowMapPreview(!showMapPreview)}
                            className="text-[11px] text-[#064e3b] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{showMapPreview ? 'Hide Map Preview' : 'Show Mandi Map Preview'}</span>
                          </button>

                          {showMapPreview && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-[#e2e8e5] bg-white shadow-2xs h-28 relative">
                              <LeafletMapView
                                markets={
                                  marketMatchResult.markets.length > 0
                                    ? (marketMatchResult.markets as Market[])
                                    : markets
                                }
                                selectedMarketId={selectedMarketId}
                                onSelectMarket={(newId) => setSelectedMarketId(Number(newId))}
                                height="112px"
                                zoom={13}
                                showStallPins={false}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Login & Security */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                          Account Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={farmerEmail}
                            onChange={(e) => setFarmerEmail(e.target.value)}
                            placeholder="tariq@farm.pk"
                            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                          Password (Min 6 chars) *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showFarmerPassword ? 'text' : 'password'}
                            required
                            value={farmerPassword}
                            onChange={(e) => setFarmerPassword(e.target.value)}
                            placeholder="Create secure password"
                            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-lg text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setShowFarmerPassword(!showFarmerPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#10231d] cursor-pointer"
                            title={showFarmerPassword ? 'Hide password' : 'Show password'}
                          >
                            {showFarmerPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setFarmerStep(1);
                        }}
                        className="py-2.5 px-4 bg-white border border-[#e2e8e5] hover:bg-[#eef2ec] text-[#10231d] rounded-lg font-semibold text-xs transition-all cursor-pointer"
                      >
                        ← Back
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2.5 px-4 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                      >
                        {isLoading ? 'Allocating Stall Bay...' : 'Confirm & Register Farmer Stall'}
                        <ArrowRight className="w-4 h-4 text-[#ecfdf5]" />
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
