/**
 * Multi-Country Configuration System for MarketLink (eGreen Basket)
 * Supports Pakistan, India, and United States with extensible country configs,
 * currencies, national IDs, terminology, states/provinces, and seeded markets.
 */

export interface CityLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface StateRegion {
  name: string;
  cities: CityLocation[];
}

export interface SeededMarket {
  id: number | string;
  name: string;
  country: string;
  province: string;
  city: string;
  location_address: string;
  latitude: number;
  longitude: number;
  operating_days: string[];
  timings: string;
  description: string;
  parking_info: string;
  image_url: string;
  stall_count: number;
}

export interface CountryConfig {
  code: string; // 'PK' | 'IN' | 'US'
  name: string;
  flag: string;
  currencyCode: string; // 'PKR' | 'INR' | 'USD'
  currencySymbol: string; // 'Rs.' | '₹' | '$'
  currencyPosition: 'prefix' | 'suffix';
  nationalIdName: string; // e.g. 'CNIC', 'Aadhaar ID', 'Business EIN'
  nationalIdPlaceholder: string;
  nationalIdRegex: RegExp;
  nationalIdHelp: string;
  marketTerm: string; // 'Sabzi Mandi', 'Krishi Mandi', 'Farmers Market'
  defaultProvince: string;
  defaultCity: string;
  regions: Record<string, CityLocation[]>;
  seededMarkets: SeededMarket[];
}

