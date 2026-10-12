import React from 'react';
import {
  Sprout,
  Store,
  ShoppingBag,
  Ticket,
  Package,
  QrCode,
  Sparkles,
  Users,
  BarChart3,
  LogOut,
  ChevronRight,
  ShoppingBasket,
  History,
  Heart,
  Info,
  Mail,
  Edit3,
  UserCog,
} from 'lucide-react';
import { User, AppModule, CartItem } from '../types.ts';
import { cn } from '../utils/cn.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { UserAvatar } from './common/UserAvatar.tsx';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface SidebarProps {
  currentUser: User;
  activeModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  onLogout: () => void;
  cart: CartItem[];
  onOpenCart: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  favoritesCount?: number;
  onNavigateAbout?: () => void;
  onNavigateContact?: () => void;
  onOpenEditProfile?: () => void;
}

interface NavItemConfig {
  id: AppModule;
  label: string;
  badge?: string;
  icon: React.FC<{ className?: string }>;
}

const ALL_MODULES_CONFIG: NavItemConfig[] = [
  {
    id: 'markets_discovery',
    label: 'Mandi Map & Stalls',
    icon: Store,
  },
  {
    id: 'produce_catalog',
    label: 'Fresh Sabzi & Fruits',
    icon: ShoppingBag,
  },
  {
    id: 'my_preorders',
    label: 'My Pickup Passes',
    icon: Ticket,
  },
  {
    id: 'order_history',
    label: 'My Orders',
    icon: History,
  },
  {
    id: 'favorites',
    label: 'Saved Favorites',
    icon: Heart,
  },
  {
    id: 'harvest_inventory',
    label: 'My Crop Stock',
    icon: Package,
  },
  {
    id: 'stall_scanner',
    label: 'Customer Scanner',
    icon: QrCode,
  },
  {
    id: 'agro_copilot',
    label: 'Agro-Copilot Assistant',
    badge: 'AI',
    icon: Sparkles,
  },
  {
    id: 'user_management',
    label: 'Admin Dashboard',
    badge: 'Admin',
    icon: Users,
  },
  {
    id: 'analytics_reports',
    label: 'Sales & Market Reports',
    icon: BarChart3,
  },
];

