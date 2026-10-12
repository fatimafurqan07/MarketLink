import React from 'react';
import {
  Menu,
  X,
  LogOut,
  ShoppingBasket,
  LogIn,
  Store,
  Search,
  Edit3,
} from 'lucide-react';
import { User, AppModule, Market, NotificationItem } from '../types.ts';
import { LuxurySelect, LuxurySelectOption } from './common/LuxurySelect.tsx';
import { NotificationDropdown } from './NotificationDropdown.tsx';
import { UserAvatar } from './common/index.ts';
import { useLanguage } from '../i18n/LanguageContext.tsx';

interface HeaderProps {
  currentUser?: User | null;
  activeModule?: AppModule;
  moduleMeta: {
    title: string;
    subtitle: string;
    icon: React.FC<{ className?: string }>;
  };
  isMobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  totalCartCount: number;
  onOpenCart: () => void;
  onLogout: () => void;
  onLoginClick?: () => void;
  onOpenEditProfile?: () => void;
  canAccessProduceCatalog: boolean;
  markets?: Market[];
  selectedMarketId?: number | string | null;
  onSelectMarket?: (marketId: number | string | null) => void;
  onTriggerSearch?: () => void;
  notifications?: NotificationItem[];
  onRefreshNotifications?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  moduleMeta,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
  totalCartCount,
  onOpenCart,
  onLogout,
  onLoginClick,
  onOpenEditProfile,
  canAccessProduceCatalog,
  markets = [],
  selectedMarketId,
  onSelectMarket,
  onTriggerSearch,
  notifications = [],
  onRefreshNotifications = () => {},
  onNotificationClick,
}) => {
  const { t } = useLanguage();
  const ModuleIcon = moduleMeta.icon;

  const marketOptions: LuxurySelectOption<number | string | 'all'>[] = [
    {
      value: 'all',
      label: t('catalog.allMarkets', 'All Mandi Markets'),
      subLabel: t('catalog.allCategories', 'All Mandis combined'),
      icon: Store,
    },
    ...markets.map((m) => ({
      value: m.id,
      label: m.name,
      subLabel: m.location_address,
      badge: `${m.stall_count || 24} Stalls`,
      icon: Store,
    })),
  ];

  return (
    <header className="sticky top-0 z-30 h-16 w-full backdrop-blur-md bg-[#f8f7f2]/95 border-b border-[#e2e8e5] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors shadow-xs">
      {/* Left: Mobile Toggle & Module Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label={isMobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="lg:hidden h-9 w-9 rounded-lg bg-white border border-[#e2e8e5] text-[#10231d] hover:bg-[#eef2ec] flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
        >
          {isMobileSidebarOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#064e3b] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ModuleIcon className="w-4 h-4 text-[#ecfdf5]" />
          </div>

          <div className="min-w-0">
            <h1 className="font-serif text-lg font-normal tracking-tight text-[#10231d] truncate">
              {moduleMeta.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Center: Mandi Switcher */}
      <div className="hidden xl:flex items-center gap-3">
        {markets.length > 0 && onSelectMarket && (
          <div className="w-48 lg:w-56">
            <LuxurySelect<number | string | 'all'>
              value={selectedMarketId ?? 'all'}
              onChange={(val) => onSelectMarket(val === 'all' ? null : val)}
              options={marketOptions}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Right: Search, Basket & User Capsule */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {onTriggerSearch && (
          <button
            type="button"
            onClick={onTriggerSearch}
            className="hidden sm:flex h-9 px-2.5 rounded-lg bg-white border border-[#e2e8e5] text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] transition-all cursor-pointer shadow-xs items-center gap-1.5"
            title={t('nav.search')}
          >
            <Search className="w-3.5 h-3.5 text-[#64748b]" />
            <span className="text-xs text-[#64748b]">{t('common.filter', 'Search')}</span>
          </button>
        )}

        {/* In-App Notifications Bell (Logged-In User) */}
        {currentUser && (
          <NotificationDropdown
            notifications={notifications}
            onRefreshNotifications={onRefreshNotifications}
            onNotificationClick={onNotificationClick}
          />
        )}

        {/* Harvest Basket Trigger */}
        {canAccessProduceCatalog && (
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="View pre-order harvest basket"
            className="h-9 px-3 rounded-lg bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <ShoppingBasket className="w-4 h-4 text-[#ecfdf5]" />
            <span className="hidden sm:inline text-white">{t('nav.cart')}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] font-mono text-[10px] font-bold">
              {totalCartCount}
            </span>
          </button>
        )}

        {/* User Capsule or Sign In */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenEditProfile}
              title="Edit Profile & Account Settings"
              className="flex items-center gap-2 pl-1.5 py-1 pr-2.5 rounded-lg bg-white hover:bg-[#eef2ec] border border-[#e2e8e5] shadow-xs cursor-pointer transition-colors text-left"
            >
              <UserAvatar
                name={currentUser.name}
                avatarUrl={currentUser.avatar_url}
                size="xs"
                role={currentUser.role}
              />
              <div className="hidden sm:block text-left min-w-0">
                <div className="text-xs font-semibold text-[#10231d] truncate max-w-[110px]">
                  {currentUser.name}
                </div>
                <div className="text-[9px] text-[#064e3b] font-mono font-bold flex items-center gap-1 leading-none">
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Edit Profile</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onLogout}
              title={t('nav.logout')}
              aria-label="Sign out"
              className="h-9 w-9 rounded-lg bg-white border border-[#e2e8e5] text-[#64748b] hover:text-[#b3261e] hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLoginClick}
            className="h-9 px-3.5 sm:px-4 rounded-lg bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <LogIn className="w-4 h-4 text-[#ecfdf5]" />
            <span>{t('nav.signIn')}</span>
          </button>
        )}
      </div>
    </header>
  );
};
