/**
 * In-memory Relational Engine matching db/schema.sql & db/seed.sql
 * Guarantees state persistence during runtime session with foreign key integrity.
 * Strictly "eGreen Basket" (Farmers' Market & Agricultural Produce)
 */

export type AppModule = 
  | 'markets_discovery'
  | 'produce_catalog'
  | 'my_preorders'
  | 'harvest_inventory'
  | 'stall_scanner'
  | 'agro_copilot'
  | 'user_management'
  | 'analytics_reports';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'farmer' | 'customer';
  role_title?: string;
  phone: string;
  cnic?: string;
  avatar_url: string;
  organization?: string;
  modules: AppModule[];
  created_at: string;
}

export interface Market {
  id: number;
  name: string;
  slug: string;
  location_address: string;
  city?: string;
  latitude: number;
  longitude: number;
  plus_code?: string;
  gps_coords?: string;
  stall_bays?: string;
  operating_days: string;
  opening_time: string;
  closing_time: string;
  description: string;
  parking_info: string;
  image_url: string;
  is_active: boolean;
  stall_count?: number;
}

export interface FarmerProfile {
  id: number;
  user_id: number;
  market_id: number;
  farm_name: string;
  stall_number: string;
  stall_lat: number;
  stall_lng: number;
  bio: string;
  farming_practices: 'Organic Certified' | 'Transitional Organic' | 'Conventional Eco-Safe';
  cutoff_hours: number;
  contact_phone: string;
  contact_email: string;
  cnic?: string;
  banner_image: string;
  rating_avg: number;
  is_verified: boolean;
}

export type ProductCategory = 
  | 'Fresh Vegetables' 
  | 'Orchard Fruits' 
  | 'Farm Fresh Dairy & Eggs' 
  | 'Raw Honey & Preserves' 
  | 'Organic Herbs';

export type ProductUnit = 
  | 'kg' 
  | 'bunch' 
  | 'punnet' 
  | 'dozen' 
  | 'jar' 
  | 'piece' 
  | '500g bag';

export interface Product {
  id: number;
  farmer_id: number;
  market_id: number;
  name: string;
  category: ProductCategory;
  description: string;
  price_per_unit: number;
  unit: ProductUnit;
  farming_type: 'Organic' | 'Conventional';
  harvest_date: string;
  stock_limit: number;
  in_stock: number;
  image_url: string;
  status: 'active' | 'out_of_stock' | 'archived';
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  unit: string;
  reserved_qty: number;
  accepted_qty: number;
  rejected_qty: number;
  rejection_note?: string;
  subtotal: number;
}

export interface Order {
  id: number;
  order_code: string;
  customer_id: number;
  farmer_id: number;
  market_id: number;
  pickup_date: string;
  pickup_timeslot: string;
  pickup_token: string;
  pickup_pin: string;
  order_status: 'placed' | 'accepted' | 'ready' | 'completed' | 'cancelled';
  payment_method: 'Cash On Pickup' | 'Contactless Tap at Stall';
  payment_status: 'pending_at_stall' | 'collected_at_stall' | 'waived_cancelled';
  online_amount_collected: number; // Always 0.00
  initial_total_due: number;
  final_total_due: number;
  inspection_notes?: string;
  cancelled_reason?: string;
  created_at: string;
  items?: OrderItem[];
}

// ---------------------------------------------------------------------
// Initial Seed Data (Pure Agricultural Produce - Zero Bakery/Cafe)
// ---------------------------------------------------------------------

export const initialUsers: User[] = [
  {
    id: 1,
    name: 'Zavi',
    email: 'zavimalik23@gmail.com',
    password_hash: '0000',
    role: 'admin',
    role_title: 'Platform Administrator',
    phone: '+92 300 0000000',
    cnic: '42201-1111111-1',
    organization: 'MarketLink Support Board',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    modules: [
      'markets_discovery',
      'produce_catalog',
      'my_preorders',
      'harvest_inventory',
      'stall_scanner',
      'agro_copilot',
      'user_management',
      'analytics_reports',
    ],
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 2,
    name: 'Ahsan',
    email: 'ahsan@marketlink.com',
    password_hash: '2222',
    role: 'farmer',
    role_title: 'Lead Organic Grower • Sindh',
    phone: '+92 321 2222222',
    cnic: '42101-2222222-2',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    modules: [
      'harvest_inventory',
      'stall_scanner',
      'markets_discovery',
      'agro_copilot',
    ],
    created_at: '2026-09-02T08:00:00Z',
  },
  {
    id: 3,
    name: 'Fatima',
    email: 'fatima@marketlink.com',
    password_hash: '0000',
    role: 'customer',
    role_title: 'Household Market Patron',
    phone: '+92 345 0000000',
    cnic: '42101-0000000-0',
    organization: 'Household Market Patron',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    modules: [
      'produce_catalog',
      'my_preorders',
      'markets_discovery',
      'agro_copilot',
    ],
    created_at: '2026-09-10T08:00:00Z',
  },
];

