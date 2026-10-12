import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ProduceCatalog } from './components/ProduceCatalog.tsx';
import { MarketMap } from './components/MarketMap.tsx';
import { CustomerPassesView } from './components/CustomerPassesView.tsx';
import { HarvestInventoryView } from './components/HarvestInventoryView.tsx';
import { StallScannerView } from './components/StallScannerView.tsx';
import { AgroCopilotView } from './components/AgroCopilotView.tsx';
import { UserManagementView } from './components/UserManagementView.tsx';
import { AdminDashboardView } from './components/AdminDashboardView.tsx';
import { AnalyticsReportsView } from './components/AnalyticsReportsView.tsx';
import { OrderHistoryView } from './components/OrderHistoryView.tsx';
import { FavoritesView } from './components/FavoritesView.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { DigitalPickupPassModal } from './components/DigitalPickupPassModal.tsx';
import { Header } from './components/Header.tsx';
import { GlobalNavbar } from './components/GlobalNavbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { Footer } from './components/Footer.tsx';
import { AboutView } from './components/AboutView.tsx';
import { ContactView } from './components/ContactView.tsx';
import { CountryWelcomeModal } from './components/common/CountryWelcomeModal.tsx';
import { useCountry } from './i18n/CountryContext.tsx';
import { EditProfileModal } from './components/EditProfileModal.tsx';
import { LiveCommunityTicker } from './components/LiveCommunityTicker.tsx';
import { FloatingScrollComments } from './components/common/FloatingScrollComments.tsx';
import { MandiProblemSolver } from './components/common/MandiProblemSolver.tsx';
import { User, Market, FarmerProfile, Product, Order, CartItem, AppModule, Favorite, AnnouncementItem, NotificationItem } from './types.ts';
import { api, clearStoredAuth, getStoredToken, setStoredToken } from './services/api.ts';
import {
  Store,
  ShoppingBag,
  Ticket,
  Package,
  QrCode,
  Sparkles,
  Users,
  BarChart3,
  History,
  Heart,
  Megaphone,
} from 'lucide-react';

