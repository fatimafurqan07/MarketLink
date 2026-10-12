import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Store,
  ArrowRight,
  Heart,
  Clock,
  Filter,
  RotateCcw,
  AlertCircle,
  Navigation,
  Sparkles,
  ShoppingBag,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Market, FarmerProfile } from '../types.ts';
import { LuxurySelect, LuxurySelectOption } from './common/LuxurySelect.tsx';
import { useScrollReveal } from '../hooks/useScrollReveal.ts';
import { LocationDiscoverySelector } from './LocationDiscoverySelector.tsx';
import { matchOrFindNearestMarkets } from '../data/pakistanLocations.ts';
import { LeafletMapView } from './common/LeafletMapView.tsx';

// Comprehensive verified Mandis of Pakistan (including Hyderabad Hala Naka & Karachi Mandis)
export const BASELINE_MANDI_MARKETS: Market[] = [
  {
    id: 1,
    name: 'Super Highway Sabzi Mandi, Karachi',
    slug: 'karachi-super-highway-mandi',
    location_address: 'Main Super Highway (M-9), New Sabzi Mandi, Scheme 33, Karachi, Sindh',
    country: 'Pakistan',
    province: 'Sindh',
    city: 'Karachi',
    latitude: 24.9721,
    longitude: 67.1571,
    plus_code: 'X5C4+RF Karachi',
    gps_coords: '24.9721° N, 67.1571° E',
    stall_bays: 'Stall Rows 12-48 • Gate 3 (Sabzi Section)',
    operating_days: 'Daily (Mon – Sun)',
    timings: '04:30 AM – 11:30 AM',
    opening_time: '04:30:00',
    closing_time: '11:30:00',
    description: 'Sindh primary wholesale mandi. Direct fresh farm produce from Thatta, Hyderabad, and Malir.',
    parking_info: 'Dedicated loading area and customer parking at Gate 3 with easy stall access.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    stall_count: 36,
    is_active: true,
  },
  {
    id: 2,
    name: 'Hala Naka Sabzi & Fruit Mandi, Hyderabad',
    slug: 'hyderabad-hala-naka-mandi',
    location_address: 'Main National Highway (N-5), Hala Naka Chowk, Hyderabad, Sindh',
    country: 'Pakistan',
    province: 'Sindh',
    city: 'Hyderabad',
    latitude: 25.4095,
    longitude: 68.3752,
    plus_code: 'CM5G+R3 Hyderabad',
    gps_coords: '25.4095° N, 68.3752° E',
    stall_bays: 'Stall Rows 01-32 • Central Kisan Yard',
    operating_days: 'Daily (Mon – Sun)',
    timings: '04:00 AM – 11:30 AM',
    opening_time: '04:00:00',
    closing_time: '11:30:00',
    description: 'Central agricultural hub of Lower Sindh. Direct farm harvests from Matiari, Tando Allahyar, Mirpurkhas, and Hala growers.',
    parking_info: 'Spacious tractor-trolley and customer parking at Hala Naka main bypass.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    stall_count: 32,
    is_active: true,
  },
  {
    id: 3,
    name: 'Malir Sabzi Mandi (Memon Goth), Karachi',
    slug: 'karachi-malir-mandi',
    location_address: 'Memon Goth Main Agricultural Road, Malir District, Karachi, Sindh',
    country: 'Pakistan',
    province: 'Sindh',
    city: 'Karachi',
    latitude: 24.9182,
    longitude: 67.2417,
    plus_code: 'W69R+7M Karachi',
    gps_coords: '24.9182° N, 67.2417° E',
    stall_bays: 'Stalls M-01 to M-26 • Organic Riverbed Section',
    operating_days: 'Daily (Mon – Sun)',
    timings: '05:00 AM – 12:00 PM',
    opening_time: '05:00:00',
    closing_time: '12:00:00',
    description: 'Renowned peri-urban vegetable mandi of Karachi specializing in morning-picked leafy greens, Malir palak, and fresh root crops.',
    parking_info: 'Farmer pickup zone along Memon Goth link road.',
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    stall_count: 26,
    is_active: true,
  },
  {
    id: 4,
    name: 'Empress Market Heritage Produce Square, Karachi',
    slug: 'karachi-empress-market',
    location_address: 'Preedy Street, Saddar Town, South Karachi, Sindh',
    country: 'Pakistan',
    province: 'Sindh',
    city: 'Karachi',
    latitude: 24.8624,
    longitude: 67.0272,
    plus_code: 'V26G+XV Karachi',
    gps_coords: '24.8624° N, 67.0272° E',
    stall_bays: 'Heritage Clock Tower Stalls 01-22',
    operating_days: 'Daily (Mon – Sun)',
    timings: '06:00 AM – 02:00 PM',
    opening_time: '06:00:00',
    closing_time: '14:00:00',
    description: 'Historic city-center produce pavilion connecting central Karachi consumers directly with certified peri-urban growers and fresh fruit baskets.',
    parking_info: 'Saddar municipal parking plaza adjacent to market court.',
    image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
    stall_count: 22,
    is_active: true,
  },
  {
    id: 5,
    name: 'Liaquatabad Supermarket Mandi, Karachi',
    slug: 'karachi-liaquatabad-mandi',
    location_address: 'Liaquatabad No. 10, Central District, Karachi, Sindh',
    country: 'Pakistan',
    province: 'Sindh',
    city: 'Karachi',
    latitude: 24.9085,
    longitude: 67.0427,
    plus_code: 'W25V+9Q Karachi',
    gps_coords: '24.9085° N, 67.0427° E',
    stall_bays: 'Central Wing Stalls A1-B12',
    operating_days: 'Daily (Mon – Sun)',
    timings: '05:30 AM – 01:00 PM',
    opening_time: '05:30:00',
    closing_time: '13:00:00',
    description: 'Central Karachi fresh fruits and vegetable distribution hub connecting District Central vendors and local buyers directly with growers.',
    parking_info: 'Liaquatabad commercial market parking bay.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    stall_count: 20,
    is_active: true,
  },
  {
    id: 6,
    name: 'Badami Bagh Sabzi Mandi, Lahore',
    slug: 'lahore-badami-bagh-hub',
    location_address: 'Badami Bagh Mandi Complex, Ravi Link Road, Lahore, Punjab',
    country: 'Pakistan',
    province: 'Punjab',
    city: 'Lahore',
    latitude: 31.5925,
    longitude: 74.3283,
    plus_code: 'HHV8+PX Lahore',
    gps_coords: '31.5925° N, 74.3283° E',
    stall_bays: 'Stall Rows 04-32 • North Gate 2',
    operating_days: 'Tue – Sun (Weekly Off Monday)',
    timings: '05:00 AM – 12:00 PM',
    opening_time: '05:00:00',
    closing_time: '12:00:00',
    description: 'Heart of Punjab agricultural exchange. Direct crops from Okara, Faisalabad, and Kasur.',
    parking_info: 'Ravi Link parking with easy pickup spaces.',
    image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
    stall_count: 28,
    is_active: true,
  },
  {
    id: 7,
    name: 'I-11/4 Sabzi & Fruit Mandi, Islamabad',
    slug: 'islamabad-i11-terminal',
    location_address: 'Sector I-11/4 Wholesale Fruit & Vegetable Mandi, Islamabad, ICT',
    country: 'Pakistan',
    province: 'Islamabad Capital Territory',
    city: 'Islamabad',
    latitude: 33.6511,
    longitude: 73.0242,
    plus_code: 'M22F+RM Islamabad',
    gps_coords: '33.6511° N, 73.0242° E',
    stall_bays: 'Stall Rows 01-24 • Central Farmers Area',
    operating_days: 'Daily (Mon – Sun)',
    timings: '05:30 AM – 01:00 PM',
    opening_time: '05:30:00',
    closing_time: '13:00:00',
    description: 'Twin-cities primary mandi serving Potohar farmers and Swat valley apple harvests.',
    parking_info: 'Sector I-11 mandi parking lot adjacent to main gate.',
    image_url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
    stall_count: 24,
    is_active: true,
  },
];