export const COUNTRIES_CONFIG: Record<string, CountryConfig> = {
  PK: {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    currencyCode: 'PKR',
    currencySymbol: 'Rs.',
    currencyPosition: 'prefix',
    nationalIdName: 'CNIC (National ID)',
    nationalIdPlaceholder: '42101-1234567-1',
    nationalIdRegex: /^\d{5}-\d{7}-\d{1}$/,
    nationalIdHelp: 'Format: 12345-1234567-1 (13 digits with hyphens)',
    marketTerm: 'Sabzi Mandi',
    defaultProvince: 'Sindh',
    defaultCity: 'Karachi',
    regions: {
      Sindh: [
        { name: 'Karachi', latitude: 24.8607, longitude: 67.0011 },
        { name: 'Hyderabad', latitude: 25.3960, longitude: 68.3578 },
        { name: 'Sukkur', latitude: 27.7052, longitude: 68.8579 },
      ],
      Punjab: [
        { name: 'Lahore', latitude: 31.5204, longitude: 74.3587 },
        { name: 'Faisalabad', latitude: 31.4504, longitude: 73.1350 },
        { name: 'Rawalpindi', latitude: 33.5651, longitude: 73.0169 },
        { name: 'Multan', latitude: 30.1575, longitude: 71.5249 },
      ],
      'Islamabad Capital Territory': [
        { name: 'Islamabad', latitude: 33.6511, longitude: 73.0242 },
      ],
      'Khyber Pakhtunkhwa': [
        { name: 'Peshawar', latitude: 34.0151, longitude: 71.5249 },
        { name: 'Swat (Mingora)', latitude: 34.7717, longitude: 72.3602 },
        { name: 'Abbottabad', latitude: 34.1463, longitude: 73.2117 },
      ],
      Balochistan: [
        { name: 'Quetta', latitude: 30.1798, longitude: 66.9750 },
        { name: 'Gwadar', latitude: 25.1216, longitude: 62.3254 },
      ],
    },
    seededMarkets: [
      {
        id: 1,
        name: 'New Sabzi Mandi Super Highway',
        country: 'Pakistan',
        province: 'Sindh',
        city: 'Karachi',
        location_address: 'Super Highway M-9, Gadap Town, Karachi',
        latitude: 24.9721,
        longitude: 67.1571,
        operating_days: ['Daily'],
        timings: '04:30 AM – 11:30 AM',
        description: 'Pakistan’s largest wholesale agricultural trade hub featuring 1,200+ grower bays.',
        parking_info: 'Dedicated truck and commercial transport parking bays available.',
        image_url: 'https://images.unsplash.com/photo-1488459716770-c445c0d5aeea?auto=format&fit=crop&w=800&q=80',
        stall_count: 48,
      },
      {
        id: 2,
        name: 'Badami Bagh Wholesale Mandi',
        country: 'Pakistan',
        province: 'Punjab',
        city: 'Lahore',
        location_address: 'Badami Bagh Grain & Vegetable Market, Lahore',
        latitude: 31.5925,
        longitude: 74.3095,
        operating_days: ['Daily'],
        timings: '05:00 AM – 12:00 PM',
        description: 'Historic central wholesale food market serving Punjab with daily fresh orchard harvests.',
        parking_info: 'Ample loading docks and vendor parking.',
        image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        stall_count: 36,
      },
      {
        id: 3,
        name: 'Sector I-11/4 Wholesale Mandi',
        country: 'Pakistan',
        province: 'Islamabad Capital Territory',
        city: 'Islamabad',
        location_address: 'Sector I-11/4 Wholesale Fruit & Vegetable Mandi, Islamabad',
        latitude: 33.6511,
        longitude: 73.0242,
        operating_days: ['Daily'],
        timings: '05:30 AM – 01:00 PM',
        description: 'Twin-cities primary mandi serving Potohar farmers and Swat valley apple harvests.',
        parking_info: 'Sector I-11 mandi parking lot adjacent to main gate.',
        image_url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
        stall_count: 24,
      },
      {
        id: 4,
        name: 'Hala Naka Sabzi & Fruit Mandi',
        country: 'Pakistan',
        province: 'Sindh',
        city: 'Hyderabad',
        location_address: 'Main National Highway (N-5), Hala Naka Chowk, Hyderabad',
        latitude: 25.4095,
        longitude: 68.3752,
        operating_days: ['Daily'],
        timings: '04:00 AM – 11:30 AM',
        description: 'Central agricultural hub of Lower Sindh. Direct farm produce from Matiari, Tando Allahyar, and Mirpurkhas.',
        parking_info: 'Spacious tractor-trolley and customer parking at Hala Naka main bypass.',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        stall_count: 32,
      },
    ],
  },
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currencyCode: 'INR',
    currencySymbol: '₹',
    currencyPosition: 'prefix',
    nationalIdName: 'Aadhaar / Business ID',
    nationalIdPlaceholder: '1234 5678 9012',
    nationalIdRegex: /^\d{4}\s\d{4}\s\d{4}$|^\d{12}$/,
    nationalIdHelp: 'Format: 1234 5678 9012 (12 digits)',
    marketTerm: 'Krishi Mandi',
    defaultProvince: 'Maharashtra',
    defaultCity: 'Mumbai',
    regions: {
      Maharashtra: [
        { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
        { name: 'Pune', latitude: 18.5204, longitude: 73.8567 },
        { name: 'Nagpur', latitude: 21.1458, longitude: 79.0882 },
      ],
      Delhi: [
        { name: 'New Delhi', latitude: 28.6139, longitude: 77.2090 },
      ],
      Karnataka: [
        { name: 'Bangalore', latitude: 12.9716, longitude: 77.5946 },
        { name: 'Mysore', latitude: 12.2958, longitude: 76.6394 },
      ],
      Punjab: [
        { name: 'Amritsar', latitude: 31.6340, longitude: 74.8723 },
        { name: 'Ludhiana', latitude: 30.9010, longitude: 75.8573 },
      ],
    },
    seededMarkets: [
      {
        id: 101,
        name: 'APMC Vashi Wholesale Krishi Mandi',
        country: 'India',
        province: 'Maharashtra',
        city: 'Mumbai',
        location_address: 'Agricultural Produce Market Committee, Vashi, Navi Mumbai',
        latitude: 19.0770,
        longitude: 72.9980,
        operating_days: ['Daily'],
        timings: '04:00 AM – 11:00 AM',
        description: 'Asia’s premier wholesale agricultural market complex supplying fresh vegetables and grains to Mumbai.',
        parking_info: 'Massive commercial vehicle terminal and multi-level parking.',
        image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
        stall_count: 64,
      },
      {
        id: 102,
        name: 'Azadpur Central Sabzi Mandi',
        country: 'India',
        province: 'Delhi',
        city: 'New Delhi',
        location_address: 'Grand Trunk Road, Azadpur, New Delhi',
        latitude: 28.7051,
        longitude: 77.1818,
        operating_days: ['Daily'],
        timings: '03:30 AM – 10:30 AM',
        description: 'The largest wholesale fruit and vegetable market in India, serving Northern agricultural yields.',
        parking_info: 'Dedicated logistic bays and cold storage links.',
        image_url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80',
        stall_count: 80,
      },
      {
        id: 103,
        name: 'Yeshwantpur APMC Market',
        country: 'India',
        province: 'Karnataka',
        city: 'Bangalore',
        location_address: 'Tumkur Road, Yeshwantpur, Bangalore',
        latitude: 13.0285,
        longitude: 77.5441,
        operating_days: ['Daily'],
        timings: '05:00 AM – 01:00 PM',
        description: 'Southern hub connecting organic coffee, spices, tropical fruits, and fresh greens.',
        parking_info: 'Spacious grower and buyer parking lots.',
        image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        stall_count: 40,
      },
    ],
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currencyCode: 'USD',
    currencySymbol: '$',
    currencyPosition: 'prefix',
    nationalIdName: 'Business ID / Tax EIN (Optional)',
    nationalIdPlaceholder: '12-3456789',
    nationalIdRegex: /^\d{2}-\d{7}$|^$/,
    nationalIdHelp: 'Optional format: 12-3456789 (Employer Identification Number)',
    marketTerm: 'Farmers Market',
    defaultProvince: 'California',
    defaultCity: 'Los Angeles',
    regions: {
      California: [
        { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
        { name: 'San Francisco', latitude: 37.7749, longitude: -122.4194 },
        { name: 'San Diego', latitude: 32.7157, longitude: -117.1611 },
      ],
      'New York': [
        { name: 'New York City', latitude: 40.7128, longitude: -74.0060 },
        { name: 'Albany', latitude: 42.6526, longitude: -73.7562 },
      ],
      Texas: [
        { name: 'Austin', latitude: 30.2672, longitude: -97.7431 },
        { name: 'Houston', latitude: 29.7604, longitude: -95.3698 },
      ],
    },
    seededMarkets: [
      {
        id: 201,
        name: 'Los Angeles Downtown Farmers Terminal',
        country: 'United States',
        province: 'California',
        city: 'Los Angeles',
        location_address: '746 S Alameda St, Los Angeles, CA 90021',
        latitude: 34.0326,
        longitude: -118.2355,
        operating_days: ['Tuesday', 'Thursday', 'Saturday'],
        timings: '06:00 AM – 01:00 PM',
        description: 'Premier California agricultural co-op featuring certified organic orchards, artisan dairy, and greens.',
        parking_info: 'Free subterranean customer and vendor parking available.',
        image_url: 'https://images.unsplash.com/photo-1488459716770-c445c0d5aeea?auto=format&fit=crop&w=800&q=80',
        stall_count: 32,
      },
      {
        id: 202,
        name: 'Union Square Greenmarket',
        country: 'United States',
        province: 'New York',
        city: 'New York City',
        location_address: 'Union Square Park, New York, NY 10003',
        latitude: 40.7359,
        longitude: -73.9911,
        operating_days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        timings: '08:00 AM – 04:00 PM',
        description: 'World-renowned open-air market connecting regional Hudson Valley farmers with New York city chefs and households.',
        parking_info: 'Public transit accessible; nearby commercial garages.',
        image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
        stall_count: 45,
      },
      {
        id: 203,
        name: 'Sustainable Food Center Farmers Market Downtown',
        country: 'United States',
        province: 'Texas',
        city: 'Austin',
        location_address: 'Republic Square, 422 Guadalupe St, Austin, TX 78701',
        latitude: 30.2687,
        longitude: -97.7461,
        operating_days: ['Saturday'],
        timings: '09:00 AM – 01:00 PM',
        description: 'Central Texas grower hub featuring pasture-raised meats, heirloom vegetables, and local pecans.',
        parking_info: 'Street and garage parking surrounding Republic Square.',
        image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        stall_count: 28,
      },
    ],
  },
};

export const formatCurrencyByCountry = (amount: number, countryCode: string = 'PK'): string => {
  const config = COUNTRIES_CONFIG[countryCode] || COUNTRIES_CONFIG.PK;
  const symbol = config.currencySymbol;
  
  // Format number with commas
  const formattedNum = amount.toLocaleString('en-US', {
    minimumFractionDigits: config.currencyCode === 'USD' ? 2 : 0,
    maximumFractionDigits: config.currencyCode === 'USD' ? 2 : 0,
  });

  return `${symbol} ${formattedNum}`;
};