const MODULE_TITLES: Record<AppModule, { title: string; subtitle: string; icon: React.FC<{ className?: string }> }> = {
  markets_discovery: {
    title: 'Mandi & Stalls Map',
    subtitle: 'Find local Mandi markets, stall locations & timings',
    icon: Store,
  },
  produce_catalog: {
    title: 'Fresh Sabzi & Fruits',
    subtitle: 'Order fresh farm harvest for pickup (Rs. 0 Advance Fee)',
    icon: ShoppingBag,
  },
  my_preorders: {
    title: 'My Pickup Passes',
    subtitle: 'Show your 4-digit code at the stall to collect and pay cash',
    icon: Ticket,
  },
  order_history: {
    title: 'My Orders',
    subtitle: 'View previous orders, change items, or cancel',
    icon: History,
  },
  favorites: {
    title: 'Saved Favorites',
    subtitle: 'Your favorite farmers and fresh items',
    icon: Heart,
  },
  harvest_inventory: {
    title: 'My Crop Stock & Rates',
    subtitle: 'Update daily produce stock, prices (Rs/kg), and availability',
    icon: Package,
  },
  stall_scanner: {
    title: 'Customer Pickup & Scanner',
    subtitle: 'Enter customer 4-digit code or scan QR to complete order',
    icon: QrCode,
  },
  agro_copilot: {
    title: 'Agro-Copilot Assistant',
    subtitle: 'Ask questions in English or Roman Urdu about rates & markets',
    icon: Sparkles,
  },
  user_management: {
    title: 'Admin Dashboard',
    subtitle: 'Manage users, Mandi markets, reviews & announcements',
    icon: Users,
  },
  analytics_reports: {
    title: 'Sales & Market Reports',
    subtitle: 'Total orders, cash sales, and popular items',
    icon: BarChart3,
  },
};

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentFarmerProfile, setCurrentFarmerProfile] = useState<FarmerProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'customer_register' | 'farmer_register'>('signin');
  const [activeModule, setActiveModule] = useState<AppModule>('markets_discovery');

  // Application Data State
  const [markets, setMarkets] = useState<Market[]>([]);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // Region & Country Context
  const { countryCode, province, city, filterMarketsByRegion, filterProductsByRegion, filterFarmersByRegion } = useCountry();

  // Region-filtered collections
  const regionFilteredMarkets = React.useMemo(() => {
    return filterMarketsByRegion(markets);
  }, [markets, countryCode, province, city, filterMarketsByRegion]);

  const regionFilteredProducts = React.useMemo(() => {
    return filterProductsByRegion(products, regionFilteredMarkets);
  }, [products, regionFilteredMarkets, countryCode, province, city, filterProductsByRegion]);

  const regionFilteredFarmers = React.useMemo(() => {
    return filterFarmersByRegion(farmers, regionFilteredMarkets);
  }, [farmers, regionFilteredMarkets, countryCode, province, city, filterFarmersByRegion]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activePassModalOrders, setActivePassModalOrders] = useState<Order[]>([]);
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<number | string | null>(null);
  const [selectedFarmerFilter, setSelectedFarmerFilter] = useState<number | string | null>(null);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('All');
  const [activeLandingEntity, setActiveLandingEntity] = useState<'vendor' | 'farmer'>('vendor');
  const [currentView, setCurrentView] = useState<'main' | 'about' | 'contact'>('main');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Helper to navigate between main, about, and contact
  const navigateTo = (view: 'main' | 'about' | 'contact') => {
    setCurrentView(view);
    const targetPath = view === 'about' ? '/about' : view === 'contact' ? '/contact' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to open Auth modal at specific tab
  const handleOpenAuth = (tab: 'signin' | 'customer_register' | 'farmer_register' = 'signin') => {
    setAuthInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  // Load public catalog data on app mount
  const loadMarketData = async () => {
    try {
      const [mkts, frms, prods, anns] = await Promise.all([
        api.getMarkets(),
        api.getFarmers(),
        api.getProducts(),
        api.getAnnouncements().catch(() => [] as AnnouncementItem[]),
      ]);
      setMarkets(Array.isArray(mkts) ? mkts : []);
      setFarmers(Array.isArray(frms) ? frms : []);
      setProducts(Array.isArray(prods) ? prods : []);
      setAnnouncements(Array.isArray(anns) ? anns : []);
    } catch (err) {
      console.warn('Notice: market catalog data temporarily unavailable:', err);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await api.getFavorites();
      setFavorites(Array.isArray(favs) ? favs : []);
    } catch {
      // not authenticated or temporary
    }
  };

  const handleToggleFavoriteProduct = async (productId: string | number) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    const strId = productId.toString();
    const existing = favorites.find((f) => f.product_id?.toString() === strId);
    if (existing) {
      try {
        await api.removeFavorite(existing.id);
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      } catch (err) {
        console.warn('Failed to remove favorite:', err);
      }
    } else {
      try {
        const res = await api.addFavorite({ productId });
        setFavorites((prev) => [res.favorite, ...prev]);
      } catch (err) {
        console.warn('Failed to add favorite:', err);
      }
    }
  };

  const handleToggleFavoriteFarmer = async (farmerId: string | number) => {
    if (!currentUser) {
      handleOpenAuth('signin');
      return;
    }
    const strId = farmerId.toString();
    const existing = favorites.find((f) => f.farmer_id?.toString() === strId);
    if (existing) {
      try {
        await api.removeFavorite(existing.id);
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      } catch (err) {
        console.warn('Failed to remove favorite:', err);
      }
    } else {
      try {
        const res = await api.addFavorite({ farmerId });
        setFavorites((prev) => [res.favorite, ...prev]);
      } catch (err) {
        console.warn('Failed to add favorite:', err);
      }
    }
  };

  const handleRemoveFavoriteById = async (favId: string) => {
    try {
      await api.removeFavorite(favId);
      setFavorites((prev) => prev.filter((f) => f.id !== favId));
    } catch (err) {
      console.warn('Failed to remove favorite:', err);
    }
  };

  const refreshOrders = async () => {
    try {
      const ords = await api.getOrders();
      setOrders(Array.isArray(ords) ? ords : []);
    } catch (err) {
      console.warn('Notice: orders list temporarily unavailable:', err);
    }
  };

  const refreshProducts = async () => {
    try {
      const prods = await api.getProducts();
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.warn('Notice: products list temporarily unavailable:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifs = await api.getNotifications();
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch {
      // not logged in or network temporary
    }
  };

  // URL Path & Session State Re-hydration on Refresh
  useEffect(() => {
    // Initial route check
    const path = window.location.pathname.toLowerCase();
    if (path === '/about' || path.startsWith('/about')) {
      setCurrentView('about');
    } else if (path === '/contact' || path.startsWith('/contact')) {
      setCurrentView('contact');
    } else {
      setCurrentView('main');
    }

    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      if (p === '/about' || p.startsWith('/about')) {
        setCurrentView('about');
      } else if (p === '/contact' || p.startsWith('/contact')) {
        setCurrentView('contact');
      } else {
        setCurrentView('main');
      }
    };
    window.addEventListener('popstate', handlePopState);

    const hydrateSession = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const res = await api.getCurrentUser();
          if (res?.user) {
            if (res.farmerProfile) {
              setCurrentFarmerProfile(res.farmerProfile);
            }
            handleLoginSuccess(res.user, res.farmerProfile);
          } else {
            clearStoredAuth();
          }
        } catch {
          // Token is expired, invalid or revoked - cleanly clear and stay in public mode
          clearStoredAuth();
          setCurrentUser(null);
          setCurrentFarmerProfile(null);
        }
      }
    };

    hydrateSession();
    loadMarketData();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Periodic Notification Polling for Logged-In Users
  useEffect(() => {
    if (!currentUser) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 12000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // When a user successfully logs in
  const handleLoginSuccess = async (user: User, farmerProfile?: FarmerProfile) => {
    setCurrentUser(user);
    if (farmerProfile) {
      setCurrentFarmerProfile(farmerProfile);
    }
    setIsAuthModalOpen(false);

    loadMarketData();
    loadFavorites();
    loadNotifications();

    // Pick first permitted module as default active view
    const userModules = user.modules || [];
    if (userModules.length > 0) {
      if (user.role === 'admin' && userModules.includes('user_management')) {
        setActiveModule('user_management');
      } else if (user.role === 'farmer' && userModules.includes('harvest_inventory')) {
        setActiveModule('harvest_inventory');
      } else {
        setActiveModule(userModules[0]);
      }
    } else {
      setActiveModule('markets_discovery');
    }

    try {
      const ords = await api.getOrders();
      setOrders(ords);
    } catch (err) {
      console.warn('Notice: user orders temporarily unavailable:', err);
    }
  };

  // Sign out and clear session back to Public Discovery Mode
  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setCurrentFarmerProfile(null);
    setFavorites([]);
    setNotifications([]);
    setCart([]);
    setIsCartOpen(false);
    setActivePassModalOrders([]);
    setIsMobileSidebarOpen(false);
  };

  // Cart Management
  const handleAddToCart = (product: Product, quantity: number) => {
    const targetQty = Math.max(1, quantity || 1);
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        // Ensure exact specified quantity is set rather than endlessly multiplying unit totals
        updated[existingIdx] = {
          ...updated[existingIdx],
          product,
          quantity: targetQty,
        };
        return updated;
      }
      return [...prev, { product, quantity: targetQty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrdersSuccess = (newOrders: Order[]) => {
    setOrders((prev) => [...newOrders, ...prev]);
    setActivePassModalOrders(newOrders);
    loadNotifications();
  };

  const handleOrderSuccess = (order: Order) => {
    handleOrdersSuccess([order]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const completedProductIds = new Set<string>(
    orders
      .filter((o) => o.order_status === 'completed')
      .flatMap((o) => (o.items || []).map((it) => it.product_id?.toString()))
      .filter(Boolean) as string[]
  );

  const favoriteProductIds = new Set<string>(
    favorites.map((f) => f.product_id?.toString()).filter(Boolean) as string[]
  );

  const favoriteFarmerIds = new Set<string>(
    favorites.map((f) => f.farmer_id?.toString()).filter(Boolean) as string[]
  );

  // Active pass count (uncollected/uncompleted orders)
  const activeUncollectedOrders = orders.filter(
    (o) => o.order_status !== 'completed' && o.order_status !== 'cancelled'
  );
  const activePassCount = activeUncollectedOrders.length || activePassModalOrders.length;

  const handleOpenActivePasses = () => {
    if (orders.length > 0) {
      setActivePassModalOrders(orders);
    } else if (activePassModalOrders.length > 0) {
      // already set
    } else {
      handleOpenAuth('signin');
    }
  };

  // Scroll helper to smoothly scroll to any landing page anchor
  const scrollToSection = (id: string) => {
    if (currentView !== 'main') {
      navigateTo('main');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // IntersectionObserver to trigger 'is-revealed' class logic when HowItWorks container reaches viewport
  const howItWorksSectionRef = React.useRef<HTMLDivElement>(null);
  const [isHowItWorksRevealed, setIsHowItWorksRevealed] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser || currentView !== 'main') return;

    const el = howItWorksSectionRef.current || document.getElementById('how-it-works-section');
    if (!el) return;

    // Immediate check if element is already within viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      setIsHowItWorksRevealed(true);
      el.classList.add('will-animate');
      requestAnimationFrame(() => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsHowItWorksRevealed(true);
            const targetEl = entry.target as HTMLElement;
            targetEl.classList.add('will-animate');
            requestAnimationFrame(() => {
              targetEl.classList.add('is-revealed');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [currentUser, currentView]);

  // Wrap the 4 main landing page sections in useMemo structure to minimize scroll-triggered re-renders on lower-end devices
  const memoizedHeroSection = React.useMemo(() => (
    <HeroSection
      onExploreMap={() => scrollToSection('markets-map-section')}
      onBrowseCatalog={() => scrollToSection('produce-catalog-section')}
      onRegisterVendor={() => handleOpenAuth('customer_register')}
      onClaimStall={() => handleOpenAuth('farmer_register')}
      onAccessFarmerTerminal={() => handleOpenAuth('signin')}
    />
  ), []);

  const memoizedMarketMapSection = React.useMemo(() => (
    <div id="markets-map-section" className="scroll-mt-20 py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <MarketMap
        markets={regionFilteredMarkets}
        farmers={regionFilteredFarmers}
        onSelectFarmer={(fId) => {
          setSelectedFarmerFilter(fId);
          scrollToSection('produce-catalog-section');
        }}
        onFilterMarket={(mId) => {
          setSelectedMarketFilter(mId);
        }}
        favoriteFarmerIds={favoriteFarmerIds}
        onToggleFavoriteFarmer={handleToggleFavoriteFarmer}
      />
    </div>
  ), [regionFilteredMarkets, regionFilteredFarmers, favoriteFarmerIds]);

  const memoizedProduceCatalogSection = React.useMemo(() => (
    <ProduceCatalog
      products={regionFilteredProducts}
      markets={regionFilteredMarkets}
      farmers={regionFilteredFarmers}
      onAddToCart={handleAddToCart}
      selectedMarketFilter={selectedMarketFilter}
      onClearMarketFilter={() => setSelectedMarketFilter(null)}
      selectedFarmerFilter={selectedFarmerFilter}
      onClearFarmerFilter={() => setSelectedFarmerFilter(null)}
      searchQuery={catalogSearchQuery}
      onSearchChange={setCatalogSearchQuery}
      selectedCategory={selectedCatalogCategory}
      onSelectCategory={setSelectedCatalogCategory}
      favoriteProductIds={favoriteProductIds}
      onToggleFavoriteProduct={handleToggleFavoriteProduct}
      currentUser={currentUser}
      completedProductIds={completedProductIds}
    />
  ), [
    regionFilteredProducts,
    regionFilteredMarkets,
    regionFilteredFarmers,
    selectedMarketFilter,
    selectedFarmerFilter,
    catalogSearchQuery,
    selectedCatalogCategory,
    favoriteProductIds,
    currentUser,
    completedProductIds,
    cart,
  ]);

  const memoizedHowItWorksSection = React.useMemo(() => (
    <div
      ref={howItWorksSectionRef}
      id="how-it-works-container"
      className={`how-it-works-reveal-container contain-paint-layout transition-all duration-700 ${
        isHowItWorksRevealed ? 'is-revealed will-animate' : ''
      }`}
    >
      <HowItWorks isRevealed={isHowItWorksRevealed} />
    </div>
  ), [isHowItWorksRevealed]);

  // =========================================================================
  // 1. PUBLIC DISCOVERY MODE (Default Root State for Unauthenticated Visitors)
  // =========================================================================
  if (!currentUser) {

    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#faf6ee] flex flex-col selection:bg-emerald-100 relative">
        <CountryWelcomeModal />
        {/* 1. Global Navigation Bar (Top Bar Contract) */}
        <GlobalNavbar
          markets={regionFilteredMarkets}
          selectedMarketId={selectedMarketFilter}
          onSelectMarket={(mId) => {
            setSelectedMarketFilter(mId);
            scrollToSection('produce-catalog-section');
          }}
          selectedCategory={selectedCatalogCategory}
          onSelectCategory={(cat) => {
            setSelectedCatalogCategory(cat);
            scrollToSection('produce-catalog-section');
          }}
          onBrowseProduce={() => scrollToSection('produce-catalog-section')}
          onFindStalls={() => scrollToSection('markets-map-section')}
          onHowItWorks={() => scrollToSection('how-it-works-section')}
          onAboutUs={() => navigateTo('about')}
          onContactUs={() => navigateTo('contact')}
          onOpenAuth={(tab) => handleOpenAuth(tab || 'signin')}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={totalCartCount}
          onTriggerSearch={(query) => {
            setCatalogSearchQuery(query);
            scrollToSection('produce-catalog-section');
          }}
          onOpenPasses={handleOpenActivePasses}
          activePassCount={activePassCount}
          activeEntity={activeLandingEntity}
          currentUser={currentUser}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenDashboard={() => {
            setCurrentView('main');
            setActiveModule('markets_discovery');
          }}
          onSelectEntity={(entity) => {
            setActiveLandingEntity(entity);
            if (entity === 'farmer') {
              handleOpenAuth('farmer_register');
            } else {
              scrollToSection('produce-catalog-section');
            }
          }}
        />

        {/* Dynamic Public View Switcher: About Us, Contact Us, or Hero & Discovery */}
        {currentView === 'about' ? (
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <AboutView
              onBrowseProduce={() => {
                navigateTo('main');
                setTimeout(() => scrollToSection('produce-catalog-section'), 100);
              }}
              onExploreMap={() => {
                navigateTo('main');
                setTimeout(() => scrollToSection('markets-map-section'), 100);
              }}
            />
          </div>
        ) : currentView === 'contact' ? (
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <ContactView
              markets={markets}
              farmers={farmers}
              onSelectFarmer={(fId) => {
                setSelectedFarmerFilter(fId);
                navigateTo('main');
                setTimeout(() => scrollToSection('produce-catalog-section'), 100);
              }}
              onFilterMarket={(mId) => {
                setSelectedMarketFilter(mId);
                navigateTo('main');
                setTimeout(() => scrollToSection('produce-catalog-section'), 100);
              }}
            />
          </div>
        ) : (
          <>
            {/* 2. Hero Section with Looping Background Video */}
            {memoizedHeroSection}

            {/* 3. Interactive Mandi Markets & Stalls Section */}
            {memoizedMarketMapSection}

            {/* Direct Mandi Problem Solving Hub */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <MandiProblemSolver
                onBrowseProduce={() => scrollToSection('produce-catalog-section')}
                onExploreMandis={() => scrollToSection('markets-map-section')}
              />
            </div>

            {/* 4. Real-Time Fresh Harvest Catalog Grid with Generous Spacing */}
            {memoizedProduceCatalogSection}

            {/* 5. How MarketLink Works (3-Step Transparency Pipeline) */}
            {memoizedHowItWorksSection}

            {/* Floating Interactive Side Comments on Scroll */}
            <FloatingScrollComments
              onScrollToMandi={() => scrollToSection('markets-map-section')}
              onScrollToProduce={() => scrollToSection('produce-catalog-section')}
            />
          </>
        )}

        {/* 6. Executive Footer */}
        <Footer
          onOpenAuth={() => handleOpenAuth('signin')}
          onSelectMarket={(mId) => {
            setSelectedMarketFilter(mId);
            scrollToSection('markets-map-section');
          }}
          onBrowseProduce={() => scrollToSection('produce-catalog-section')}
          onOpenPasses={handleOpenActivePasses}
          onAboutUs={() => navigateTo('about')}
          onContactUs={() => navigateTo('contact')}
        />

        {/* Cart Pre-Order Reservation Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQty={handleUpdateCartQty}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onOrdersSuccess={handleOrdersSuccess}
          onOrderSuccess={handleOrderSuccess}
          markets={markets}
          farmers={farmers}
          currentUser={currentUser}
          onRequireLogin={() => handleOpenAuth('signin')}
        />

        {/* Digital Pickup Pass Voucher Modal */}
        {activePassModalOrders.length > 0 && (
          <DigitalPickupPassModal
            orders={activePassModalOrders}
            onClose={() => setActivePassModalOrders([])}
            onViewStallMap={() => {
              setActivePassModalOrders([]);
              scrollToSection('markets-map-section');
            }}
          />
        )}

        {/* Split-Screen Login / Register Modal */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061a12]/70 backdrop-blur-md p-3 sm:p-5 overflow-y-auto perspective-1200 transition-all duration-300">
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[600px] h-[450px] bg-emerald-500/15 rounded-full blur-3xl animate-pulse-glow" />
            </div>

            <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(6,78,59,0.35)] relative animate-in fade-in zoom-in-95 duration-300 my-auto border border-emerald-500/30 contain-paint-layout">
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onClose={() => setIsAuthModalOpen(false)}
                markets={markets}
                initialTab={authInitialTab}
              />
            </div>
          </div>
        )}

        {/* Global Edit Profile Modal */}
        {isEditProfileOpen && currentUser && (
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            currentUser={currentUser}
            onProfileUpdated={(updated) => {
              setCurrentUser(updated);
              setStoredToken(getStoredToken() || '', updated);
            }}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED MODE (Dashboard Workspace with Left Sidebar & RBAC)
  // =========================================================================
  const permittedModules = currentUser.modules || [];
  const currentSafeModule: AppModule = permittedModules.includes(activeModule)
    ? activeModule
    : permittedModules[0] || 'markets_discovery';

  const moduleMeta = MODULE_TITLES[currentSafeModule] || {
    title: 'MarketLink Dashboard',
    subtitle: 'Agricultural produce & farmers market network',
    icon: Store,
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#faf6ee] flex flex-col selection:bg-emerald-100 relative">
      <CountryWelcomeModal />
      {/* Persistent Left Sidebar Layout */}
      <Sidebar
        currentUser={currentUser}
        activeModule={currentSafeModule}
        onSelectModule={(mod) => {
          setCurrentView('main');
          setActiveModule(mod);
        }}
        onLogout={handleLogout}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        favoritesCount={favorites.length}
        onNavigateAbout={() => navigateTo('about')}
        onNavigateContact={() => navigateTo('contact')}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Main Content Area (Offset by sidebar width on large screens) */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
        {/* Top Header Bar */}
        <Header
          currentUser={currentUser}
          activeModule={currentSafeModule}
          moduleMeta={
            currentView === 'about'
              ? { title: 'About MarketLink', subtitle: 'Platform mission, 3-step pipeline & team', icon: Store }
              : currentView === 'contact'
              ? { title: 'Contact Mandi Desk', subtitle: 'Regional coordinators & terminal support', icon: Store }
              : moduleMeta
          }
          isMobileSidebarOpen={isMobileSidebarOpen}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          totalCartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onLogout={handleLogout}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          canAccessProduceCatalog={permittedModules.includes('produce_catalog')}
          markets={regionFilteredMarkets}
          selectedMarketId={selectedMarketFilter}
          onSelectMarket={(mId) => setSelectedMarketFilter(mId)}
          onTriggerSearch={() => {
            setCurrentView('main');
            if (permittedModules.includes('produce_catalog')) {
              setActiveModule('produce_catalog');
            }
          }}
          notifications={notifications}
          onRefreshNotifications={loadNotifications}
          onNotificationClick={(n) => {
            if (n.type.includes('order')) {
              setCurrentView('main');
              if (currentUser.role === 'farmer') {
                setActiveModule('harvest_inventory');
              } else {
                setActiveModule('order_history');
              }
            }
          }}
        />

        {/* Dynamic Main Module View with 8px Spacing Discipline */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-6">
          {/* Platform Announcement Banner for Customers & Farmers */}
          {announcements.length > 0 && currentView === 'main' && currentSafeModule !== 'user_management' && (
            <div className="bg-white border border-[#e2e8e5] rounded-xl p-4 sm:p-5 text-[#10231d] flex items-start gap-3.5 shadow-xs relative overflow-hidden">
              <div className="p-2 rounded-lg bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] shrink-0 mt-0.5">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#064e3b]">
                    Market Updates & Announcements
                  </span>
                  <span className="text-[10px] text-[#64748b]">
                    {new Date(announcements[0].createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed font-normal">
                  {announcements[0].message}
                </p>
              </div>
            </div>
          )}

          {/* View Switcher: About Us */}
          {currentView === 'about' && (
            <AboutView
              onBrowseProduce={() => {
                navigateTo('main');
                setActiveModule('produce_catalog');
              }}
              onExploreMap={() => {
                navigateTo('main');
                setActiveModule('markets_discovery');
              }}
            />
          )}

          {/* View Switcher: Contact Us */}
          {currentView === 'contact' && (
            <ContactView
              markets={markets}
              farmers={farmers}
              onSelectFarmer={(fId) => {
                setSelectedFarmerFilter(fId);
                navigateTo('main');
                setActiveModule('produce_catalog');
              }}
              onFilterMarket={(mId) => {
                setSelectedMarketFilter(mId);
                navigateTo('main');
                setActiveModule('produce_catalog');
              }}
            />
          )}

          {/* Main Dashboard Modules */}
          {currentView === 'main' && (
            <>
              {/* Module 1: Market Stalls Map */}
              {currentSafeModule === 'markets_discovery' && (
                <MarketMap
                  markets={regionFilteredMarkets}
                  farmers={regionFilteredFarmers}
                  onSelectFarmer={(fId) => {
                    setSelectedFarmerFilter(fId);
                    setActiveModule('produce_catalog');
                  }}
                  onFilterMarket={(mId) => {
                    setSelectedMarketFilter(mId);
                  }}
                  favoriteFarmerIds={favoriteFarmerIds}
                  onToggleFavoriteFarmer={handleToggleFavoriteFarmer}
                />
              )}

              {/* Module 2: Produce Catalog */}
              {currentSafeModule === 'produce_catalog' && (
                <ProduceCatalog
                  products={regionFilteredProducts}
                  markets={regionFilteredMarkets}
                  farmers={regionFilteredFarmers}
                  onAddToCart={handleAddToCart}
                  selectedMarketFilter={selectedMarketFilter}
                  onClearMarketFilter={() => setSelectedMarketFilter(null)}
                  selectedFarmerFilter={selectedFarmerFilter}
                  onClearFarmerFilter={() => setSelectedFarmerFilter(null)}
                  searchQuery={catalogSearchQuery}
                  onSearchChange={setCatalogSearchQuery}
                  favoriteProductIds={favoriteProductIds}
                  onToggleFavoriteProduct={handleToggleFavoriteProduct}
                  currentUser={currentUser}
                  completedProductIds={completedProductIds}
                />
              )}

              {/* Module 3: Customer Pickup Passes */}
              {currentSafeModule === 'my_preorders' && (
                <CustomerPassesView
                  orders={orders}
                  onOpenPassModal={(ord: Order) => setActivePassModalOrders([ord])}
                  onExploreProduce={() => setActiveModule('produce_catalog')}
                />
              )}

              {/* Module: Order History & Modifications */}
              {currentSafeModule === 'order_history' && (
                <OrderHistoryView
                  orders={orders}
                  onRefreshOrders={refreshOrders}
                  onOpenPassModal={(ord: Order) => setActivePassModalOrders([ord])}
                  onExploreProduce={() => setActiveModule('produce_catalog')}
                />
              )}

              {/* Module: Saved Favorites */}
              {currentSafeModule === 'favorites' && (
                <FavoritesView
                  favorites={favorites}
                  onRemoveFavorite={handleRemoveFavoriteById}
                  onAddToCart={handleAddToCart}
                  onExploreProduce={() => setActiveModule('produce_catalog')}
                  onExploreMap={() => setActiveModule('markets_discovery')}
                  onFilterByFarmer={(fId) => {
                    setSelectedFarmerFilter(fId);
                    setActiveModule('produce_catalog');
                  }}
                />
              )}

              {/* Module 4: Harvest Inventory Management */}
              {currentSafeModule === 'harvest_inventory' && (
                <HarvestInventoryView
                  products={products}
                  currentUser={currentUser}
                  farmers={farmers}
                  currentFarmerProfile={currentFarmerProfile}
                  onRefreshProducts={refreshProducts}
                  orders={orders}
                  onRefreshOrders={refreshOrders}
                />
              )}

              {/* Module 5: Stall Scanner & PIN Verification */}
              {currentSafeModule === 'stall_scanner' && (
                <StallScannerView
                  orders={orders}
                  onOrderCompleted={refreshOrders}
                />
              )}

              {/* Module 6: Agro-Copilot AI Assistant (Gemini Pro) */}
              {currentSafeModule === 'agro_copilot' && (
                <AgroCopilotView currentUser={currentUser} />
              )}

              {/* Module 7: Settings & User Management / Admin Command Center */}
              {currentSafeModule === 'user_management' && (
                currentUser.role === 'admin' ? (
                  <AdminDashboardView
                    currentUser={currentUser}
                    onRefreshMarkets={loadMarketData}
                    onRefreshProducts={refreshProducts}
                  />
                ) : (
                  <UserManagementView currentUser={currentUser} />
                )
              )}

              {/* Module 8: Analytics & Market Reports */}
              {currentSafeModule === 'analytics_reports' && (
                <AnalyticsReportsView
                  orders={orders}
                  products={products}
                  markets={markets}
                />
              )}
            </>
          )}
        </main>

        {/* Global Executive Footer */}
        <Footer
          onOpenAuth={() => handleOpenAuth('signin')}
          onSelectMarket={(mId) => {
            setSelectedMarketFilter(mId);
            setActiveModule('produce_catalog');
          }}
          onBrowseProduce={() => setActiveModule('produce_catalog')}
          onOpenPasses={() => setActiveModule('my_preorders')}
          onAboutUs={() => navigateTo('about')}
          onContactUs={() => navigateTo('contact')}
        />
      </div>

      {/* Cart Pre-Order Reservation Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrdersSuccess={handleOrdersSuccess}
        onOrderSuccess={handleOrderSuccess}
        markets={markets}
        farmers={farmers}
        currentUser={currentUser}
        onRequireLogin={() => handleOpenAuth('signin')}
      />

      {/* Digital Pickup Pass Voucher Modal */}
      {activePassModalOrders.length > 0 && (
        <DigitalPickupPassModal
          orders={activePassModalOrders}
          onClose={() => setActivePassModalOrders([])}
          onViewStallMap={() => {
            setActivePassModalOrders([]);
            setActiveModule('markets_discovery');
          }}
        />
      )}

      {/* Global Edit Profile Modal */}
      {isEditProfileOpen && currentUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={currentUser}
          onProfileUpdated={(updated) => {
            setCurrentUser(updated);
            setStoredToken(getStoredToken() || '', updated);
          }}
        />
      )}
    </div>
  );
}