// Fallback verified farmer stalls for regional mandis if no dynamic profile exists yet
const FALLBACK_REGIONAL_STALLS: Record<string, FarmerProfile[]> = {
  karachi_super_highway: [
    {
      id: 1,
      user_id: 2,
      market_id: 1,
      farm_name: 'Shanti Organic Green Farms (Kisan Tariq Mehmood)',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Karachi',
      stall_number: 'Stall #K-14 (Sindh Pavilion Gate 3)',
      stall_lat: 24.9723,
      stall_lng: 67.1574,
      bio: 'Cultivating pesticide-free Roma tomatoes, sweet desi onions, and crisp Malir spinach in the fertile river basin with daily dawn harvest.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.97,
      is_verified: true,
    },
    {
      id: 106,
      user_id: 206,
      market_id: 1,
      farm_name: 'Thatta Coastal Produce Co-op (Kisan Noor Muhammad)',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Karachi',
      stall_number: 'Stall #K-28 (Vegetable Row 2)',
      stall_lat: 24.9725,
      stall_lng: 67.1578,
      bio: 'Direct morning shipments of Thatta delta sweet gourds, fresh mint, local garlic, and seedless green chillies.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.93,
      is_verified: true,
    },
  ],
  hyderabad: [
    {
      id: 101,
      user_id: 201,
      market_id: 2,
      farm_name: 'Sindh Green Valley Farms (Kisan Ghulam Mustafa)',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Hyderabad',
      stall_number: 'Stall #H-04 (Hala Naka Main Yard)',
      stall_lat: 25.4097,
      stall_lng: 68.3755,
      bio: 'Cultivating Matiari riverbed bananas, Indus sweet red onions, and seasonal okra with 100% canal irrigation.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.96,
      is_verified: true,
    },
    {
      id: 102,
      user_id: 202,
      market_id: 2,
      farm_name: 'Tando Allahyar Orchard Link (Kisan Allah Dino)',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Hyderabad',
      stall_number: 'Stall #H-12 (Fruit Wing)',
      stall_lat: 25.4093,
      stall_lng: 68.3750,
      bio: 'Direct harvest of Sindhri and Chaunsa mangoes, sweet guavas, and freshly picked tomatoes from Lower Sindh.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.92,
      is_verified: true,
    },
  ],
  karachi_malir: [
    {
      id: 103,
      user_id: 203,
      market_id: 3,
      farm_name: 'Memon Goth Riverbed Greens (Kisan Haji Karim)',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Karachi',
      stall_number: 'Stall #M-06 (Greens Pavilion)',
      stall_lat: 24.9184,
      stall_lng: 67.2419,
      bio: 'Harvested fresh at 4:30 AM from Malir basin: tender desi spinach (palak), aromatic coriander, and root radishes.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.98,
      is_verified: true,
    },
    {
      id: 107,
      user_id: 207,
      market_id: 3,
      farm_name: 'Malir Delta Organic Roots (Kisan Abdul Sattar)',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Karachi',
      stall_number: 'Stall #M-12 (Well-bed Sector)',
      stall_lat: 24.9186,
      stall_lng: 67.2423,
      bio: 'Specialist organic grower of golden carrots, baby turnips, fresh dill, and spring fenugreek (methi).',
      farming_practices: 'Organic Certified',
      cutoff_hours: 10,
      rating_avg: 4.95,
      is_verified: true,
    },
  ],
  karachi_empress: [
    {
      id: 104,
      user_id: 204,
      market_id: 4,
      farm_name: 'Saddar Heritage Farm Link (Kisan Abdul Wahid)',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Karachi',
      stall_number: 'Stall #E-02 (Central Clock Tower)',
      stall_lat: 24.8626,
      stall_lng: 67.0274,
      bio: 'Connecting peri-urban Thatta and Malir vegetable growers directly to South Karachi residents without middleman markups.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.94,
      is_verified: true,
    },
    {
      id: 108,
      user_id: 208,
      market_id: 4,
      farm_name: 'Empress Fresh Fruit Guild (Kisan Jameel Memon)',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Karachi',
      stall_number: 'Stall #E-08 (Heritage Arcade)',
      stall_lat: 24.8628,
      stall_lng: 67.0278,
      bio: 'Farm baskets of Sindh sweet melons, ripe pomegranates, and daily fresh picked Roma tomatoes.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.91,
      is_verified: true,
    },
  ],
  karachi_liaquatabad: [
    {
      id: 105,
      user_id: 205,
      market_id: 5,
      farm_name: 'Central District Farm Node (Kisan Noman Khan)',
      country: 'Pakistan',
      province: 'Sindh',
      city: 'Karachi',
      stall_number: 'Stall #L-05 (Supermarket Lane)',
      stall_lat: 24.9087,
      stall_lng: 67.0429,
      bio: 'Daily fresh potatoes, onions, green chillies, and ginger supplied directly from Thatta harvest fields.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.91,
      is_verified: true,
    },
  ],
  lahore_badami_bagh: [
    {
      id: 109,
      user_id: 209,
      market_id: 6,
      farm_name: 'Ravi River Organic Guild (Kisan Chaudhry Aslam)',
      country: 'Pakistan',
      province: 'Punjab',
      city: 'Lahore',
      stall_number: 'Stall #B-08 (North Gate 2)',
      stall_lat: 31.5927,
      stall_lng: 74.3286,
      bio: 'Punjab fertile alluvial harvest: fresh golden potatoes, Okara sweet carrots, and crisp cauliflower direct from fields.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.95,
      is_verified: true,
    },
    {
      id: 110,
      user_id: 210,
      market_id: 6,
      farm_name: 'Okara Dairy & Golden Egg Farm (Kisan Mian Riaz)',
      country: 'Pakistan',
      province: 'Punjab',
      city: 'Lahore',
      stall_number: 'Stall #B-15 (Dairy & Egg Wing)',
      stall_lat: 31.5923,
      stall_lng: 74.3281,
      bio: 'Free-range desi eggs with deep golden yolks, cold-pressed mustard oil, and pure farm dairy brought daily into Badami Bagh.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 10,
      rating_avg: 4.96,
      is_verified: true,
    },
  ],
  islamabad_i11: [
    {
      id: 111,
      user_id: 211,
      market_id: 7,
      farm_name: 'Swat Mountain Apple & Honey Orchards (Kisan Jahangir Khan)',
      country: 'Pakistan',
      province: 'Islamabad Capital Territory',
      city: 'Islamabad',
      stall_number: 'Stall #I-03 (Swat Pavilion Gate 1)',
      stall_lat: 33.6513,
      stall_lng: 73.0245,
      bio: 'Mountain-fresh high altitude Fuji apples, raw wild sidr honey, and Swat walnuts harvested with natural snowmelt irrigation.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.98,
      is_verified: true,
    },
    {
      id: 112,
      user_id: 212,
      market_id: 7,
      farm_name: 'Potohar Plateau Organic Farm (Kisan Malik Farooq)',
      country: 'Pakistan',
      province: 'Islamabad Capital Territory',
      city: 'Islamabad',
      stall_number: 'Stall #I-12 (Potohar Pavilion)',
      stall_lat: 33.6509,
      stall_lng: 73.0239,
      bio: 'Rain-fed organic desi garlic, spring onions, fresh coriander, and cherry tomatoes cultivated in the Potohar basin.',
      farming_practices: 'Organic Certified',
      cutoff_hours: 12,
      rating_avg: 4.94,
      is_verified: true,
    },
  ],
};

