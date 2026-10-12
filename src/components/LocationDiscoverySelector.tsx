import React from 'react';
import { Globe, MapPin, Building, ChevronDown, Check } from 'lucide-react';
import {
  COUNTRIES,
  PROVINCES_BY_COUNTRY,
  CITIES_BY_PROVINCE,
} from '../data/pakistanLocations.ts';

export interface LocationDiscoverySelectorProps {
  country: string;
  onCountryChange: (country: string) => void;
  province: string;
  onProvinceChange: (province: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  className?: string;
  layout?: 'grid' | 'stack';
  size?: 'sm' | 'md';
}

export const LocationDiscoverySelector: React.FC<LocationDiscoverySelectorProps> = ({
  country,
  onCountryChange,
  province,
  onProvinceChange,
  city,
  onCityChange,
  className = '',
  layout = 'grid',
  size = 'sm',
}) => {
  const availableProvinces = country ? PROVINCES_BY_COUNTRY[country] || [] : [];
  const availableCities = province ? CITIES_BY_PROVINCE[province] || [] : [];

  const handleCountrySelect = (newCountry: string) => {
    onCountryChange(newCountry);
    // Reset subordinate selections
    onProvinceChange('');
    onCityChange('');
  };

  const handleProvinceSelect = (newProvince: string) => {
    onProvinceChange(newProvince);
    // Reset subordinate selection
    onCityChange('');
  };

  const handleCitySelect = (newCity: string) => {
    onCityChange(newCity);
  };

  const paddingClass = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-3.5 py-2.5 text-xs sm:text-sm';
  const labelClass = 'block text-[11px] font-semibold text-[#10231d] uppercase tracking-wider mb-1';

  return (
    <div
      className={`${
        layout === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-3 gap-2.5'
          : 'space-y-2.5'
      } ${className}`}
    >
      {/* Step A: Country Dropdown */}
      <div className="relative">
        <label className={labelClass}>
          <span className="text-[#064e3b] font-bold mr-1">1.</span> Country
        </label>
        <div className="relative">
          <select
            value={country}
            onChange={(e) => handleCountrySelect(e.target.value)}
            className={`w-full ${paddingClass} pr-8 bg-white border border-[#e2e8e5] rounded-xl text-[#10231d] font-medium appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#064e3b] transition-all cursor-pointer`}
          >
            <option value="" disabled>
              Select Country...
            </option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Step B: Province Dropdown (Disabled until Country selected) */}
      <div className="relative">
        <label className={labelClass}>
          <span className="text-[#064e3b] font-bold mr-1">2.</span> Province / Region
        </label>
        <div className="relative">
          <select
            value={province}
            disabled={!country}
            onChange={(e) => handleProvinceSelect(e.target.value)}
            className={`w-full ${paddingClass} pr-8 bg-white border border-[#e2e8e5] rounded-xl text-[#10231d] font-medium appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#064e3b] transition-all disabled:bg-[#eae8df]/60 disabled:text-[#64748b] disabled:cursor-not-allowed cursor-pointer`}
          >
            <option value="">
              {!country ? '← Select Country first' : 'Select Province...'}
            </option>
            {availableProvinces.map((prov) => (
              <option key={`${country}-${prov}`} value={prov}>
                {prov}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Step C: City Dropdown (Disabled until Province selected) */}
      <div className="relative">
        <label className={labelClass}>
          <span className="text-[#064e3b] font-bold mr-1">3.</span> City / Area
        </label>
        <div className="relative">
          <select
            value={city}
            disabled={!province}
            onChange={(e) => handleCitySelect(e.target.value)}
            className={`w-full ${paddingClass} pr-8 bg-white border border-[#e2e8e5] rounded-xl text-[#10231d] font-medium appearance-none focus:outline-hidden focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#064e3b] transition-all disabled:bg-[#eae8df]/60 disabled:text-[#64748b] disabled:cursor-not-allowed cursor-pointer`}
          >
            <option value="">
              {!province ? '← Select Province first' : 'Select City...'}
            </option>
            {availableCities.map((ct) => (
              <option key={`${province}-${ct.name}`} value={ct.name}>
                {ct.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