export const initialMarkets: Market[] = [
  {
    id: 1,
    name: 'Super Highway Sabzi Mandi, Karachi',
    slug: 'karachi-super-highway-mandi',
    location_address: 'Main Super Highway (M-9), New Sabzi Mandi, Scheme 33, Karachi, Sindh',
    city: 'Karachi',
    latitude: 24.9721,
    longitude: 67.1571,
    plus_code: 'X5C4+RF Karachi',
    gps_coords: '24.9721° N, 67.1571° E',
    stall_bays: 'Stall Rows 12-48 • Gate 3 (Sabzi Section)',
    operating_days: 'Daily (Mon – Sun)',
    opening_time: '04:30:00',
    closing_time: '11:30:00',
    description: 'Sindh’s primary wholesale mandi. Direct fresh farm produce from Thatta, Hyderabad, and Malir. Zero middleman fees.',
    parking_info: 'Dedicated loading area and customer parking at Gate 3 with easy stall access.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    stall_count: 36,
    is_active: true,
  },
  {
    id: 2,
    name: 'Badami Bagh Sabzi Mandi, Lahore',
    slug: 'lahore-badami-bagh-hub',
    location_address: 'Badami Bagh Mandi Complex, Ravi Link Road, Lahore, Punjab',
    city: 'Lahore',
    latitude: 31.5925,
    longitude: 74.3283,
    plus_code: 'HHV8+PX Lahore',
    gps_coords: '31.5925° N, 74.3283° E',
    stall_bays: 'Stall Rows 04-32 • North Gate 2',
    operating_days: 'Tuesday through Sunday',
    opening_time: '05:00:00',
    closing_time: '12:00:00',
    description: 'Heart of Punjab agricultural exchange. Direct crops from Okara, Faisalabad, and Kasur.',
    parking_info: 'Ravi Link parking with easy pickup spaces.',
    image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
    stall_count: 28,
    is_active: true,
  },
  {
    id: 3,
    name: 'I-11/4 Sabzi & Fruit Mandi, Islamabad',
    slug: 'islamabad-i11-terminal',
    location_address: 'Sector I-11/4 Wholesale Fruit & Vegetable Mandi, Islamabad, ICT',
    city: 'Islamabad',
    latitude: 33.6511,
    longitude: 73.0242,
    plus_code: 'M22F+RM Islamabad',
    gps_coords: '33.6511° N, 73.0242° E',
    stall_bays: 'Stall Rows 01-24 • Central Farmers Area',
    operating_days: 'Daily Early Morning',
    opening_time: '05:30:00',
    closing_time: '13:00:00',
    description: 'Twin-cities primary mandi serving Potohar farmers and Swat valley fresh fruit harvest.',
    parking_info: 'Sector I-11 mandi parking lot adjacent to main gate.',
    image_url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
    stall_count: 24,
    is_active: true,
  },
  {
    id: 4,
    name: 'Hala Naka Sabzi & Fruit Mandi, Hyderabad',
    slug: 'hyderabad-hala-naka-mandi',
    location_address: 'Main National Highway (N-5), Hala Naka Chowk, Hyderabad, Sindh',
    city: 'Hyderabad',
    latitude: 25.4095,
    longitude: 68.3752,
    plus_code: 'CM5G+R3 Hyderabad',
    gps_coords: '25.4095° N, 68.3752° E',
    stall_bays: 'Stall Rows 01-32 • Central Kisan Yard',
    operating_days: 'Daily (Mon – Sun)',
    opening_time: '04:00:00',
    closing_time: '11:30:00',
    description: 'Central agricultural hub of Lower Sindh. Direct farm produce from Matiari, Tando Allahyar, Mirpurkhas, and Hala growers.',
    parking_info: 'Spacious tractor-trolley and customer parking at Hala Naka main bypass.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    stall_count: 32,
    is_active: true,
  },
  {
    id: 5,
    name: 'Malir Sabzi Mandi (Memon Goth), Karachi',
    slug: 'karachi-malir-mandi',
    location_address: 'Memon Goth Main Agricultural Road, Malir District, Karachi, Sindh',
    city: 'Karachi',
    latitude: 24.9182,
    longitude: 67.2417,
    plus_code: 'W69R+7M Karachi',
    gps_coords: '24.9182° N, 67.2417° E',
    stall_bays: 'Stalls M-01 to M-26 • Organic Riverbed Section',
    operating_days: 'Daily (Mon – Sun)',
    opening_time: '05:00:00',
    closing_time: '12:00:00',
    description: 'Renowned peri-urban vegetable mandi of Karachi specializing in morning-picked leafy greens, Malir palak, and fresh root crops.',
    parking_info: 'Farmer pickup zone along Memon Goth link road.',
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    stall_count: 26,
    is_active: true,
  },
  {
    id: 6,
    name: 'Empress Market Heritage Produce Square, Karachi',
    slug: 'karachi-empress-market',
    location_address: 'Preedy Street, Saddar Town, South Karachi, Sindh',
    city: 'Karachi',
    latitude: 24.8624,
    longitude: 67.0272,
    plus_code: 'V26G+XV Karachi',
    gps_coords: '24.8624° N, 67.0272° E',
    stall_bays: 'Heritage Clock Tower Stalls 01-22',
    operating_days: 'Daily (Mon – Sun)',
    opening_time: '06:00:00',
    closing_time: '14:00:00',
    description: 'Historic city-center produce pavilion connecting central Karachi consumers directly with certified peri-urban growers and fresh fruit baskets.',
    parking_info: 'Saddar municipal parking plaza adjacent to market court.',
    image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
    stall_count: 22,
    is_active: true,
  },
];

