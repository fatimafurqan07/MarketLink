import React, { useState, useEffect } from 'react';
import { Globe, MapPin, AlertTriangle, CheckCircle2, ArrowRight, X, Sparkles, Store } from 'lucide-react';
import { COUNTRIES_CONFIG } from '../../data/countryConfig.ts';
import { useCountry } from '../../i18n/CountryContext.tsx';
import { useLanguage } from '../../i18n/LanguageContext.tsx';

const KNOWN_ACTIVE_CITIES: Record<string, { province: string; label: string; stalls: string }> = {
  Karachi: { province: 'Sindh', label: 'Karachi (Sindh)', stalls: '4 Mandi Markets • 104 Stalls' },
  Hyderabad: { province: 'Sindh', label: 'Hyderabad (Sindh)', stalls: 'Hala Naka Mandi • 32 Stalls' },
  Lahore: { province: 'Punjab', label: 'Lahore (Punjab)', stalls: 'Badami Bagh Mandi • 36 Stalls' },
  Islamabad: { province: 'Islamabad Capital Territory', label: 'Islamabad (ICT)', stalls: 'Sector I-11/4 Mandi • 24 Stalls' },
};

export const CountryWelcomeModal: React.FC = () => {
  const { countryCode, province: currentProvince, city: currentCity, setCountrySelection, isWelcomeModalOpen, closeWelcomeModal, checkLocationAvailability } = useCountry();
  const { t } = useLanguage();

  const [selectedCountry, setSelectedCountry] = useState<string>(countryCode || 'PK');
  const activeConfig = COUNTRIES_CONFIG[selectedCountry] || COUNTRIES_CONFIG.PK;

  const provincesList = Object.keys(activeConfig.regions);
  const [selectedProvince, setSelectedProvince] = useState<string>(
    currentProvince && provincesList.includes(currentProvince) ? currentProvince : (activeConfig.defaultProvince || provincesList[0])
  );

  const citiesList = activeConfig.regions[selectedProvince] || activeConfig.regions[provincesList[0]] || [];
  const [selectedCity, setSelectedCity] = useState<string>(
    currentCity && citiesList.some((c) => c.name === currentCity) ? currentCity : (citiesList[0]?.name || activeConfig.defaultCity)
  );

  // Sync state when modal opens
  useEffect(() => {
    if (isWelcomeModalOpen) {
      const initialCountry = countryCode || 'PK';
      setSelectedCountry(initialCountry);
      const cfg = COUNTRIES_CONFIG[initialCountry] || COUNTRIES_CONFIG.PK;
      const provs = Object.keys(cfg.regions);
      const prov = currentProvince && provs.includes(currentProvince) ? currentProvince : (cfg.defaultProvince || provs[0]);
      setSelectedProvince(prov);
      const cities = cfg.regions[prov] || [];
      const cty = currentCity && cities.some((c) => c.name === currentCity) ? currentCity : (cities[0]?.name || cfg.defaultCity);
      setSelectedCity(cty);
    }
  }, [isWelcomeModalOpen, countryCode, currentProvince, currentCity]);

  if (!isWelcomeModalOpen) return null;

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    const cfg = COUNTRIES_CONFIG[code] || COUNTRIES_CONFIG.PK;
    const firstProv = Object.keys(cfg.regions)[0] || 'Sindh';
    setSelectedProvince(firstProv);
    const firstCity = cfg.regions[firstProv]?.[0]?.name || cfg.defaultCity;
    setSelectedCity(firstCity);
  };

  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    const cities = activeConfig.regions[prov] || [];
    if (cities.length > 0) {
      setSelectedCity(cities[0].name);
    }
  };

  const handleQuickSwitch = (cityName: string, provName: string) => {
    setSelectedCountry('PK');
    setSelectedProvince(provName);
    setSelectedCity(cityName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCountrySelection(selectedCountry, selectedProvince, selectedCity);
  };

  const availability = checkLocationAvailability(selectedCountry, selectedProvince, selectedCity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#10231d]/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#faf6ee] rounded-3xl shadow-2xl border border-[#e2e8e5] overflow-hidden my-auto relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#064e3b] via-[#043d2e] to-[#022c22] text-white p-6 text-center relative shrink-0">
          <button
            type="button"
            onClick={closeWelcomeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center mb-2.5 backdrop-blur-xs border border-white/20 shadow-inner">
            <Globe className="w-6 h-6 text-emerald-300" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight">
            Select Your Region &amp; Mandi
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-md mx-auto leading-relaxed">
            MarketLink connects you directly with live wholesale farmer stalls in your city.
          </p>
        </div>

        {/* Selection Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* 1. Country Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-2">
              1. Select Country
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {Object.values(COUNTRIES_CONFIG).map((cfg) => {
                const isSelected = selectedCountry === cfg.code;
                return (
                  <button
                    key={cfg.code}
                    type="button"
                    onClick={() => handleCountryChange(cfg.code)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-md scale-[1.02]'
                        : 'bg-white text-[#10231d] border-[#e2e8e5] hover:bg-[#eef2ec]'
                    }`}
                  >
                    <span className="text-2xl">{cfg.flag}</span>
                    <span className="text-xs font-semibold">{cfg.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-emerald-200' : 'text-[#64748b]'}`}>
                      {cfg.currencyCode} ({cfg.currencySymbol})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Province / State Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1.5">
              2. Select Province / State
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-xl text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] font-medium"
            >
              {provincesList.map((prov) => (
                <option key={`${selectedCountry}-${prov}`} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* 3. City Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#10231d] uppercase tracking-wider mb-1.5">
              3. Select City / Hub
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#e2e8e5] rounded-xl text-[#10231d] focus:border-[#064e3b] focus:ring-1 focus:ring-[#10b981] font-medium"
            >
              {citiesList.map((c) => {
                const isActive = Boolean(KNOWN_ACTIVE_CITIES[c.name]);
                return (
                  <option key={`${selectedProvince}-${c.name}`} value={c.name}>
                    {c.name} {isActive ? '🟢 (Active Live Stalls)' : '⚪ (No Stalls Yet)'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Availability Status Box */}
          {availability.isAvailable ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 text-[#064e3b]">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Active Mandi Hub Available!</span>
              </div>
              <p className="text-[#064e3b]/80 leading-relaxed">
                {availability.message}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-3 text-amber-950">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-xs text-amber-900 uppercase tracking-wide">
                    Not Available in {selectedCity}, {selectedProvince}
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    We currently do not have live farmer stalls in {selectedCity}. Please select an active city below to view available produce and stalls:
                  </p>
                </div>
              </div>

              {/* Quick Switch Buttons to Active Cities */}
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-amber-900 uppercase block mb-2">
                  Select an Active Live City:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(KNOWN_ACTIVE_CITIES).map(([cityName, info]) => (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => handleQuickSwitch(cityName, info.province)}
                      className="p-2.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-200 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="font-bold text-xs text-[#10231d] group-hover:text-[#064e3b] flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{cityName}</span>
                      </div>
                      <div className="text-[10px] text-[#64748b] font-mono mt-0.5">{info.stalls}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Confirm &amp; Explore {selectedCity} Stalls</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </button>
        </form>
      </div>
    </div>
  );
};
