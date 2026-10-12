import React, { createContext, useContext, useState } from 'react';
import { COUNTRIES_CONFIG, CountryConfig } from '../data/countryConfig.ts';
import { Market, Product, FarmerProfile } from '../types.ts';

export interface LocationAvailability {
  isAvailable: boolean;
  marketCount: number;
  stallCount: number;
  message: string;
}

interface CountryContextType {
  countryCode: string;
  countryConfig: CountryConfig;
  province: string;
  city: string;
  setCountrySelection: (code: string, province: string, city: string) => void;
  isWelcomeModalOpen: boolean;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
  filterMarketsByRegion: (markets: Market[]) => Market[];
  filterProductsByRegion: (products: Product[], activeMarkets: Market[]) => Product[];
  filterFarmersByRegion: (farmers: FarmerProfile[], activeMarkets: Market[]) => FarmerProfile[];
  checkLocationAvailability: (cCode?: string, prov?: string, cty?: string, marketsList?: Market[]) => LocationAvailability;
}

const COUNTRY_KEY = 'egreen_country_code';
const PROVINCE_KEY = 'egreen_province';
const CITY_KEY = 'egreen_city';

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countryCode, setCountryCode] = useState<string>(() => {
    try {
      return localStorage.getItem(COUNTRY_KEY) || 'PK';
    } catch {
      return 'PK';
    }
  });

  const [province, setProvince] = useState<string>(() => {
    try {
      return localStorage.getItem(PROVINCE_KEY) || 'Sindh';
    } catch {
      return 'Sindh';
    }
  });

  const [city, setCity] = useState<string>(() => {
    try {
      return localStorage.getItem(CITY_KEY) || 'Karachi';
    } catch {
      return 'Karachi';
    }
  });

  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(COUNTRY_KEY);
    } catch {
      return true;
    }
  });

  const countryConfig = COUNTRIES_CONFIG[countryCode] || COUNTRIES_CONFIG.PK;

  const setCountrySelection = (code: string, newProvince: string, newCity: string) => {
    setCountryCode(code);
    setProvince(newProvince);
    setCity(newCity);
    setIsWelcomeModalOpen(false);
    try {
      localStorage.setItem(COUNTRY_KEY, code);
      localStorage.setItem(PROVINCE_KEY, newProvince);
      localStorage.setItem(CITY_KEY, newCity);
    } catch {
      // Ignore
    }
  };

  const openWelcomeModal = () => setIsWelcomeModalOpen(true);
  const closeWelcomeModal = () => setIsWelcomeModalOpen(false);

  const checkLocationAvailability = (
    targetCountryCode: string = countryCode,
    targetProvince: string = province,
    targetCity: string = city,
    marketsList: Market[] = []
  ): LocationAvailability => {
    if (targetCountryCode !== 'PK') {
      return {
        isAvailable: false,
        marketCount: 0,
        stallCount: 0,
        message: `Stalls / Markets not available in ${COUNTRIES_CONFIG[targetCountryCode]?.name || targetCountryCode} yet! We currently operate live stalls in Karachi, Hyderabad, Lahore, and Islamabad.`,
      };
    }

    const cityLower = targetCity.trim().toLowerCase();

    const matched = marketsList.filter((m) => {
      const mCity = (m.city || '').toLowerCase();
      const mAddr = (m.location_address || '').toLowerCase();
      const mName = (m.name || '').toLowerCase();
      return mCity.includes(cityLower) || mAddr.includes(cityLower) || mName.includes(cityLower);
    });

    if (matched.length > 0) {
      const stalls = matched.reduce((sum, m) => sum + (m.stall_count || 24), 0);
      return {
        isAvailable: true,
        marketCount: matched.length,
        stallCount: stalls,
        message: `${matched.length} Mandi market(s) with ${stalls} active stalls available in ${targetCity}, ${targetProvince}.`,
      };
    }

    const knownActive = ['karachi', 'hyderabad', 'lahore', 'islamabad'];
    const isKnown = knownActive.some((k) => cityLower.includes(k));

    if (isKnown) {
      return {
        isAvailable: true,
        marketCount: 1,
        stallCount: 28,
        message: `Active stalls available in ${targetCity}, ${targetProvince}.`,
      };
    }

    return {
      isAvailable: false,
      marketCount: 0,
      stallCount: 0,
      message: `Stalls / Markets not available in ${targetCity}, ${targetProvince} yet! Currently operating in Karachi, Hyderabad, Lahore, and Islamabad.`,
    };
  };

  const filterMarketsByRegion = (markets: Market[]): Market[] => {
    if (!markets || markets.length === 0) return [];

    if (countryCode !== 'PK') {
      return [];
    }

    const cityLower = city.trim().toLowerCase();
    const provLower = province.trim().toLowerCase();

    // 1. Match by city
    const cityMatches = markets.filter((m) => {
      const mCity = (m.city || '').toLowerCase();
      const mAddr = (m.location_address || '').toLowerCase();
      const mName = (m.name || '').toLowerCase();
      return mCity.includes(cityLower) || mAddr.includes(cityLower) || mName.includes(cityLower);
    });

    if (cityMatches.length > 0) {
      return cityMatches;
    }

    // 2. Fallback match by province if city has no direct match
    const provMatches = markets.filter((m) => {
      const mProv = (m.province || '').toLowerCase();
      const mAddr = (m.location_address || '').toLowerCase();
      return mProv.includes(provLower) || mAddr.includes(provLower);
    });

    if (provMatches.length > 0) {
      return provMatches;
    }

    return [];
  };

  const filterProductsByRegion = (products: Product[], activeMarkets: Market[]): Product[] => {
    if (!products || products.length === 0) return [];
    if (!activeMarkets || activeMarkets.length === 0) return [];

    const activeMarketIds = new Set(activeMarkets.map((m) => m.id?.toString()));
    return products.filter((p) => {
      const mId = p.market_id?.toString() || (p as any).marketId?.toString();
      return mId && activeMarketIds.has(mId);
    });
  };

  const filterFarmersByRegion = (farmers: FarmerProfile[], activeMarkets: Market[]): FarmerProfile[] => {
    if (!farmers || farmers.length === 0) return [];
    if (!activeMarkets || activeMarkets.length === 0) return [];

    const activeMarketIds = new Set(activeMarkets.map((m) => m.id?.toString()));
    return farmers.filter((f) => {
      const mId = f.market_id?.toString();
      return mId && activeMarketIds.has(mId);
    });
  };

  return (
    <CountryContext.Provider
      value={{
        countryCode: countryCode || 'PK',
        countryConfig,
        province,
        city,
        setCountrySelection,
        isWelcomeModalOpen,
        openWelcomeModal,
        closeWelcomeModal,
        filterMarketsByRegion,
        filterProductsByRegion,
        filterFarmersByRegion,
        checkLocationAvailability,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = (): CountryContextType => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};
