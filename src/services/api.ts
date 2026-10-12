import {
  User,
  Market,
  FarmerProfile,
  Product,
  Order,
  Review,
  Favorite,
  AdminDashboardStats,
  CategoryItem,
  AnnouncementItem,
  AdminReportsData,
  NotificationItem,
} from '../types.ts';

const TOKEN_KEY = 'marketlink_jwt_token';
const CURRENT_USER_KEY = 'marketlink_user';

export const getStoredToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || token === 'null' || token === 'undefined' || token === '""') {
    return null;
  }
  return token;
};

export const setStoredToken = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: response.ok ? text : `Server error (${response.status})` };
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; user: User; farmerProfile?: FarmerProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token, data.user);
    return data;
  },

  registerCustomer: async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    organization_type?: 'household' | 'commercial_vendor';
  }) => {
    const data = await apiFetch<{ token: string; user: User; message: string }>('/api/auth/register-vendor', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(data.token, data.user);
    return data;
  },

  registerVendor: async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    organization_type?: 'household' | 'commercial_vendor';
  }) => {
    const data = await apiFetch<{ token: string; user: User; message: string }>('/api/auth/register-vendor', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(data.token, data.user);
    return data;
  },

  registerFarmer: async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    farm_name: string;
    cnic_id?: string;
    country?: string;
    province?: string;
    city?: string;
    market_id: number;
    bio?: string;
    farming_practices?: string;
    cutoff_hours?: number;
  }) => {
    const data = await apiFetch<{ token: string; user: User; farmerProfile: FarmerProfile; message: string }>('/api/auth/register-farmer', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setStoredToken(data.token, data.user);
    return data;
  },

  getCurrentUser: () => apiFetch<{ user: User; farmerProfile?: FarmerProfile }>('/api/auth/me'),

  getUserProfile: () => apiFetch<{ user: User }>('/api/auth/profile'),

  updateUserProfile: async (payload: {
    name?: string;
    phone?: string;
    cnic?: string;
    organization?: string;
    avatar_url?: string;
    country?: string;
    province?: string;
    city?: string;
    farm_name?: string;
    stall_number?: string;
    bio?: string;
    cutoff_hours?: number;
    newPassword?: string;
  }) => {
    const res = await apiFetch<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const currentToken = getStoredToken();
    if (currentToken && res.user) {
      setStoredToken(currentToken, res.user);
    }
    return res;
  },

  // Markets
  getMarkets: (params?: { country?: string; province?: string; city?: string }) => {
    const query = new URLSearchParams();
    if (params?.country) query.set('country', params.country);
    if (params?.province) query.set('province', params.province);
    if (params?.city) query.set('city', params.city);
    const qStr = query.toString();
    return apiFetch<Market[]>(`/api/markets${qStr ? `?${qStr}` : ''}`);
  },
  getMarket: (id: number) => apiFetch<Market>(`/api/markets/${id}`),
  createMarket: (marketData: Partial<Market>) =>
    apiFetch<Market>('/api/admin/markets', {
      method: 'POST',
      body: JSON.stringify(marketData),
    }),
  updateMarket: (id: number, data: Partial<Market>) =>
    apiFetch<Market>(`/api/admin/markets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Farmers
  getFarmers: () => apiFetch<FarmerProfile[]>('/api/farmers'),
  getFarmer: (id: number) => apiFetch<FarmerProfile & { market: Market; products: Product[] }>(`/api/farmers/${id}`),
  updateFarmerStall: (
    id: number,
    data: { stall_number?: string; cutoff_hours?: number; bio?: string; farming_practices?: string; contact_phone?: string }
  ) =>
    apiFetch<FarmerProfile>(`/api/farmers/${id}/stall`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  verifyFarmer: (id: number, is_verified: boolean) =>
    apiFetch<FarmerProfile>(`/api/admin/farmers/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ is_verified }),
    }),

  // Products
  getProducts: (params?: { marketId?: number; farmerId?: number; category?: string; farmingType?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.marketId) query.set('marketId', params.marketId.toString());
    if (params?.farmerId) query.set('farmerId', params.farmerId.toString());
    if (params?.category) query.set('category', params.category);
    if (params?.farmingType) query.set('farmingType', params.farmingType);
    if (params?.search) query.set('search', params.search);
    return apiFetch<Product[]>(`/api/products?${query.toString()}`);
  },

  getPriceTrends: (productId: string | number) =>
    apiFetch<{ productId: string | number; productName: string; history: { day: string; price: number }[] }>(
      `/api/products/${productId}/price-trends`
    ),

  addProduct: (product: Partial<Product>) =>
    apiFetch<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  updateProduct: (id: number, data: Partial<Product>) =>
    apiFetch<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleProductSoldOut: (id: number | string) =>
    apiFetch<{ message: string; product: Product }>(`/api/products/${id}/toggle-sold-out`, {
      method: 'PATCH',
    }),

  applyWeeklyTemplate: () =>
    apiFetch<{ message: string; count: number; products: Product[] }>('/api/products/apply-template', {
      method: 'POST',
    }),

  updateProductTemplate: (id: number | string, data: { isTemplateActive?: boolean; defaultStockQuantity?: number }) =>
    apiFetch<{ message: string; product: Product }>(`/api/products/${id}/template`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Orders
  reserveOrder: (payload: {
    farmerId: number;
    marketId: number;
    pickupDate: string;
    pickupTimeslot: string;
    paymentMethod: 'Cash On Pickup' | 'Contactless Tap at Stall';
    notes?: string;
    items: { productId: number; quantity: number }[];
  }) =>
    apiFetch<{ message: string; order: Order }>('/api/orders/reserve', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getOrders: () => apiFetch<Order[]>('/api/orders'),
  getMyOrders: () => apiFetch<Order[]>('/api/orders/me'),
  getFarmerOrders: () => apiFetch<Order[]>('/api/orders/farmer'),
  getOrder: (id: number | string) => apiFetch<Order>(`/api/orders/${id}`),

  acceptOrder: (id: number | string) =>
    apiFetch<{ message: string; order: Order }>(`/api/orders/${id}/accept`, {
      method: 'PATCH',
    }),

  declineOrder: (id: number | string, reason?: string) =>
    apiFetch<{ message: string; order: Order }>(`/api/orders/${id}/decline`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  markOrderReady: (id: number | string) =>
    apiFetch<{ message: string; order: Order }>(`/api/orders/${id}/ready`, {
      method: 'PATCH',
    }),

  getFarmerInsights: () =>
    apiFetch<{
      totalOrders: number;
      pendingOrders: number;
      completedOrders: number;
      totalRevenue: number;
      topSellingProducts: {
        id: string;
        name: string;
        category: string;
        unit: string;
        price: number;
        image_url: string;
        totalQuantitySold: number;
        totalRevenue: number;
      }[];
    }>('/api/farmer/insights'),

  modifyOrder: (
    id: number | string,
    data: {
      items?: { productId: number | string; quantity: number }[];
      pickupDate?: string;
      pickupTimeSlot?: string;
      pickupTimeslot?: string;
    }
  ) =>
    apiFetch<{ message: string; order: Order }>(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  cancelOrder: (id: number | string, reason?: string) =>
    apiFetch<{ message: string; order: Order }>(`/api/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  verifyPin: (pin: string) => apiFetch<Order>(`/api/orders/verify-pin/${encodeURIComponent(pin)}`),

  updateOrderStatus: (id: number | string, status: Order['order_status'], reason?: string) =>
    apiFetch<{ message: string; order: Order }>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    }),

  submitStallInspection: (
    id: number | string,
    adjustments: { itemId: number; acceptedQty: number; rejectedQty: number; rejectionNote?: string }[],
    inspectionNotes?: string
  ) =>
    apiFetch<{ message: string; order: Order }>(`/api/orders/${id}/stall-inspection`, {
      method: 'POST',
      body: JSON.stringify({ adjustments, inspectionNotes }),
    }),

  sendEmailSlip: (id: number | string, email?: string) =>
    apiFetch<{ success: boolean; message: string; pickup_pin: string; order_code: string }>(`/api/orders/${id}/email-slip`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  emailVoucher: (id: number | string, email?: string) =>
    apiFetch<{ success: boolean; message: string; pickup_pin: string; order_code: string }>(`/api/orders/${id}/email-slip`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Reviews
  getReviewsForProduct: (productId: number | string) =>
    apiFetch<Review[]>(`/api/reviews/product/${productId}`),

  getFarmerReviews: () =>
    apiFetch<Review[]>('/api/reviews/farmer'),

  createReview: (payload: { productId: number | string; rating: number; comment: string }) =>
    apiFetch<{ message: string; review: Review }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  respondToReview: (id: string, farmerResponse: string) =>
    apiFetch<{ message: string; review: Review }>(`/api/reviews/${id}/response`, {
      method: 'PATCH',
      body: JSON.stringify({ farmerResponse }),
    }),

  // Favorites
  getFavorites: () => apiFetch<Favorite[]>('/api/favorites/me'),

  addFavorite: (payload: { productId?: number | string; farmerId?: number | string }) =>
    apiFetch<{ message: string; favorite: Favorite }>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  removeFavorite: (id: string | number) =>
    apiFetch<{ message: string }>(`/api/favorites/${id}`, {
      method: 'DELETE',
    }),

  // Geo distance
  getDistances: async (
    lat: number,
    lng: number,
    fallbackMarkets?: Market[]
  ): Promise<{ market_id: number; market_name: string; distance_km: number; distance_miles: number; estimated_driving_mins: number }[]> => {
    try {
      return await apiFetch<{ market_id: number; market_name: string; distance_km: number; distance_miles: number; estimated_driving_mins: number }[]>(
        `/api/geo/distance?lat=${lat}&lng=${lng}`
      );
    } catch {
      // Graceful local Haversine fallback to ensure zero runtime disruptions
      const activeMarkets = fallbackMarkets && fallbackMarkets.length > 0 ? fallbackMarkets : [];
      const R = 6371;
      return activeMarkets.map((m) => {
        const dLat = ((m.latitude - lat) * Math.PI) / 180;
        const dLng = ((m.longitude - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((m.latitude * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = +(R * c).toFixed(2);
        const distanceMiles = +(distanceKm * 0.621371).toFixed(2);
        return {
          market_id: m.id,
          market_name: m.name,
          distance_km: distanceKm,
          distance_miles: distanceMiles,
          estimated_driving_mins: Math.max(1, Math.ceil(distanceKm * 2.2)),
        };
      });
    }
  },

  // AI Agro-Concierge
  askConcierge: (message: string) =>
    apiFetch<{ reply: string }>('/api/ai/concierge', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // User Management & RBAC
  getUsers: () => apiFetch<User[]>('/api/users'),
  createUser: (payload: Partial<User> & { password?: string }) =>
    apiFetch<{ message: string; user: User }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateUser: (id: number | string, payload: Partial<User> & { password?: string }) =>
    apiFetch<{ message: string; user: User }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteUser: (id: number | string) =>
    apiFetch<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    }),

  // Admin Dashboard & Operations API
  getAdminDashboardStats: () =>
    apiFetch<AdminDashboardStats>('/api/admin/dashboard'),

  getAdminUsers: (role?: 'farmer' | 'customer' | 'admin' | string) => {
    const query = role ? `?role=${role}` : '';
    return apiFetch<User[]>(`/api/admin/users${query}`);
  },

  approveUser: (id: number | string) =>
    apiFetch<{ message: string; user: User }>(`/api/admin/users/${id}/approve`, {
      method: 'PATCH',
    }),

  suspendUser: (id: number | string) =>
    apiFetch<{ message: string; user: User }>(`/api/admin/users/${id}/suspend`, {
      method: 'PATCH',
    }),

  activateUser: (id: number | string) =>
    apiFetch<{ message: string; user: User }>(`/api/admin/users/${id}/activate`, {
      method: 'PATCH',
    }),

  createAdminMarket: (marketData: Partial<Market>) =>
    apiFetch<Market>('/api/admin/markets', {
      method: 'POST',
      body: JSON.stringify(marketData),
    }),

  patchMarket: (id: number | string, data: Partial<Market>) =>
    apiFetch<Market>(`/api/admin/markets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMarket: (id: number | string) =>
    apiFetch<{ message: string }>(`/api/admin/markets/${id}`, {
      method: 'DELETE',
    }),

  getAdminReviews: () =>
    apiFetch<Review[]>('/api/admin/reviews'),

  deleteAdminReview: (id: string | number) =>
    apiFetch<{ message: string }>(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
    }),

  getAdminProducts: () =>
    apiFetch<Product[]>('/api/admin/products'),

  deleteAdminProduct: (id: string | number) =>
    apiFetch<{ message: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    }),

  getAdminReports: () =>
    apiFetch<AdminReportsData>('/api/admin/reports'),

  getCategories: () =>
    apiFetch<CategoryItem[]>('/api/admin/categories'),

  createCategory: (name: string) =>
    apiFetch<{ message: string; category: CategoryItem }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  deleteCategory: (id: string) =>
    apiFetch<{ message: string }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }),

  getAnnouncements: () =>
    apiFetch<AnnouncementItem[]>('/api/announcements'),

  createAnnouncement: (message: string) =>
    apiFetch<{ message: string; announcement: AnnouncementItem }>('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  deleteAnnouncement: (id: string) =>
    apiFetch<{ message: string }>(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
    }),

  // In-App Notifications API
  getNotifications: () =>
    apiFetch<NotificationItem[]>('/api/notifications/me'),

  markNotificationRead: (id: string) =>
    apiFetch<{ message: string; notification: NotificationItem }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllNotificationsRead: () =>
    apiFetch<{ message: string }>('/api/notifications/read-all', {
      method: 'PATCH',
    }),

  resetDemo: () => apiFetch<{ message: string }>('/api/system/reset-demo', { method: 'POST' }),
};