const ROLE_LABELS: Record<User['role'], string> = {
  admin: 'Admin',
  farmer: 'Farmer / Kisan',
  customer: 'Customer / Buyer',
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeModule,
  onSelectModule,
  onLogout,
  cart,
  onOpenCart,
  isMobileOpen,
  setIsMobileOpen,
  onNavigateAbout,
  onNavigateContact,
  onOpenEditProfile,
}) => {
  const { t, language } = useLanguage();
  const permittedModules = currentUser.modules || [];
  const accessibleNavItems = ALL_MODULES_CONFIG.filter((item) =>
    permittedModules.includes(item.id)
  );

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce(
    (sum, item) => sum + item.product.price_per_unit * item.quantity,
    0
  );

  const roleLabel =
    currentUser.role === 'admin'
      ? (language === 'ur' ? 'ایڈمن' : 'Admin')
      : currentUser.role === 'farmer'
      ? (language === 'ur' ? 'کسان / فارمر' : 'Farmer / Kisan')
      : (language === 'ur' ? 'خریدار / گاہک' : 'Customer / Buyer');

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#10231d]/30 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#ffffff] border-r border-[#e2e8e5] text-[#10231d] flex flex-col justify-between transition-transform duration-300 ease-out lg:translate-x-0 shadow-xs',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="h-16 px-5 border-b border-[#e2e8e5] bg-[#f8f7f2] flex items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#064e3b] text-white p-2 rounded-lg flex items-center justify-center shrink-0 shadow-xs">
              <Sprout className="w-4 h-4 text-[#ecfdf5]" />
            </div>

            <div className="flex items-baseline tracking-tight font-serif text-2xl font-normal">
              <span className="text-[#10231d]">Market</span>
              <span className="text-[#064e3b] italic">Link</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-[#64748b] uppercase tracking-wider flex items-center justify-between font-sans">
            <span>Main Menu</span>
            <span className="text-[9px] font-mono text-[#064e3b] font-semibold">PANEL</span>
          </div>

          {accessibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectModule(item.id);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer group',
                  isActive
                    ? 'bg-[#064e3b] text-white shadow-xs font-semibold'
                    : 'text-[#10231d] hover:text-[#064e3b] hover:bg-[#eef2ec] font-medium'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isActive ? 'bg-white/15 text-white' : 'text-[#064e3b] group-hover:text-[#064e3b]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{t(`module.${item.id}.title`, item.label)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#ecfdf5] text-[#064e3b] border border-emerald-200'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      'w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5',
                      isActive ? 'text-white' : 'text-[#64748b]'
                    )}
                  />
                </div>
              </button>
            );
          })}

          {/* Harvest Basket Action (if Customer) */}
          {permittedModules.includes('produce_catalog') && totalCartCount > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onOpenCart();
                  setIsMobileOpen(false);
                }}
                className="w-full p-3 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-left transition-all hover:bg-emerald-100/50 cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBasket className="w-4 h-4 text-[#064e3b]" />
                    <span className="text-xs font-semibold text-[#064e3b]">{t('nav.cart', 'Harvest Basket')}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#064e3b] text-white font-mono text-[10px] font-bold">
                    {totalCartCount}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-[#10231d] flex items-center justify-between">
                  <span>{t('cart.estimatedTotal', 'Pay on Pickup')}:</span>
                  <span className="font-mono font-bold text-[#064e3b]">
                    {formatCurrency(totalCartAmount)}
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Quick Platform Links */}
          <div className="pt-3 mt-2 border-t border-[#e2e8e5] space-y-0.5">
            {onOpenEditProfile && (
              <button
                type="button"
                onClick={() => {
                  onOpenEditProfile();
                  setIsMobileOpen(false);
                }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#064e3b] bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60 text-xs font-semibold transition-all cursor-pointer"
              >
                <UserCog className="w-3.5 h-3.5 text-[#064e3b]" />
                <span>{language === 'ur' ? 'پروفائل تبدیل کریں' : 'Edit My Profile'}</span>
              </button>
            )}

            {onNavigateAbout && (
              <button
                type="button"
                onClick={() => {
                  onNavigateAbout();
                  setIsMobileOpen(false);
                }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#64748b] hover:text-[#064e3b] hover:bg-[#eef2ec] text-xs font-medium transition-all cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-[#064e3b]" />
                <span>{t('nav.about', 'About MarketLink')}</span>
              </button>
            )}

            {onNavigateContact && (
              <button
                type="button"
                onClick={() => {
                  onNavigateContact();
                  setIsMobileOpen(false);
                }}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#64748b] hover:text-[#064e3b] hover:bg-[#eef2ec] text-xs font-medium transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#064e3b]" />
                <span>{t('nav.contact', 'Help & Mandi Desk')}</span>
              </button>
            )}
          </div>
        </div>

        {/* User Capsule */}
        <div className="p-3.5 border-t border-[#e2e8e5] bg-[#f8f7f2]">
          <div className="p-2.5 rounded-xl bg-white border border-[#e2e8e5] flex items-center justify-between gap-2 shadow-xs">
            <button
              type="button"
              onClick={onOpenEditProfile}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer hover:opacity-85 transition-opacity"
              title="Click to Edit Profile"
            >
              <UserAvatar
                name={currentUser.name}
                avatarUrl={currentUser.avatar_url}
                size="sm"
                role={currentUser.role}
                showOnlineIndicator={true}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="font-semibold text-xs text-[#10231d] truncate font-sans">
                    {currentUser.name}
                  </h4>
                  <Edit3 className="w-3 h-3 text-[#064e3b] shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full border bg-[#eef2ec] text-[#064e3b] border-[#e2e8e5] truncate">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-[#64748b] hover:text-[#b3261e] hover:bg-rose-50 transition-all cursor-pointer shrink-0"
              title="Sign Out Session"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 px-1 flex items-center justify-between text-[10px] text-[#64748b]">
            <span>Rs. 0 Online • Cash at Stall</span>
            <span className="font-mono text-[9px] text-[#064e3b] font-bold">Seedha Kisan Se</span>
          </div>
        </div>
      </aside>
    </>
  );
};