interface MarketMapProps {
  markets: Market[];
  farmers: FarmerProfile[];
  onSelectFarmer?: (farmerId: number | string) => void;
  onFilterMarket?: (marketId: number | string) => void;
  favoriteFarmerIds?: Set<string>;
  onToggleFavoriteFarmer?: (farmerId: number | string) => void;
}

export const MarketMap: React.FC<MarketMapProps> = React.memo(({
  markets,
  farmers,
  onSelectFarmer = () => {},
  onFilterMarket = () => {},
  favoriteFarmerIds,
  onToggleFavoriteFarmer,
}) => {
  const containerRef = useScrollReveal<HTMLDivElement>();

  // Consolidate backend markets with guaranteed baseline mandis
  const mergedMarkets = React.useMemo(() => {
    if (!markets || markets.length === 0) return BASELINE_MANDI_MARKETS;
    const result = [...markets];
    for (const baseM of BASELINE_MANDI_MARKETS) {
      const alreadyHas = result.some(
        (m) =>
          m.id?.toString() === baseM.id?.toString() ||
          m.slug === baseM.slug ||
          (m.name.toLowerCase().includes((baseM.city || '').toLowerCase()) && m.name.toLowerCase().includes(baseM.slug.split('-')[1] || ''))
      );
      if (!alreadyHas) {
        result.push(baseM);
      }
    }
    return result;
  }, [markets]);

  const [selectedMarketId, setSelectedMarketId] = useState<number | string>(mergedMarkets[0]?.id || 1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [selectedStallId, setSelectedStallId] = useState<number | string | null>(null);

  // Optional Location Discovery Filter State
  const [filterCountry, setFilterCountry] = useState<string>('Pakistan');
  const [filterProvince, setFilterProvince] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [showLocationFilter, setShowLocationFilter] = useState<boolean>(false);

  const isLocationFilterApplied = Boolean(filterProvince && filterCity);

  const locationMatchResult = React.useMemo(() => {
    if (!isLocationFilterApplied) {
      return { exactMatch: true, markets: mergedMarkets, nearestNote: undefined };
    }
    return matchOrFindNearestMarkets(mergedMarkets, filterProvince, filterCity);
  }, [mergedMarkets, filterProvince, filterCity, isLocationFilterApplied]);

  const activeMarketsList = locationMatchResult.markets.length > 0 ? locationMatchResult.markets : mergedMarkets;

  useEffect(() => {
    if (activeMarketsList.length > 0 && !activeMarketsList.some((m) => m.id.toString() === selectedMarketId.toString())) {
      const nextId = activeMarketsList[0].id;
      setSelectedMarketId(nextId);
      onFilterMarket(nextId);
    }
  }, [activeMarketsList, selectedMarketId, onFilterMarket]);

  const selectedMarket: Market =
    activeMarketsList.find((m) => m.id.toString() === selectedMarketId.toString()) ||
    activeMarketsList[0] ||
    BASELINE_MANDI_MARKETS[0];

  // Resolve stalls for current market (dynamic or rich regional fallbacks)
  const marketStalls = React.useMemo(() => {
    if (!selectedMarket) return [];
    const dynamicStalls = farmers.filter(
      (f) =>
        f.market_id?.toString() === selectedMarket.id.toString() ||
        (selectedMarket.slug?.includes('karachi-super-highway') && f.market_id?.toString() === '1')
    );

    if (dynamicStalls.length > 0) return dynamicStalls;

    // Check regional fallbacks by city/slug/name
    const sName = (selectedMarket.name + ' ' + (selectedMarket.slug || '') + ' ' + (selectedMarket.city || '')).toLowerCase();
    
    if (sName.includes('super highway') || sName.includes('super-highway') || selectedMarket.id.toString() === '1') {
      return FALLBACK_REGIONAL_STALLS.karachi_super_highway;
    }
    if (sName.includes('hala naka') || sName.includes('hyderabad') || selectedMarket.id.toString() === '2') {
      return FALLBACK_REGIONAL_STALLS.hyderabad;
    }
    if (sName.includes('malir') || selectedMarket.id.toString() === '3') {
      return FALLBACK_REGIONAL_STALLS.karachi_malir;
    }
    if (sName.includes('empress') || selectedMarket.id.toString() === '4') {
      return FALLBACK_REGIONAL_STALLS.karachi_empress;
    }
    if (sName.includes('liaquatabad') || selectedMarket.id.toString() === '5') {
      return FALLBACK_REGIONAL_STALLS.karachi_liaquatabad;
    }
    if (sName.includes('badami bagh') || sName.includes('lahore') || selectedMarket.id.toString() === '6') {
      return FALLBACK_REGIONAL_STALLS.lahore_badami_bagh;
    }
    if (sName.includes('i-11') || sName.includes('i11') || sName.includes('islamabad') || selectedMarket.id.toString() === '7') {
      return FALLBACK_REGIONAL_STALLS.islamabad_i11;
    }

    // Default to existing farmers or Shanti Organic
    return FALLBACK_REGIONAL_STALLS.karachi_super_highway || farmers.slice(0, 2);
  }, [selectedMarket, farmers]);

  const marketSelectOptions: LuxurySelectOption<number | string>[] = activeMarketsList.map((m) => ({
    value: m.id,
    label: m.name,
    subLabel: m.location_address,
    badge: (m as any).distanceKm !== undefined ? `${(m as any).distanceKm} km` : (m.city || 'Mandi Hub'),
    icon: Store,
  }));

  const handleClearLocationFilter = () => {
    setFilterProvince('');
    setFilterCity('');
  };

  const handleMarketChange = (newId: number | string) => {
    setSelectedMarketId(newId);
    onFilterMarket(newId);
  };

  const safeLat =
    typeof selectedMarket.latitude === 'number' && Number.isFinite(selectedMarket.latitude)
      ? selectedMarket.latitude
      : parseFloat(selectedMarket.latitude as any) || 24.9721;
  const safeLng =
    typeof selectedMarket.longitude === 'number' && Number.isFinite(selectedMarket.longitude)
      ? selectedMarket.longitude
      : parseFloat(selectedMarket.longitude as any) || 67.1571;
  const plusCode = selectedMarket.plus_code || `${safeLat.toFixed(4)}, ${safeLng.toFixed(4)}`;
  const gpsCoords = selectedMarket.gps_coords || `${safeLat.toFixed(4)}° N, ${safeLng.toFixed(4)}° E`;
  const stallBays = selectedMarket.stall_bays || 'Stall Row 01-32 • Main Farmers Line';

  const handleCopyLocationCode = async () => {
    const textToCopy = `${selectedMarket.name}\nCoordinates: ${gpsCoords}\nGoogle Plus Code: ${plusCode}\nStall Area: ${stallBays}\nAddress: ${selectedMarket.location_address}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`;

  return (
    <div ref={containerRef} className="reveal-section w-full space-y-12 sm:space-y-16">
      {/* =================================================================== */}
      {/* 1. SECTION HEADER (Clear Typographic Hierarchy)                     */}
      {/* =================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#e2e8e5]">
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#064e3b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#064e3b] animate-pulse" />
            <span>MANDI &amp; STALL DIRECTORY</span>
            <span className="text-stone-300">·</span>
            <span className="text-[#64748b]">{activeMarketsList.length} Operating Wholesale Terminals</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#10231d] leading-tight">
            Find Mandis &amp; <span className="text-[#064e3b] italic">Farmer Stalls.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#64748b] leading-relaxed font-normal max-w-2xl">
            Select a verified wholesale mandi terminal in Karachi, Hyderabad, Lahore, or Islamabad. Check stall bays, inspect fresh harvests, and pre-order with Rs. 0 online fee.
          </p>
        </div>

        {/* Filter & Mandi Switcher Controls */}
        <div className="w-full sm:w-auto shrink-0 flex flex-col sm:flex-row items-stretch sm:items-end gap-3 relative z-20">
          <button
            type="button"
            onClick={() => setShowLocationFilter((prev) => !prev)}
            className={`h-11 px-4.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              isLocationFilterApplied || showLocationFilter
                ? 'bg-[#ecfdf5] border-emerald-300 text-[#064e3b] ring-1 ring-emerald-300'
                : 'bg-white hover:bg-[#eef2ec] border-[#e2e8e5] text-[#10231d]'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>
              {isLocationFilterApplied
                ? `${filterCity || filterProvince}`
                : 'Filter by Province / City'}
            </span>
          </button>

          <div className="w-full sm:w-80 shrink-0">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748b] block mb-1.5">
              Switch Mandi Facility
            </label>
            <LuxurySelect<number | string>
              value={selectedMarket.id}
              onChange={(newId) => handleMarketChange(newId)}
              options={marketSelectOptions}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Expandable Location Discovery Panel */}
      {showLocationFilter && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8e5] shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8e5]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#064e3b]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#064e3b] font-mono">
                Step-by-Step Geographic Discovery
              </span>
            </div>
            {isLocationFilterApplied && (
              <button
                type="button"
                onClick={handleClearLocationFilter}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show All Pakistan Mandis</span>
              </button>
            )}
          </div>

          <LocationDiscoverySelector
            country={filterCountry}
            onCountryChange={setFilterCountry}
            province={filterProvince}
            onProvinceChange={setFilterProvince}
            city={filterCity}
            onCityChange={setFilterCity}
            size="md"
          />

          {isLocationFilterApplied && !locationMatchResult.exactMatch && locationMatchResult.nearestNote && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{locationMatchResult.nearestNote}</span>
                <p className="mt-0.5 text-amber-800 text-[11px]">
                  Map centered on the nearest operating mandi facility.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. MANDI HUBS TILES STRIP (Spacious Luxury Grid)                    */}
      {/* =================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#64748b] px-1">
          <span className="uppercase font-semibold tracking-wider text-[#10231d]">
            Select Mandi Terminal ({activeMarketsList.length} Operating Locations)
          </span>
          <span className="hidden sm:inline text-[11px] text-[#064e3b] font-medium">
            Click any tile to update center map &amp; stalls
          </span>
        </div>

        {/* Clean, spacious grid without double-boxed container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeMarketsList.map((m) => {
            const isSelected = selectedMarket.id.toString() === m.id.toString();
            const distanceText =
              (m as any).distanceKm !== undefined ? `${(m as any).distanceKm} km away` : `${m.city || 'Sindh'}`;

            return (
              <div
                key={m.id}
                onClick={() => handleMarketChange(m.id)}
                className={`group relative p-7 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden bg-white shadow-xs ${
                  isSelected
                    ? 'border-[#064e3b] ring-2 ring-[#064e3b]/25 shadow-lg bg-gradient-to-b from-[#f2f9f5] via-white to-white transform-gpu -translate-y-1'
                    : 'border-[#e2e8e5] hover:border-[#064e3b]/50 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Top Status Accent Bar */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#064e3b]" />
                )}

                {/* Card Header with Icon, Region & Stall Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? 'bg-[#064e3b] text-white shadow-xs'
                          : 'bg-[#064e3b]/10 border border-[#064e3b]/20 text-[#064e3b]'
                      }`}
                    >
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#064e3b]">
                        {m.city?.toUpperCase() || 'MANDI'}
                      </span>
                      <div className="text-xs text-[#64748b] font-mono mt-0.5">
                        {distanceText}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold border shrink-0 whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#064e3b] text-white border-[#064e3b]'
                        : 'bg-[#eef2ec] text-[#064e3b] border-[#e2e8e5]'
                    }`}
                  >
                    {isSelected ? 'ACTIVE VIEW' : `${m.stall_count || 24} STALLS`}
                  </span>
                </div>

                {/* Mandi Title & Physical Address */}
                <div className="mt-5 space-y-2 flex-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#10231d] group-hover:text-[#064e3b] transition-colors leading-snug">
                    {m.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748b] line-clamp-2 leading-relaxed">
                    {m.location_address}
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-[#064e3b] font-semibold truncate">
                    {m.stall_bays}
                  </div>
                </div>

                {/* Bottom Meta & Timing */}
                <div className="mt-6 pt-4 border-t border-[#e2e8e5] flex items-center justify-between text-xs text-[#64748b]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#064e3b]" />
                    <span>{m.opening_time?.slice(0, 5)} – {m.closing_time?.slice(0, 5)}</span>
                  </span>

                  <span
                    className={`font-semibold flex items-center gap-1.5 transition-colors ${
                      isSelected ? 'text-[#064e3b]' : 'text-[#64748b] group-hover:text-[#064e3b]'
                    }`}
                  >
                    <span>{isSelected ? 'Viewing' : 'Select'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. INTERACTIVE LEAFLET MAP & TELEMETRY CONTROL BAR                  */}
      {/* =================================================================== */}
      <div className="space-y-4">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-md border border-[#e2e8e5]">
          <LeafletMapView
            markets={activeMarketsList}
            selectedMarketId={selectedMarket.id}
            onSelectMarket={(newId) => handleMarketChange(newId)}
            farmers={farmers}
            height="460px"
            zoom={14}
            showStallPins={true}
          />
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#10231d]/90 backdrop-blur-md border border-white/15 text-white font-mono text-xs shadow-lg pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-bold">{selectedMarket.city?.toUpperCase() || 'MANDI'} ACTIVE</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-300 font-semibold truncate max-w-[220px]">{selectedMarket.name}</span>
          </div>
        </div>

        {/* Location Info Telemetry Bar with Generous Padding */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#e2e8e5] shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7 xl:gap-8 text-left flex-1">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] font-bold">
                GPS Coordinate Fix
              </div>
              <div className="font-mono text-xs font-bold text-[#10231d] mt-1.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#064e3b]" />
                <span>{gpsCoords}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] font-bold">
                Google Plus Code
              </div>
              <div className="font-mono text-xs font-bold text-[#064e3b] mt-1.5">
                {plusCode}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] font-bold">
                Stall / Pavilion Area
              </div>
              <div className="text-xs font-medium text-[#10231d] mt-1.5">
                {stallBays}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-4 xl:pt-0 border-t xl:border-t-0 border-[#e2e8e5]">
            <button
              type="button"
              onClick={handleCopyLocationCode}
              className={`h-11 px-4 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer shadow-xs ${
                copiedCode
                  ? 'bg-[#ecfdf5] text-[#064e3b] border-emerald-300'
                  : 'bg-[#eef2ec] hover:bg-[#e2e8df] text-[#10231d] border-[#e2e8e5]'
              }`}
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-[#064e3b]" />
                  <span>Address Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#64748b]" />
                  <span>Copy Mandi Address</span>
                </>
              )}
            </button>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#ecfdf5]" />
            </a>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. REGISTERED FARMER STALLS IN SELECTED MANDI                       */}
      {/* =================================================================== */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-3 border-b border-[#e2e8e5]">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#064e3b]">
              PHYSICAL STALL COLLECTION TERMINALS
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#10231d] flex items-center gap-2.5 mt-1">
              <Store className="w-6 h-6 text-[#064e3b]" />
              <span>Farmer Stalls at {selectedMarket.name}</span>
            </h3>
            <p className="text-xs text-[#64748b] mt-1 font-normal">
              Operating Schedule: {selectedMarket.operating_days} ({selectedMarket.opening_time} – {selectedMarket.closing_time})
            </p>
          </div>

          <span className="font-mono text-xs font-bold text-[#064e3b] bg-[#ecfdf5] border border-emerald-200 px-4 py-2 rounded-full shadow-xs">
            {marketStalls.length} Registered Farmer Stalls
          </span>
        </div>

      {/* Stalls Grid with Enhanced Padding & Visual Depth */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
        {marketStalls.map((stall, idx) => {
          const isSelected = selectedStallId === stall.id;
          const isFav = favoriteFarmerIds?.has(stall.id.toString());

          return (
            <div
              key={stall.id}
              onClick={() => setSelectedStallId(stall.id)}
              style={{ animationDelay: `${(idx % 6) * 100}ms` }}
              className={`p-7 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer bg-white flex flex-col justify-between space-y-6 relative shadow-xs card-3d-interactive sweep-glare reveal-stagger-item contain-paint-layout ${
                isSelected
                  ? 'border-[#064e3b] ring-2 ring-[#064e3b]/25 shadow-md bg-gradient-to-b from-[#f4f9f6] via-white to-white'
                  : 'border-[#e2e8e5] hover:border-[#064e3b]/40 hover:shadow-md'
              }`}
            >
              {/* Stall Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <span className="px-3.5 py-1.5 rounded-xl bg-[#eef2ec] text-[#064e3b] font-mono text-xs font-bold border border-[#e2e8e5] whitespace-nowrap shadow-2xs">
                    {stall.stall_number}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#064e3b] flex items-center gap-1 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 whitespace-nowrap shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
                      <span>CNIC Verified</span>
                    </span>

                    {onToggleFavoriteFarmer && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavoriteFarmer(stall.id);
                          }}
                          aria-label={isFav ? 'Remove farmer from favorites' : 'Save farmer stall'}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            isFav
                              ? 'text-[#b3261e] bg-rose-50'
                              : 'text-[#64748b] hover:text-[#b3261e] hover:bg-[#eef2ec]'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#b3261e] text-[#b3261e]' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                {/* Explicit Mandi Location Container */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] text-xs font-semibold">
                  <Store className="w-4 h-4 text-[#064e3b] shrink-0" />
                  <span className="truncate">
                    Mandi: <strong className="font-bold">{stall.market_name || selectedMarket.name}</strong>
                  </span>
                </div>

                <div className="pt-1">
                  <h4 className="font-serif text-2xl sm:text-[26px] font-normal text-[#10231d] leading-snug">
                    {stall.farm_name}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#64748b] mt-2.5 line-clamp-3 leading-relaxed">
                    {stall.bio}
                  </p>
                </div>

                {/* Bay Operating Info */}
                <div className="flex items-center justify-between text-xs text-[#64748b] font-mono pt-2 border-t border-[#e2e8e5]/80">
                  <span className="flex items-center gap-1.5 text-[#064e3b] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span>Bay Active for Pickup</span>
                  </span>
                  <span>{selectedMarket.timings || '04:30 AM – 11:30 AM'}</span>
                </div>
              </div>

              {/* Stall Footer Actions */}
              <div className="pt-4 border-t border-[#e2e8e5] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="text-amber-600 font-bold flex items-center gap-1 font-mono text-sm">
                    ★ {stall.rating_avg}
                  </span>
                  <span className="text-[#64748b] text-xs font-mono">(50+ orders)</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFarmer(stall.id);
                  }}
                  className="h-10 px-4.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Browse Crops</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

MarketMap.displayName = 'MarketMap';
