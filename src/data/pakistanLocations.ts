import { Country, State, City } from 'country-state-city';

export interface LocationCountry {
  code: string;
  name: string;
  flag: string;
}

export interface CityLocation {
  name: string;
  latitude: number;
  longitude: number;
}

// Full worldwide countries from country-state-city
export const COUNTRIES: LocationCountry[] = Country.getAllCountries().map((c) => ({
  code: c.isoCode,
  name: c.name,
  flag: c.flag || '🌐',
}));

// Dynamic provinces / states getter
export const PROVINCES_BY_COUNTRY: Record<string, string[]> = new Proxy(
  {
    Pakistan: [
      'Punjab',
      'Sindh',
      'Khyber Pakhtunkhwa',
      'Balochistan',
      'Gilgit-Baltistan',
      'Azad Kashmir',
      'Islamabad Capital Territory',
    ],
  },
  {
    get(target: Record<string, string[]>, prop: string) {
      if (prop in target) return target[prop];
      const foundCountry = Country.getAllCountries().find(
        (c) => c.name.toLowerCase() === prop.toLowerCase() || c.isoCode.toLowerCase() === prop.toLowerCase()
      );
      if (foundCountry) {
        const states = State.getStatesOfCountry(foundCountry.isoCode);
        return states.map((s) => s.name);
      }
      return [];
    },
  }
) as Record<string, string[]>;

// Dynamic cities getter
export const CITIES_BY_PROVINCE: Record<string, CityLocation[]> = new Proxy(
  {
    Sindh: [
      { name: 'Karachi', latitude: 24.8607, longitude: 67.0011 },
      { name: 'Hyderabad', latitude: 25.396, longitude: 68.3578 },
      { name: 'Sukkur', latitude: 27.7052, longitude: 68.8574 },
    ],
    Punjab: [
      { name: 'Lahore', latitude: 31.5497, longitude: 74.3436 },
      { name: 'Faisalabad', latitude: 31.4504, longitude: 73.135 },
      { name: 'Rawalpindi', latitude: 33.5651, longitude: 73.0169 },
    ],
    'Islamabad Capital Territory': [
      { name: 'Islamabad', latitude: 33.6844, longitude: 73.0479 },
    ],
  },
  {
    get(target: Record<string, CityLocation[]>, prop: string) {
      if (prop in target) return target[prop];
      // Search across all countries for this state/province name
      for (const country of Country.getAllCountries()) {
        const states = State.getStatesOfCountry(country.isoCode);
        const state = states.find((s) => s.name.toLowerCase() === prop.toLowerCase());
        if (state) {
          const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
          if (cities.length > 0) {
            return cities.map((ct) => ({
              name: ct.name,
              latitude: Number(ct.latitude || 24.8607),
              longitude: Number(ct.longitude || 67.0011),
            }));
          }
        }
      }
      return [{ name: prop, latitude: 24.8607, longitude: 67.0011 }];
    },
  }
) as Record<string, CityLocation[]>;

/**
 * Calculates geographical distance in kilometers between two coordinates via Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Finds exact city match markets or falls back to nearest available markets in the province
 */
export function matchOrFindNearestMarkets<
  T extends {
    id: number | string;
    name: string;
    city?: string;
    province?: string;
    country?: string;
    latitude: number;
    longitude: number;
  }
>(
  markets: T[],
  selectedProvince: string,
  selectedCity: string
): {
  exactMatch: boolean;
  markets: (T & { distanceKm?: number })[];
  nearestNote?: string;
} {
  if (!markets || markets.length === 0) {
    return { exactMatch: false, markets: [] };
  }

  const cleanCity = selectedCity.trim().toLowerCase();
  const cleanProvince = selectedProvince.trim().toLowerCase();

  // 1. Check exact city match
  const exactCityMatches = markets.filter((m) => {
    const mCity = (m.city || '').toLowerCase();
    const mName = m.name.toLowerCase();
    return mCity === cleanCity || mName.includes(cleanCity);
  });

  if (exactCityMatches.length > 0) {
    return {
      exactMatch: true,
      markets: exactCityMatches,
    };
  }

  // 2. Find coordinates of selected city
  const cityList = CITIES_BY_PROVINCE[selectedProvince] || [];
  const cityInfo = cityList.find((c) => c.name.toLowerCase() === cleanCity);

  const targetLat = cityInfo ? cityInfo.latitude : 30.3753;
  const targetLng = cityInfo ? cityInfo.longitude : 69.3451;

  // 3. Filter markets in same province first, or all markets if none in province
  let candidateMarkets = markets.filter((m) => {
    const mProv = (m.province || '').toLowerCase();
    return mProv === cleanProvince;
  });

  let inProvince = true;
  if (candidateMarkets.length === 0) {
    candidateMarkets = [...markets];
    inProvince = false;
  }

  // Calculate distance for each candidate
  const withDistance = candidateMarkets.map((m) => ({
    ...m,
    distanceKm: calculateDistanceKm(targetLat, targetLng, m.latitude, m.longitude),
  }));

  withDistance.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  const nearestNote = inProvince
    ? `No mandis found in ${selectedCity} yet — here are the nearest available mandis in ${selectedProvince}:`
    : `No mandis found in ${selectedProvince} yet — here are the nearest operating mandis across Pakistan:`;

  return {
    exactMatch: false,
    markets: withDistance,
    nearestNote,
  };
}