export const initialFarmers: FarmerProfile[] = [
  {
    id: 1,
    user_id: 2,
    market_id: 1,
    farm_name: 'Ahsan Organic Green Farms',
    stall_number: 'Stall #A-14 (Sindh Section)',
    stall_lat: 24.9723,
    stall_lng: 67.1574,
    bio: 'Family grower cultivating heirloom Roma tomatoes, desi spinach (palak), fresh coriander, and okra in Malir river basin.',
    farming_practices: 'Organic Certified',
    cutoff_hours: 12,
    contact_phone: '+92 321 2222222',
    contact_email: 'ahsan@marketlink.com',
    cnic: '42101-2222222-2',
    banner_image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    rating_avg: 4.96,
    is_verified: true,
  },
];

export const initialProducts: Product[] = [
  {
    id: 1,
    farmer_id: 1,
    market_id: 1,
    name: 'Organic Sindh Roma Tomatoes',
    category: 'Fresh Vegetables',
    description: 'Plump, sun-ripened red Roma tomatoes harvested at morning peak in Malir basin. Dense flesh, low seeds, ideal for rich gravies and fresh salads.',
    price_per_unit: 140,
    unit: 'kg',
    farming_type: 'Organic',
    harvest_date: '2026-09-25',
    stock_limit: 150,
    in_stock: 135,
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    id: 2,
    farmer_id: 1,
    market_id: 1,
    name: 'Swat Valley Fuji Apples',
    category: 'Orchard Fruits',
    description: 'Crisp, sweet, and extraordinarily juicy mountain Fuji apples from Swat Valley. Grown in high-elevation mineral soils without chemical waxes.',
    price_per_unit: 320,
    unit: 'kg',
    farming_type: 'Organic',
    harvest_date: '2026-09-24',
    stock_limit: 100,
    in_stock: 88,
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    id: 3,
    farmer_id: 1,
    market_id: 1,
    name: 'Desi Pasture Fresh Eggs',
    category: 'Farm Fresh Dairy & Eggs',
    description: 'Pasture-raised golden desi eggs from free-range heritage hens grazing on organic Punjab clover meadows.',
    price_per_unit: 380,
    unit: 'dozen',
    farming_type: 'Organic',
    harvest_date: '2026-09-25',
    stock_limit: 80,
    in_stock: 72,
    image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    id: 4,
    farmer_id: 1,
    market_id: 1,
    name: 'Pure Margalla Wildflower Honey',
    category: 'Raw Honey & Preserves',
    description: 'Unfiltered, unheated pure raw berry honey harvested from apiaries placed beside Margalla Hills wildflower groves. Rich in natural bee pollen.',
    price_per_unit: 1450,
    unit: 'jar',
    farming_type: 'Organic',
    harvest_date: '2026-09-20',
    stock_limit: 50,
    in_stock: 45,
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    id: 5,
    farmer_id: 1,
    market_id: 1,
    name: 'Fresh Malir Desi Palak (Spinach)',
    category: 'Fresh Vegetables',
    description: 'Tender baby spinach leaves triple-washed in natural tubewell water. Crisp texture with sweet, iron-rich flavor.',
    price_per_unit: 80,
    unit: 'bunch',
    farming_type: 'Organic',
    harvest_date: '2026-09-25',
    stock_limit: 120,
    in_stock: 110,
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    id: 6,
    farmer_id: 1,
    market_id: 1,
    name: 'Farm Fresh Okara Red Carrots',
    category: 'Fresh Vegetables',
    description: 'Crunchy sweet red carrots freshly pulled from Okara sandy loam soil. High sugar content and vibrant natural red color.',
    price_per_unit: 110,
    unit: 'kg',
    farming_type: 'Organic',
    harvest_date: '2026-09-25',
    stock_limit: 160,
    in_stock: 145,
    image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    id: 7,
    farmer_id: 1,
    market_id: 1,
    name: 'Fresh Desi Podina & Tulsi (Mint & Basil)',
    category: 'Organic Herbs',
    description: 'Aromatic broadleaf desi mint and holy basil cut at sunrise. Essential for morning chutneys, salads, and raita.',
    price_per_unit: 60,
    unit: 'bunch',
    farming_type: 'Organic',
    harvest_date: '2026-09-25',
    stock_limit: 90,
    in_stock: 82,
    image_url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
  {
    id: 8,
    farmer_id: 1,
    market_id: 1,
    name: 'Fresh Green Ladyfinger (Bhindi)',
    category: 'Fresh Vegetables',
    description: 'Slender, tender dark green ladyfingers harvested young from Malir fields. Crisp snap with zero tough fibers.',
    price_per_unit: 160,
    unit: 'kg',
    farming_type: 'Organic',
    harvest_date: '2026-09-25',
    stock_limit: 80,
    in_stock: 74,
    image_url: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=800&q=80',
    status: 'active',
  },
];

export const initialOrders: Order[] = [
  {
    id: 1,
    order_code: 'ML-7842',
    customer_id: 3,
    farmer_id: 1,
    market_id: 1,
    pickup_date: '2026-09-26',
    pickup_timeslot: '06:30 AM - 08:00 AM',
    pickup_token: 'qrp_9f81a7b8e42c0192d6e3f4581c7b89',
    pickup_pin: '4921',
    order_status: 'placed',
    payment_method: 'Cash On Pickup',
    payment_status: 'pending_at_stall',
    online_amount_collected: 0.0,
    initial_total_due: 360,
    final_total_due: 360,
    inspection_notes: 'Reserved for morning harvest pickup at Stall #A-14 (Super Highway Sabzi Mandi).',
    created_at: '2026-09-23T06:15:00Z',
    items: [
      {
        id: 1,
        order_id: 1,
        product_id: 1,
        product_name: 'Organic Sindh Roma Tomatoes',
        unit_price: 140,
        unit: 'kg',
        reserved_qty: 2,
        accepted_qty: 2,
        rejected_qty: 0,
        subtotal: 280,
      },
      {
        id: 2,
        order_id: 1,
        product_id: 5,
        product_name: 'Fresh Malir Desi Palak (Spinach)',
        unit_price: 80,
        unit: 'bunch',
        reserved_qty: 1,
        accepted_qty: 1,
        rejected_qty: 0,
        subtotal: 80,
      },
    ],
  },
  {
    id: 2,
    order_code: 'ML-8109',
    customer_id: 3,
    farmer_id: 1,
    market_id: 1,
    pickup_date: '2026-09-26',
    pickup_timeslot: '07:00 AM - 08:30 AM',
    pickup_token: 'qrp_3c72b1d9a54e8031f7d2e9841b5a67',
    pickup_pin: '8153',
    order_status: 'ready',
    payment_method: 'Cash On Pickup',
    payment_status: 'pending_at_stall',
    online_amount_collected: 0.0,
    initial_total_due: 490,
    final_total_due: 490,
    inspection_notes: 'Ready in fresh produce basket at Stall #A-14 (Super Highway Sabzi Mandi).',
    created_at: '2026-09-23T07:00:00Z',
    items: [
      {
        id: 3,
        order_id: 2,
        product_id: 3,
        product_name: 'Desi Pasture Fresh Eggs',
        unit_price: 380,
        unit: 'dozen',
        reserved_qty: 1,
        accepted_qty: 1,
        rejected_qty: 0,
        subtotal: 380,
      },
      {
        id: 4,
        order_id: 2,
        product_id: 6,
        product_name: 'Farm Fresh Okara Red Carrots',
        unit_price: 110,
        unit: 'kg',
        reserved_qty: 1,
        accepted_qty: 1,
        rejected_qty: 0,
        subtotal: 110,
      },
    ],
  },
];

// ---------------------------------------------------------------------
// Relational In-Memory Store
// ---------------------------------------------------------------------
class DatabaseStore {
  users: User[] = [...initialUsers];
  markets: Market[] = [...initialMarkets];
  farmers: FarmerProfile[] = [...initialFarmers];
  products: Product[] = [...initialProducts];
  orders: Order[] = [...initialOrders];

  private nextOrderId = 3;
  private nextOrderItemId = 5;
  private nextProductId = 13;
  private nextMarketId = 3;
  private nextUserId = 7;
  private nextFarmerId = 4;

  // Customer / Vendor Self-Serve Onboarding
  registerCustomer(data: {
    name: string;
    email: string;
    password_hash: string;
    phone?: string;
    cnic?: string;
    organization_type?: 'household' | 'commercial_vendor';
  }): { user: User } {
    const cleanEmail = data.email.trim().toLowerCase();
    if (this.users.some((u) => u.email.trim().toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const nextId = this.nextUserId++;
    const isCommercial = data.organization_type === 'commercial_vendor';
    const newUser: User = {
      id: nextId,
      name: data.name.trim(),
      email: cleanEmail,
      password_hash: data.password_hash,
      role: 'customer',
      role_title: isCommercial ? 'Commercial Culinary Vendor' : 'Verified Household Patron',
      phone: data.phone?.trim() || '+92 (300) 0000000',
      cnic: data.cnic?.trim(),
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
      organization: isCommercial ? 'Commercial Food & Hospitality' : 'Household Market Patron',
      modules: ['markets_discovery', 'produce_catalog', 'my_preorders', 'agro_copilot'],
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    return { user: newUser };
  }

  // Farmer Self-Serve Onboarding & Stall Allocation
  registerFarmer(data: {
    name: string;
    email: string;
    password_hash: string;
    phone?: string;
    farm_name: string;
    cnic_id?: string;
    market_id: number;
    bio?: string;
    farming_practices?: FarmerProfile['farming_practices'];
    cutoff_hours?: number;
  }): { user: User; farmerProfile: FarmerProfile } {
    const cleanEmail = data.email.trim().toLowerCase();
    if (this.users.some((u) => u.email.trim().toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const nextId = this.nextUserId++;
    const nextFId = this.nextFarmerId++;
    const market = this.markets.find((m) => m.id === data.market_id) || this.markets[0];
    const stallLetter = String.fromCharCode(65 + ((nextFId - 1) % 6));
    const stallNum = Math.floor(10 + Math.random() * 89);
    const assignedStall = `Stall #${stallLetter}-${stallNum}`;

    const newUser: User = {
      id: nextId,
      name: data.name.trim(),
      email: cleanEmail,
      password_hash: data.password_hash,
      role: 'farmer',
      role_title: 'Independent Grower',
      phone: data.phone?.trim() || '+92 (300) 0000000',
      cnic: data.cnic_id?.trim(),
      avatar_url: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80`,
      organization: data.farm_name.trim(),
      modules: [
        'harvest_inventory',
        'stall_scanner',
        'markets_discovery',
        'produce_catalog',
        'analytics_reports',
        'agro_copilot',
      ],
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);

    const newFarmer: FarmerProfile = {
      id: nextFId,
      user_id: nextId,
      market_id: market.id,
      farm_name: data.farm_name.trim(),
      stall_number: assignedStall,
      stall_lat: market.latitude + (Math.random() - 0.5) * 0.002,
      stall_lng: market.longitude + (Math.random() - 0.5) * 0.002,
      bio:
        data.bio?.trim() ||
        `${data.farm_name.trim()} provides fresh regional organic harvests to the community with direct morning picking.`,
      farming_practices: data.farming_practices || 'Organic Certified',
      cutoff_hours: data.cutoff_hours && data.cutoff_hours > 0 ? data.cutoff_hours : 12,
      contact_phone: data.phone?.trim() || '+92 (300) 0000000',
      contact_email: data.email.trim().toLowerCase(),
      cnic: data.cnic_id?.trim(),
      banner_image:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      rating_avg: 5.0,
      is_verified: true,
    };

    this.users.push(newUser);
    this.farmers.push(newFarmer);

    return { user: newUser, farmerProfile: newFarmer };
  }

  // Pre-Order Reservation
  createReservation(payload: {
    customerId: number;
    farmerId: number;
    marketId: number;
    pickupDate: string;
    pickupTimeslot: string;
    paymentMethod: 'Cash On Pickup' | 'Contactless Tap at Stall';
    notes?: string;
    items: { productId: number; quantity: number }[];
  }): { success: boolean; order?: Order; error?: string } {
    const farmer = this.farmers.find((f) => f.id === payload.farmerId);
    if (!farmer) return { success: false, error: 'Farmer profile not found.' };

    const market = this.markets.find((m) => m.id === payload.marketId);
    if (!market) return { success: false, error: 'Market location not found.' };

    // [CRIT-01] Enforce Harvest Cutoff Buffer: (pickupDate + market.opening_time) - (farmer.cutoff_hours * 60 minutes)
    const openingTime = market.opening_time || '07:30:00';
    const marketOpenTimestamp = new Date(`${payload.pickupDate}T${openingTime}`).getTime();
    if (!isNaN(marketOpenTimestamp)) {
      const cutoffHours = farmer.cutoff_hours || 12;
      const cutoffDeadline = marketOpenTimestamp - cutoffHours * 60 * 60 * 1000;
      if (Date.now() > cutoffDeadline) {
        const deadlineDate = new Date(cutoffDeadline);
        const formattedDeadline = deadlineDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        return {
          success: false,
          error: `Pre-order window for this harvest has closed. ${farmer.farm_name} requires pre-orders at least ${cutoffHours} hours prior to market opening (${openingTime.slice(0, 5)}). The cutoff deadline was ${formattedDeadline}.`,
        };
      }
    }

    let initialTotal = 0;
    const orderItems: OrderItem[] = [];

    // Check inventory stock limits
    for (const item of payload.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product ID #${item.productId} was not found.` };
      }
      if (prod.in_stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${prod.name}. Available: ${prod.in_stock} ${prod.unit}, requested: ${item.quantity}.`,
        };
      }
    }

    // Deduct stock and assemble line items
    for (const item of payload.items) {
      const prod = this.products.find((p) => p.id === item.productId)!;
      prod.in_stock -= item.quantity;
      if (prod.in_stock <= 0) {
        prod.status = 'out_of_stock';
      }

      const lineTotal = +(prod.price_per_unit * item.quantity).toFixed(2);
      initialTotal += lineTotal;

      orderItems.push({
        id: this.nextOrderItemId++,
        order_id: this.nextOrderId,
        product_id: prod.id,
        product_name: prod.name,
        unit_price: prod.price_per_unit,
        unit: prod.unit,
        reserved_qty: item.quantity,
        accepted_qty: item.quantity,
        rejected_qty: 0,
        subtotal: lineTotal,
      });
    }

    initialTotal = +initialTotal.toFixed(2);

    // Generate unique 4-digit check-in PIN and token
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const token = `qrp_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const orderCode = `ML-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: this.nextOrderId++,
      order_code: orderCode,
      customer_id: payload.customerId,
      farmer_id: payload.farmerId,
      market_id: payload.marketId,
      pickup_date: payload.pickupDate,
      pickup_timeslot: payload.pickupTimeslot,
      pickup_token: token,
      pickup_pin: pin,
      order_status: 'placed',
      payment_method: payload.paymentMethod,
      payment_status: 'pending_at_stall',
      online_amount_collected: 0.0, // Strictly $0.00
      initial_total_due: initialTotal,
      final_total_due: initialTotal,
      inspection_notes: payload.notes || 'Reserved online for physical stall pickup.',
      created_at: new Date().toISOString(),
      items: orderItems,
    };

    this.orders.unshift(newOrder);
    return { success: true, order: newOrder };
  }

  // At-Stall Inspection / Rejection: Adjust rejected quantities and recalculate cash due
  inspectAndCompleteOrder(
    orderId: number,
    itemAdjustments: { itemId: number; acceptedQty: number; rejectedQty: number; rejectionNote?: string }[],
    inspectionNotes?: string
  ): { success: boolean; order?: Order; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    if (!order.items) return { success: false, error: 'Order items not found.' };

    let newFinalTotal = 0;

    for (const adj of itemAdjustments) {
      const lineItem = order.items.find((i) => i.id === adj.itemId);
      if (lineItem) {
        lineItem.accepted_qty = Math.max(0, adj.acceptedQty);
        lineItem.rejected_qty = Math.max(0, adj.rejectedQty);
        lineItem.rejection_note = adj.rejectionNote;
        lineItem.subtotal = +(lineItem.accepted_qty * lineItem.unit_price).toFixed(2);
        newFinalTotal += lineItem.subtotal;
      }
    }

    newFinalTotal = +newFinalTotal.toFixed(2);
    order.final_total_due = newFinalTotal;
    order.order_status = 'completed';
    order.payment_status = 'collected_at_stall';
    if (inspectionNotes) {
      order.inspection_notes = inspectionNotes;
    }

    return { success: true, order };
  }

  // Farmer status transition
  updateOrderStatus(
    orderId: number,
    status: 'placed' | 'accepted' | 'ready' | 'completed' | 'cancelled',
    reason?: string
  ): { success: boolean; order?: Order; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    // If cancelled, restore stock
    if (status === 'cancelled' && order.order_status !== 'cancelled' && order.items) {
      for (const item of order.items) {
        const prod = this.products.find((p) => p.id === item.product_id);
        if (prod) {
          prod.in_stock += item.reserved_qty;
          if (prod.status === 'out_of_stock' && prod.in_stock > 0) {
            prod.status = 'active';
          }
        }
      }
      order.payment_status = 'waived_cancelled';
      order.cancelled_reason = reason || 'Cancelled by stall manager/customer';
    }

    if (status === 'completed') {
      order.payment_status = 'collected_at_stall';
    }

    order.order_status = status;
    return { success: true, order };
  }

  // Add Product
  addProduct(data: Omit<Product, 'id'>): Product {
    const newProd: Product = {
      ...data,
      id: this.nextProductId++,
    };
    this.products.unshift(newProd);
    return newProd;
  }

  // Update Product
  updateProduct(id: number, data: Partial<Product>): Product | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...data };
    return this.products[idx];
  }

  // Update Farmer Profile (Stall location, cutoff hours, bio, practices)
  updateFarmerProfile(id: number, data: Partial<FarmerProfile>): FarmerProfile | null {
    const idx = this.farmers.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.farmers[idx] = { ...this.farmers[idx], ...data };
    return this.farmers[idx];
  }

  // Admin: Approve / Verify farmer
  toggleFarmerVerification(id: number, isVerified?: boolean): FarmerProfile | null {
    const farmer = this.farmers.find((f) => f.id === id);
    if (!farmer) return null;
    farmer.is_verified = isVerified !== undefined ? isVerified : !farmer.is_verified;
    return farmer;
  }

  // Admin: Create Farmers' Market
  createMarket(data: Omit<Market, 'id'>): Market {
    const newMarket: Market = {
      ...data,
      id: this.nextMarketId++,
    };
    this.markets.push(newMarket);
    return newMarket;
  }

  // Admin: Update Farmers' Market
  updateMarket(id: number, data: Partial<Market>): Market | null {
    const idx = this.markets.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.markets[idx] = { ...this.markets[idx], ...data };
    return this.markets[idx];
  }

  // Alias for reservation creation
  createOrder(payload: Parameters<DatabaseStore['createReservation']>[0]) {
    return this.createReservation(payload);
  }

  // Reset to initial seed state
  reset() {
    this.users = [...initialUsers];
    this.markets = [...initialMarkets];
    this.farmers = [...initialFarmers];
    this.products = [...initialProducts];
    this.orders = [...initialOrders];
    this.nextOrderId = 3;
    this.nextOrderItemId = 5;
    this.nextProductId = 13;
    this.nextMarketId = 3;
  }
}

export const db = new DatabaseStore();
