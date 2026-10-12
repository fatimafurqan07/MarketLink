/**
 * Core Type Definitions for MarketLink (eGreen Basket) Application
 */

export type AppModule = 
  | 'markets_discovery'
  | 'produce_catalog'
  | 'my_preorders'
  | 'order_history'
  | 'favorites'
  | 'harvest_inventory'
  | 'stall_scanner'
  | 'agro_copilot'
  | 'user_management'
  | 'analytics_reports';

export type UserRole = 'admin' | 'farmer' | 'customer';
export type UserStatus = 'active' | 'suspended' | 'pending_approval';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  role_title?: string;
  phone: string;
  cnic?: string;
  country?: string;
  province?: string;
  city?: string;
  avatar_url?: string;
  stall_number?: string;
  farm_name?: string;
  organization?: string;
  modules?: AppModule[];
  isApproved?: boolean;
  isSuspended?: boolean;
  status?: UserStatus;
}

export interface MarketStallSummary {
  id: number;
  farm_name: string;
  stall_number: string;
  stall_lat: number;
  stall_lng: number;
  farming_practices: string;
  rating_avg: number;
}

export interface Market {
  id: number;
  name: string;
  slug: string;
  location_address: string;
  country?: string;
  province?: string;
  city?: string;
  latitude: number;
  longitude: number;
  plus_code?: string;
  gps_coords?: string;
  stall_bays?: string;
  operating_days: string;
  timings?: string;
  opening_time: string;
  closing_time: string;
  description: string;
  parking_info: string;
  image_url: string;
  is_active: boolean;
  stall_count?: number;
  stalls?: MarketStallSummary[];
}

export type FarmingPractice = 
  | 'Organic Certified' 
  | 'Transitional Organic' 
  | 'Conventional Eco-Safe';

export interface FarmerProfile {
  id: number;
  user_id: number;
  market_id: number;
  farm_name: string;
  country?: string;
  province?: string;
  city?: string;
  stall_number: string;
  stall_lat?: number;
  stall_lng?: number;
  bio?: string;
  farming_practices?: FarmingPractice;
  cutoff_hours?: number;
  contact_phone?: string;
  contact_email?: string;
  banner_image?: string;
  rating_avg?: number;
  is_verified?: boolean;
  market_name?: string;
  market_address?: string;
  product_count?: number;
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

export type ProductStatus = 'active' | 'out_of_stock' | 'archived';

export interface Product {
  id: number;
  farmer_id: number;
  market_id: number;
  name: string;
  category: ProductCategory;
  description: string;
  price_per_unit: number;
  price?: number;
  unit: ProductUnit;
  farming_type: 'Organic' | 'Conventional';
  harvest_date: string;
  stock_limit: number;
  in_stock: number;
  image_url: string;
  status: ProductStatus;
  is_sold_out?: boolean;
  isSoldOut?: boolean;
  is_template_active?: boolean;
  isTemplateActive?: boolean;
  default_stock_quantity?: number;
  defaultStockQuantity?: number;
  farmer_name?: string;
  stall_number?: string;
  cutoff_hours?: number;
  market_name?: string;
  market_opening?: string;
}

export interface OrderItem {
  id: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  unit: string;
  reserved_qty: number;
  accepted_qty: number;
  rejected_qty: number;
  rejection_note?: string;
  subtotal: number;
  image_url?: string;
}

export type OrderStatus = 'placed' | 'accepted' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'Cash On Pickup' | 'Contactless Tap at Stall';
export type PaymentStatus = 'pending_at_stall' | 'collected_at_stall' | 'waived_cancelled';

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
  order_status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  online_amount_collected: number; // Always 0.00
  initial_total_due: number;
  final_total_due: number;
  inspection_notes?: string;
  cancelled_reason?: string;
  created_at: string;
  items?: OrderItem[];
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  farm_name?: string;
  stall_number?: string;
  market_name?: string;
  market_address?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  _id?: string;
  product_id: string;
  farmer_id: string;
  customer_id: string;
  customer_name: string;
  customer_avatar?: string;
  rating: number;
  comment: string;
  farmer_response?: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  _id?: string;
  customer_id: string;
  farmer_id?: string;
  product_id?: string;
  product?: Product;
  farmer?: FarmerProfile;
  created_at: string;
}

export interface AdminDashboardStats {
  totalFarmers: number;
  totalCustomers: number;
  totalMarkets: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals?: number;
  suspendedUsers?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  createdAt?: string;
}

export interface AnnouncementItem {
  id: string;
  message: string;
  createdAt: string;
}

export interface MarketReportItem {
  marketId: string;
  marketName: string;
  city: string;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface TopFarmerReportItem {
  farmerId: string;
  farmerName: string;
  farmName: string;
  stallNumber: string;
  orderCount: number;
  completedOrderCount: number;
  totalRevenue: number;
  productCount: number;
}

export interface AdminReportsData {
  marketReports: MarketReportItem[];
  topFarmers: TopFarmerReportItem[];
  totalPlatformOrders: number;
  totalPlatformRevenue: number;
}

export type NotificationType =
  | 'order_placed'
  | 'order_accepted'
  | 'order_ready'
  | 'order_cancelled';

export interface NotificationItem {
  id: string;
  _id?: string;
  recipientId: string;
  message: string;
  type: NotificationType;
  orderId?: string;
  orderCode?: string;
  isRead: boolean;
  createdAt: string;
}
