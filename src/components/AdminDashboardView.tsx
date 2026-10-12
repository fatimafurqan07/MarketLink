import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Store,
  ShoppingBag,
  Receipt,
  Coins,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  Megaphone,
  Layers,
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  UserX,
  Tag,
  Star,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  User,
  Market,
  Product,
  Review,
  AdminDashboardStats,
  CategoryItem,
  AnnouncementItem,
  AdminReportsData,
} from '../types.ts';
import { api } from '../services/api.ts';
import { UserRoleBadge, AccountStatusBadge, StarRating, ConfirmDeleteModal } from './common/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import { cn } from '../utils/cn.ts';

interface AdminDashboardViewProps {
  currentUser: User;
  onRefreshMarkets?: () => void;
  onRefreshProducts?: () => void;
}

type AdminTab = 'overview' | 'users' | 'markets' | 'moderation' | 'reports' | 'system';
type ModerationSubTab = 'reviews' | 'products';
type UserRoleFilter = 'all' | 'farmer' | 'customer' | 'pending';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onRefreshMarkets,
  onRefreshProducts,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [moderationTab, setModerationTab] = useState<ModerationSubTab>('reviews');

  // Stats State
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<UserRoleFilter>('all');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [userActionLoadingId, setUserActionLoadingId] = useState<string | number | null>(null);

  // Markets State
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState<boolean>(false);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState<boolean>(false);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [marketFormData, setMarketFormData] = useState({
    name: '',
    address: '',
    city: 'Karachi',
    latitude: '24.9721',
    longitude: '67.1571',
    operating_days: 'Daily (Monday – Sunday)',
    timings: '04:30 AM – 11:30 AM',
    opening_time: '04:30 AM',
    closing_time: '11:30 AM',
    stall_count: '32',
    description: '',
    parking_info: 'Loading bay and customer parking available on-site.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  });

  // Moderation State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingModeration, setIsLoadingModeration] = useState<boolean>(false);
  const [moderationSearch, setModerationSearch] = useState<string>('');

  // Reports State
  const [reportsData, setReportsData] = useState<AdminReportsData | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);

  // System Configuration State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoadingSystem, setIsLoadingSystem] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newAnnouncementMessage, setNewAnnouncementMessage] = useState<string>('');
  const [isSubmittingSystem, setIsSubmittingSystem] = useState<boolean>(false);

  // Notifications / Feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirm Delete / Action Modal State
  interface DeleteTarget {
    type: 'market' | 'category' | 'product' | 'review' | 'announcement' | 'suspend_user' | 'delete_user';
    id: string | number;
    title: string;
    name: string;
    description?: string;
    confirmText?: string;
    variant?: 'danger' | 'warning';
  }
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // -------------------------------------------------------------------------
  // Data Loaders
  // -------------------------------------------------------------------------
  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await api.getAdminDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      console.warn('Failed to load admin stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: unknown) {
      console.warn('Failed to load users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadMarkets = async () => {
    setIsLoadingMarkets(true);
    try {
      const data = await api.getMarkets();
      setMarkets(data);
    } catch (err: unknown) {
      console.warn('Failed to load markets:', err);
    } finally {
      setIsLoadingMarkets(false);
    }
  };

  const loadModeration = async () => {
    setIsLoadingModeration(true);
    try {
      const [revs, prods] = await Promise.all([
        api.getAdminReviews(),
        api.getAdminProducts(),
      ]);
      setReviews(revs);
      setProducts(prods);
    } catch (err: unknown) {
      console.warn('Failed to load moderation data:', err);
    } finally {
      setIsLoadingModeration(false);
    }
  };

  const loadReports = async () => {
    setIsLoadingReports(true);
    try {
      const data = await api.getAdminReports();
      setReportsData(data);
    } catch (err: unknown) {
      console.warn('Failed to load reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const loadSystemConfig = async () => {
    setIsLoadingSystem(true);
    try {
      const [cats, anns] = await Promise.all([
        api.getCategories(),
        api.getAnnouncements(),
      ]);
      setCategories(cats);
      setAnnouncements(anns);
    } catch (err: unknown) {
      console.warn('Failed to load system config:', err);
    } finally {
      setIsLoadingSystem(false);
    }
  };

  const reloadAll = () => {
    loadStats();
    loadUsers();
    loadMarkets();
    loadModeration();
    loadReports();
    loadSystemConfig();
  };

  // Real-time polling for user registrations, stats, and updates
  useEffect(() => {
    reloadAll();
    const interval = setInterval(() => {
      loadUsers();
      loadStats();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Centralized Executer for Confirmed Delete / Suspend
  const handleExecuteConfirmedDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const { type, id, name } = deleteTarget;

    try {
      if (type === 'market') {
        setMarkets((prev) => prev.filter((m) => m.id !== id && (m as any)._id !== id));
        await api.deleteMarket(id);
        showFeedback(`Market "${name}" removed successfully.`);
        loadStats();
        if (onRefreshMarkets) onRefreshMarkets();
      } else if (type === 'category') {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        await api.deleteCategory(String(id));
        showFeedback(`Category "${name}" removed.`);
        loadSystemConfig();
      } else if (type === 'product') {
        setProducts((prev) => prev.filter((p) => p.id !== id && (p as any)._id !== id));
        await api.deleteAdminProduct(id);
        showFeedback(`Product listing "${name}" deleted.`);
        if (onRefreshProducts) onRefreshProducts();
        loadStats();
      } else if (type === 'review') {
        setReviews((prev) => prev.filter((r) => r.id !== id && r._id !== id));
        await api.deleteAdminReview(String(id));
        showFeedback('Review removed from public view.');
        loadStats();
      } else if (type === 'announcement') {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        await api.deleteAnnouncement(String(id));
        showFeedback('Announcement removed.');
        loadSystemConfig();
      } else if (type === 'suspend_user') {
        setUserActionLoadingId(id);
        const res = await api.suspendUser(id);
        showFeedback(res.message || `Account for "${name}" has been suspended.`, 'error');
        loadUsers();
        loadStats();
      } else if (type === 'delete_user') {
        setUserActionLoadingId(id);
        setUsers((prev) => prev.filter((u) => u.id !== id && (u as any)._id !== id));
        const res = await api.deleteUser(id);
        showFeedback(res.message || `User account "${name}" deleted permanently.`);
        loadUsers();
        loadStats();
      }
      setDeleteTarget(null);
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Operation failed', 'error');
      if (type === 'market') loadMarkets();
      if (type === 'category' || type === 'announcement') loadSystemConfig();
      if (type === 'product' || type === 'review') loadModeration();
      if (type === 'suspend_user' || type === 'delete_user') loadUsers();
    } finally {
      setIsDeleting(false);
      setUserActionLoadingId(null);
    }
  };

  // -------------------------------------------------------------------------
  // User Actions (Approve, Suspend, Activate)
  // -------------------------------------------------------------------------
  const handleApproveFarmer = async (userId: string | number, name: string) => {
    setUserActionLoadingId(userId);
    try {
      const res = await api.approveUser(userId);
      showFeedback(res.message || `Farmer "${name}" approved successfully.`);
      loadUsers();
      loadStats();
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Approval failed', 'error');
    } finally {
      setUserActionLoadingId(null);
    }
  };

  const handleSuspendUser = async (userId: string | number, name: string) => {
    setUserActionLoadingId(userId);
    try {
      const res = await api.suspendUser(userId);
      showFeedback(res.message || `Account for "${name}" has been suspended.`, 'error');
      loadUsers();
      loadStats();
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Suspension failed', 'error');
    } finally {
      setUserActionLoadingId(null);
    }
  };

  const handleActivateUser = async (userId: string | number, name: string) => {
    setUserActionLoadingId(userId);
    try {
      const res = await api.activateUser(userId);
      showFeedback(res.message || `Account for "${name}" reactivated successfully.`);
      loadUsers();
      loadStats();
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Activation failed', 'error');
    } finally {
      setUserActionLoadingId(null);
    }
  };

  // -------------------------------------------------------------------------
  // Market Actions (Add, Edit, Delete)
  // -------------------------------------------------------------------------
  const openAddMarketModal = () => {
    setEditingMarket(null);
    setMarketFormData({
      name: '',
      address: '',
      city: 'Karachi',
      latitude: '24.9721',
      longitude: '67.1571',
      operating_days: 'Daily (Monday – Sunday)',
      timings: '04:30 AM – 11:30 AM',
      opening_time: '04:30 AM',
      closing_time: '11:30 AM',
      stall_count: '32',
      description: '',
      parking_info: 'Loading bay and customer parking available on-site.',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    });
    setIsMarketModalOpen(true);
  };

  const openEditMarketModal = (market: Market) => {
    setEditingMarket(market);
    setMarketFormData({
      name: market.name,
      address: market.location_address || '',
      city: market.city || 'Mandi Hub',
      latitude: market.latitude.toString(),
      longitude: market.longitude.toString(),
      operating_days: market.operating_days || 'Daily',
      timings: market.timings || `${market.opening_time} – ${market.closing_time}`,
      opening_time: market.opening_time || '04:30 AM',
      closing_time: market.closing_time || '11:30 AM',
      stall_count: (market.stall_count || 24).toString(),
      description: market.description || '',
      parking_info: market.parking_info || '',
      image_url: market.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    });
    setIsMarketModalOpen(true);
  };

  const handleSaveMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketFormData.name.trim() || !marketFormData.address.trim()) {
      showFeedback('Market name and physical address are required.', 'error');
      return;
    }

    try {
      if (editingMarket) {
        await api.patchMarket(editingMarket.id, {
          name: marketFormData.name.trim(),
          location_address: marketFormData.address.trim(),
          city: marketFormData.city.trim(),
          latitude: parseFloat(marketFormData.latitude) || 24.9721,
          longitude: parseFloat(marketFormData.longitude) || 67.1571,
          operating_days: marketFormData.operating_days,
          timings: `${marketFormData.opening_time} – ${marketFormData.closing_time}`,
          opening_time: marketFormData.opening_time,
          closing_time: marketFormData.closing_time,
          stall_count: parseInt(marketFormData.stall_count) || 24,
          description: marketFormData.description.trim(),
          parking_info: marketFormData.parking_info.trim(),
          image_url: marketFormData.image_url.trim(),
        });
        showFeedback(`Market "${marketFormData.name}" updated successfully.`);
      } else {
        await api.createAdminMarket({
          name: marketFormData.name.trim(),
          location_address: marketFormData.address.trim(),
          city: marketFormData.city.trim(),
          latitude: parseFloat(marketFormData.latitude) || 24.9721,
          longitude: parseFloat(marketFormData.longitude) || 67.1571,
          operating_days: marketFormData.operating_days,
          timings: `${marketFormData.opening_time} – ${marketFormData.closing_time}`,
          opening_time: marketFormData.opening_time,
          closing_time: marketFormData.closing_time,
          stall_count: parseInt(marketFormData.stall_count) || 24,
          description: marketFormData.description.trim(),
          parking_info: marketFormData.parking_info.trim(),
          image_url: marketFormData.image_url.trim(),
        });
        showFeedback(`New Mandi market "${marketFormData.name}" created successfully.`);
      }

      setIsMarketModalOpen(false);
      loadMarkets();
      loadStats();
      if (onRefreshMarkets) onRefreshMarkets();
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Failed to save market', 'error');
    }
  };

  const handleDeleteMarket = async (marketId: number | string, name: string) => {
    // Optimistic UI update
    setMarkets((prev) => prev.filter((m) => m.id !== marketId && (m as any)._id !== marketId));
    try {
      await api.deleteMarket(marketId);
      showFeedback(`Market "${name}" removed successfully.`);
      loadStats();
      if (onRefreshMarkets) onRefreshMarkets();
    } catch (err: unknown) {
      loadMarkets();
      showFeedback(err instanceof Error ? err.message : 'Failed to delete market', 'error');
    }
  };

  // -------------------------------------------------------------------------
  // Moderation Actions (Delete Review / Product)
  // -------------------------------------------------------------------------
  const handleDeleteReview = async (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId && r._id !== reviewId));
    try {
      await api.deleteAdminReview(reviewId);
      showFeedback('Review removed from public view.');
    } catch (err: unknown) {
      loadModeration();
      showFeedback(err instanceof Error ? err.message : 'Failed to delete review', 'error');
    }
  };

  const handleDeleteProduct = async (productId: number | string, name: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId && (p as any)._id !== productId));
    try {
      await api.deleteAdminProduct(productId);
      showFeedback(`Product listing "${name}" deleted.`);
      if (onRefreshProducts) onRefreshProducts();
      loadStats();
    } catch (err: unknown) {
      loadModeration();
      showFeedback(err instanceof Error ? err.message : 'Failed to delete product', 'error');
    }
  };

  // -------------------------------------------------------------------------
  // System Config Actions (Categories & Announcements)
  // -------------------------------------------------------------------------
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmittingSystem(true);
    try {
      const res = await api.createCategory(newCategoryName.trim());
      showFeedback(res.message || `Category "${newCategoryName}" created.`);
      setNewCategoryName('');
      loadSystemConfig();
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Failed to add category', 'error');
    } finally {
      setIsSubmittingSystem(false);
    }
  };

  const handleDeleteCategory = async (catId: string, name: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    try {
      await api.deleteCategory(catId);
      showFeedback(`Category "${name}" removed.`);
    } catch (err: unknown) {
      loadSystemConfig();
      showFeedback(err instanceof Error ? err.message : 'Failed to delete category', 'error');
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementMessage.trim()) return;
    setIsSubmittingSystem(true);
    try {
      const res = await api.createAnnouncement(newAnnouncementMessage.trim());
      showFeedback(res.message || 'Platform announcement broadcasted successfully.');
      setNewAnnouncementMessage('');
      loadSystemConfig();
    } catch (err: unknown) {
      showFeedback(err instanceof Error ? err.message : 'Failed to broadcast announcement', 'error');
    } finally {
      setIsSubmittingSystem(false);
    }
  };

  const handleDeleteAnnouncement = async (annId: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== annId));
    try {
      await api.deleteAnnouncement(annId);
      showFeedback('Announcement removed.');
    } catch (err: unknown) {
      loadSystemConfig();
      showFeedback(err instanceof Error ? err.message : 'Failed to delete announcement', 'error');
    }
  };

  // -------------------------------------------------------------------------
  // Filtered Users List
  // -------------------------------------------------------------------------
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter === 'farmer' && u.role !== 'farmer') return false;
    if (userRoleFilter === 'customer' && u.role !== 'customer') return false;
    if (userRoleFilter === 'pending' && (u.role !== 'farmer' || u.isApproved !== false)) return false;

    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchFarm = u.farm_name?.toLowerCase().includes(q);
      const matchStall = u.stall_number?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      return matchName || matchEmail || matchFarm || matchStall || matchPhone;
    }
    return true;
  });

  // -------------------------------------------------------------------------
  // Filtered Moderation List
  // -------------------------------------------------------------------------
  const filteredReviews = reviews.filter((r) => {
    if (!moderationSearch.trim()) return true;
    const q = moderationSearch.toLowerCase();
    return (
      r.comment?.toLowerCase().includes(q) ||
      r.customer_name?.toLowerCase().includes(q) ||
      (r as any).product_name?.toLowerCase().includes(q) ||
      (r as any).farmer_name?.toLowerCase().includes(q)
    );
  });

  const filteredProducts = products.filter((p) => {
    if (!moderationSearch.trim()) return true;
    const q = moderationSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.farmer_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all transform animate-in slide-in-from-top-4 ${
            feedback.type === 'success'
              ? 'bg-white border-emerald-300 text-[#064e3b]'
              : 'bg-rose-50 border-rose-200 text-[#b3261e]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#064e3b] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#b3261e] shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-[#e2e8e5] rounded-2xl p-6 sm:p-8 text-[#10231d] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-[#064e3b]" />
              Admin Control Panel
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#10231d] tracking-tight">
              Platform Administration
            </h1>
            <p className="text-sm text-[#64748b] mt-1 max-w-xl">
              Manage Mandi markets, verify farmer stalls, manage users, moderate reviews, and view real-time orders.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={reloadAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#eef2ec] border border-[#e2e8e5] text-[#10231d] text-xs font-semibold tracking-wide transition shadow-2xs cursor-pointer"
              title="Refresh all metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#064e3b] ${isLoadingStats ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] text-xs font-medium">
              SuperAdmin: <span className="font-semibold text-[#064e3b]">{currentUser.name}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="mt-8 pt-6 border-t border-[#e2e8e5] flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Dashboard Home', icon: TrendingUp },
            { id: 'users', label: 'Manage Users', icon: Users, badge: stats?.pendingApprovals ? `${stats.pendingApprovals} Pending` : undefined },
            { id: 'markets', label: 'Manage Markets', icon: Store },
            { id: 'moderation', label: 'Content Moderation', icon: MessageSquare },
            { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
            { id: 'system', label: 'System Config', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#064e3b] text-white shadow-xs'
                    : 'bg-[#eef2ec] text-[#064e3b] hover:bg-[#eae8df]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#064e3b]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f59e0b] text-[#10231d]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. TAB: OVERVIEW (STAT CARDS) */}
      {/* ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 5 Core Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
            {/* Card 1: Total Farmers */}
            <div className="bg-white border border-[#e2e8e5] rounded-3xl p-6 text-[#10231d] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#64748b]">
                  Total Farmers
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-5">
                <div className="text-3xl font-serif font-normal text-[#10231d] tracking-tight">
                  {isLoadingStats ? '—' : stats?.totalFarmers ?? 0}
                </div>
                <div className="flex items-center justify-between text-xs text-[#64748b] mt-3 pt-2.5 border-t border-[#e2e8e5]">
                  <span>Active Grower Stalls</span>
                  {stats?.pendingApprovals ? (
                    <span className="text-[#f59e0b] font-semibold">{stats.pendingApprovals} Pending</span>
                  ) : (
                    <span className="text-[#064e3b] font-medium">All Approved</span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Total Customers */}
            <div className="bg-white border border-[#e2e8e5] rounded-3xl p-6 text-[#10231d] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#64748b]">
                  Customers & Buyers
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-5">
                <div className="text-3xl font-serif font-normal text-[#10231d] tracking-tight">
                  {isLoadingStats ? '—' : stats?.totalCustomers ?? 0}
                </div>
                <div className="text-xs text-[#64748b] mt-3 pt-2.5 border-t border-[#e2e8e5]">
                  Household & Commercial Patrons
                </div>
              </div>
            </div>

            {/* Card 3: Total Markets */}
            <div className="bg-white border border-[#e2e8e5] rounded-3xl p-6 text-[#10231d] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#64748b]">
                  Total Markets
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b]">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-5">
                <div className="text-3xl font-serif font-normal text-[#10231d] tracking-tight">
                  {isLoadingStats ? '—' : stats?.totalMarkets ?? 0}
                </div>
                <div className="text-xs text-[#64748b] mt-3 pt-2.5 border-t border-[#e2e8e5]">
                  Physical Mandi Terminals
                </div>
              </div>
            </div>

            {/* Card 4: Total Orders */}
            <div className="bg-white border border-[#e2e8e5] rounded-3xl p-6 text-[#10231d] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#64748b]">
                  Total Orders
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b]">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-5">
                <div className="text-3xl font-serif font-normal text-[#10231d] tracking-tight">
                  {isLoadingStats ? '—' : stats?.totalOrders ?? 0}
                </div>
                <div className="text-xs text-[#64748b] mt-3 pt-2.5 border-t border-[#e2e8e5]">
                  Platform Pre-Order Reservations
                </div>
              </div>
            </div>

            {/* Card 5: Total Revenue */}
            <div className="bg-white border border-[#e2e8e5] rounded-3xl p-6 text-[#10231d] flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#64748b]">
                  Total Revenue
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b]">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-5">
                <div className="text-3xl font-serif font-normal text-[#064e3b] tracking-tight">
                  {isLoadingStats ? '—' : `Rs. ${(stats?.totalRevenue ?? 0).toLocaleString()}`}
                </div>
                <div className="text-xs text-[#64748b] mt-3 pt-2.5 border-t border-[#e2e8e5]">
                  Completed Mandi Turnovers
                </div>
              </div>
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#e2e8e5] rounded-3xl p-7 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] text-[#064e3b] flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-normal text-xl text-[#10231d]">Grower Approvals & Status</h3>
                <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                  Review new kisan stall registrations, grant harvest listing privileges, or suspend accounts for quality compliance.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('users')}
                className="mt-6 inline-flex items-center justify-between w-full px-4.5 py-3 rounded-xl bg-[#064e3b] text-white text-xs font-semibold hover:bg-[#043d2e] transition cursor-pointer"
              >
                <span>Manage Users & Approvals</span>
                <span className="text-emerald-300">→</span>
              </button>
            </div>

            <div className="bg-white border border-[#e2e8e5] rounded-3xl p-7 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] text-[#064e3b] flex items-center justify-center mb-4">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-normal text-xl text-[#10231d]">Mandi Markets &amp; Stalls</h3>
                <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                  Add new Mandi markets, edit operating timings, update GPS coordinates, and manage stall counts.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('markets')}
                className="mt-6 inline-flex items-center justify-between w-full px-4.5 py-3 rounded-xl bg-[#064e3b] text-white text-xs font-semibold hover:bg-[#043d2e] transition cursor-pointer"
              >
                <span>Manage Mandi Markets</span>
                <span className="text-emerald-300">→</span>
              </button>
            </div>

            <div className="bg-white border border-[#e2e8e5] rounded-3xl p-7 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] text-[#064e3b] flex items-center justify-center mb-4">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-normal text-lg text-[#10231d]">System Broadcasts & Config</h3>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  Publish platform-wide bulletins for weather / mandi timings and maintain standardized agricultural produce categories.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('system')}
                className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#064e3b] text-white text-xs font-semibold hover:bg-[#043d2e] transition cursor-pointer"
              >
                <span>System Configuration</span>
                <span className="text-emerald-300">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. TAB: MANAGE USERS */}
      {/* ===================================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filters & Search */}
          <div className="bg-white border border-[#e2e8e5] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: `All Users (${users.length})` },
                { id: 'farmer', label: `Farmers (${users.filter((u) => u.role === 'farmer').length})` },
                { id: 'customer', label: `Customers (${users.filter((u) => u.role === 'customer').length})` },
                {
                  id: 'pending',
                  label: `Pending Approvals (${users.filter((u) => u.role === 'farmer' && u.isApproved === false).length})`,
                },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setUserRoleFilter(rf.id as UserRoleFilter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition cursor-pointer ${
                    userRoleFilter === rf.id
                      ? 'bg-[#064e3b] text-white shadow-xs'
                      : 'bg-[#eef2ec] text-[#064e3b] hover:bg-[#eae8df]'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, farm, email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] placeholder-[#64748b]/60 focus:outline-none focus:border-[#10b981] focus:bg-white"
                />
              </div>
              <button
                onClick={loadUsers}
                disabled={isLoadingUsers}
                className="p-2 rounded-xl bg-white hover:bg-[#eef2ec] border border-[#e2e8e5] text-[#10231d] transition shadow-2xs cursor-pointer shrink-0"
                title="Refresh user list in real-time"
              >
                <RefreshCw className={`w-4 h-4 text-[#064e3b] ${isLoadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-[#e2e8e5] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8f7f2] text-[#064e3b] uppercase tracking-wider text-[11px] font-semibold border-b border-[#e2e8e5]">
                    <th className="py-3.5 px-4 sm:px-6">User / Entity</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Farm / Stall / Org</th>
                    <th className="py-3.5 px-4">Status & Approval</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8e5] text-[#10231d]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#64748b]">
                        No users match the selected role filter or search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isFarmer = u.role === 'farmer';
                      const isPendingFarmer = isFarmer && u.isApproved === false;
                      const isSuspended = !!u.isSuspended;
                      const isLoadingAction = userActionLoadingId === u.id || userActionLoadingId === (u as any)._id;

                      return (
                        <tr key={u.id || (u as any)._id} className="hover:bg-[#ecfdf5]/40 transition">
                          {/* Name & Email */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover border border-[#e2e8e5] shrink-0"
                              />
                              <div>
                                <div className="font-semibold text-[#10231d] text-sm">{u.name}</div>
                                <div className="text-[#64748b] text-[11px]">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-4 px-4">
                            <UserRoleBadge role={u.role} />
                          </td>

                          {/* Farm / Stall / Org */}
                          <td className="py-4 px-4">
                            {isFarmer ? (
                              <div>
                                <div className="font-medium text-[#10231d]">{u.farm_name || 'Farmer Stall'}</div>
                                <div className="text-[#64748b] text-[11px]">{u.stall_number || 'Stall A-14'}</div>
                              </div>
                            ) : (
                              <div className="text-[#64748b]">{u.organization || 'Customer'}</div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4">
                            <AccountStatusBadge isApproved={!isPendingFarmer} isSuspended={isSuspended} />
                          </td>

                          {/* Contact */}
                          <td className="py-4 px-4 text-[#64748b] text-[11px]">
                            <div>{u.phone || '—'}</div>
                            {u.cnic && <div className="text-[#64748b]/80 font-mono">CNIC: {u.cnic}</div>}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {/* Farmer Approval Button */}
                              {isPendingFarmer && (
                                <button
                                  disabled={isLoadingAction}
                                  onClick={() => handleApproveFarmer(u.id || (u as any)._id, u.name)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
                                  title="Approve farmer registration to allow product listing"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                              )}

                              {/* Suspend, Reactivate, or Delete User */}
                              {isSuspended ? (
                                <button
                                  disabled={isLoadingAction}
                                  onClick={() => handleActivateUser(u.id || (u as any)._id, u.name)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs transition disabled:opacity-50 cursor-pointer shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  Activate
                                </button>
                              ) : (
                                u.role !== 'admin' && (
                                  <button
                                    disabled={isLoadingAction}
                                    onClick={() =>
                                      setDeleteTarget({
                                        type: 'suspend_user',
                                        id: u.id || (u as any)._id,
                                        title: 'Suspend User Account',
                                        name: u.name,
                                        description: `Are you sure you want to suspend account for "${u.name}" (${u.email})? They will be unable to log in until reactivated.`,
                                        confirmText: 'Suspend Account',
                                        variant: 'warning',
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-[#b3261e] hover:bg-rose-50 font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
                                    title="Suspend account access"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                    Suspend
                                  </button>
                                )
                              )}

                              {u.role !== 'admin' && (
                                <button
                                  disabled={isLoadingAction}
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: 'delete_user',
                                      id: u.id || (u as any)._id,
                                      title: 'Delete User Account',
                                      name: u.name,
                                      description: `Are you sure you want to permanently delete user "${u.name}" (${u.email})? This action cannot be undone and will delete all user data.`,
                                      confirmText: 'Delete Account',
                                      variant: 'danger',
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#b3261e] transition cursor-pointer disabled:opacity-50"
                                  title="Delete user permanently"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. TAB: MANAGE MARKETS */}
      {/* ===================================================================== */}
      {activeTab === 'markets' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">Registered Mandi Markets</h2>
              <p className="text-xs text-slate-500">
                All Mandi markets are stored in the database and updated in real-time across the app.
              </p>
            </div>
            <button
              onClick={openAddMarketModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add New Market
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((m) => (
              <div
                key={m.id || (m as any)._id}
                className="bg-white border border-[#e2e8e5] rounded-2xl overflow-hidden text-[#10231d] flex flex-col justify-between shadow-xs hover:border-[#064e3b]/30 transition group"
              >
                <div>
                  {/* Market Image */}
                  <div className="h-44 w-full relative overflow-hidden bg-[#eef2ec]">
                    <img
                      src={m.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#e2e8e5] text-[#064e3b] text-xs font-semibold">
                      {m.city || 'Mandi Hub'}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#e2e8e5] text-[#64748b] text-xs font-medium">
                      {m.stall_count || 24} Bays
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-serif font-normal text-base text-[#10231d] leading-snug line-clamp-1">
                      {m.name}
                    </h3>
                    <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">
                      {m.description || m.location_address}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-[#e2e8e5] text-xs text-[#64748b]">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#064e3b] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{m.location_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
                        <span>{m.timings || `${m.opening_time} – ${m.closing_time}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
                        <span className="truncate">{m.operating_days || 'Daily'}</span>
                      </div>
                      <div className="text-[11px] text-[#64748b] font-mono pt-1">
                        GPS: {(Number(m.latitude) || 24.9721).toFixed(4)}° N, {(Number(m.longitude) || 67.1571).toFixed(4)}° E
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-[#f8f7f2] border-t border-[#e2e8e5] flex items-center justify-between">
                  <span className="text-[11px] text-[#064e3b] font-medium">
                    {m.is_active !== false ? '• Operating Mandi' : '• Inactive'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditMarketModal(m)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#eef2ec] border border-[#e2e8e5] text-[#10231d] transition cursor-pointer"
                      title="Edit market details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'market',
                          id: m.id || (m as any)._id,
                          title: 'Delete Mandi Market Terminal',
                          name: m.name,
                          description: `Are you sure you want to permanently remove "${m.name}" from the Mandi network? Any stalls associated with this market will be detached.`,
                          confirmText: 'Delete Market',
                          variant: 'danger',
                        })
                      }
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#b3261e] transition cursor-pointer"
                      title="Remove market from network"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. TAB: CONTENT MODERATION */}
      {/* ===================================================================== */}
      {activeTab === 'moderation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-[#e2e8e5] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModerationTab('reviews')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
                  moderationTab === 'reviews'
                    ? 'bg-[#064e3b] text-white'
                    : 'bg-[#eef2ec] text-[#064e3b] hover:bg-[#eae8df]'
                }`}
              >
                Customer Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setModerationTab('products')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
                  moderationTab === 'products'
                    ? 'bg-[#064e3b] text-white'
                    : 'bg-[#eef2ec] text-[#064e3b] hover:bg-[#eae8df]'
                }`}
              >
                Crop Listings ({products.length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={moderationTab === 'reviews' ? 'Filter reviews...' : 'Filter products...'}
                value={moderationSearch}
                onChange={(e) => setModerationSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] placeholder-[#64748b]/60 focus:outline-none focus:border-[#10b981] focus:bg-white"
              />
            </div>
          </div>

          {/* SubTab 1: Reviews Moderation */}
          {moderationTab === 'reviews' && (
            <div className="bg-white border border-[#e2e8e5] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f8f7f2] text-[#064e3b] uppercase tracking-wider text-[11px] font-semibold border-b border-[#e2e8e5]">
                      <th className="py-3.5 px-4 sm:px-6">Customer</th>
                      <th className="py-3.5 px-4">Rating & Crop</th>
                      <th className="py-3.5 px-4">Review Comment</th>
                      <th className="py-3.5 px-4">Grower Reply</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-slate-800">
                    {filteredReviews.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          No reviews found for moderation.
                        </td>
                      </tr>
                    ) : (
                      filteredReviews.map((r) => (
                        <tr key={r.id || r._id} className="hover:bg-emerald-50/40 transition">
                          <td className="py-4 px-4 sm:px-6">
                            <div className="font-semibold text-slate-900">{r.customer_name}</div>
                            <div className="text-slate-500 text-[11px]">
                              {new Date(r.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <span>★ {r.rating} / 5</span>
                            </div>
                            <div className="text-slate-600 text-[11px]">
                              {(r as any).product_name || 'Crop Review'}
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-md">
                            <p className="text-slate-700 italic">"{r.comment}"</p>
                          </td>
                          <td className="py-4 px-4 max-w-xs text-slate-600">
                            {r.farmer_response ? (
                              <div className="text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-[11px]">
                                <span className="font-semibold">Reply:</span> {r.farmer_response}
                              </div>
                            ) : (
                              <span className="text-slate-400">No reply yet</span>
                            )}
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'review',
                                  id: r.id || r._id!,
                                  title: 'Delete Customer Review',
                                  name: (r as any).product_name || 'Verified Review',
                                  description: `Are you sure you want to delete this customer review? It will no longer be visible on the produce listing.`,
                                  confirmText: 'Delete Review',
                                  variant: 'danger',
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#b3261e] font-semibold border border-rose-200 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab 2: Products Moderation */}
          {moderationTab === 'products' && (
            <div className="bg-white border border-[#e2e8e5] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f8f7f2] text-[#064e3b] uppercase tracking-wider text-[11px] font-semibold border-b border-[#e2e8e5]">
                      <th className="py-3.5 px-4 sm:px-6">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Grower & Mandi</th>
                      <th className="py-3.5 px-4">Price & Stock</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8e5] text-[#10231d]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#64748b]">
                          No crop listings found.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id || (p as any)._id} className="hover:bg-[#ecfdf5]/40 transition">
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80'}
                                alt={p.name}
                                className="w-10 h-10 rounded-xl object-cover border border-[#e2e8e5] shrink-0"
                              />
                              <div>
                                <div className="font-semibold text-[#10231d] text-sm">{p.name}</div>
                                <div className="text-[#64748b] text-[11px]">{p.farming_type || 'Organic'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ecfdf5] text-[#064e3b] border border-emerald-200">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-[#10231d]">{p.farmer_name || 'Grower Stall'}</div>
                            <div className="text-[#64748b] text-[11px]">{p.market_name || 'Sabzi Mandi'}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#10231d]">Rs. {p.price_per_unit || p.price} / {p.unit}</div>
                            <div className="text-[#64748b] text-[11px]">
                              {p.isSoldOut || p.in_stock <= 0 ? (
                                <span className="text-[#b3261e] font-medium">Sold Out</span>
                              ) : (
                                <span>{p.in_stock || (p as any).stockQuantity} in stock</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'product',
                                  id: p.id || (p as any)._id,
                                  title: 'Remove Produce Listing',
                                  name: p.name,
                                  description: `Are you sure you want to permanently remove "${p.name}" from the Mandi harvest catalog?`,
                                  confirmText: 'Remove Listing',
                                  variant: 'danger',
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#b3261e] font-semibold border border-rose-200 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove Listing
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. TAB: REPORTS & ANALYTICS */}
      {/* ===================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-[#e2e8e5] rounded-2xl p-5 text-[#10231d] shadow-xs">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#64748b]">
                Total Platform Volume
              </span>
              <div className="text-3xl font-serif font-normal text-[#10231d] mt-2">
                {reportsData?.totalPlatformOrders ?? 0}
              </div>
              <p className="text-xs text-[#64748b] mt-1">Aggregated across all Mandi terminals</p>
            </div>

            <div className="bg-white border border-[#e2e8e5] rounded-2xl p-5 text-[#10231d] shadow-xs">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#64748b]">
                Settled Mandi Turnover
              </span>
              <div className="text-3xl font-serif font-normal text-[#064e3b] mt-2">
                Rs. {(reportsData?.totalPlatformRevenue ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-[#64748b] mt-1">Physical cash handed over at stalls</p>
            </div>

            <div className="bg-white border border-[#e2e8e5] rounded-2xl p-5 text-[#10231d] shadow-xs">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#64748b]">
                Active Mandi Terminals
              </span>
              <div className="text-3xl font-serif font-normal text-[#10231d] mt-2">
                {reportsData?.marketReports?.length ?? 0}
              </div>
              <p className="text-xs text-[#64748b] mt-1">Karachi, Lahore & Islamabad hubs</p>
            </div>
          </div>

          {/* Section 1: Revenue by Market */}
          <div className="bg-white border border-[#e2e8e5] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-white text-[#10231d] border-b border-[#e2e8e5] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-normal text-base text-[#10231d]">Revenue & Volume by Mandi Market</h3>
                <p className="text-xs text-[#64748b]">Total orders placed and cash settled per regional terminal</p>
              </div>
              <Store className="w-5 h-5 text-[#064e3b]" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8f7f2] text-[#064e3b] uppercase tracking-wider text-[11px] font-semibold border-b border-[#e2e8e5]">
                    <th className="py-3 px-6">Mandi Market</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Completed Pickups</th>
                    <th className="py-3 px-6 text-right">Cash Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8e5] text-[#10231d]">
                  {(!reportsData?.marketReports || reportsData.marketReports.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#64748b]">
                        No market activity recorded yet.
                      </td>
                    </tr>
                  ) : (
                    reportsData.marketReports.map((mr) => (
                      <tr key={mr.marketId} className="hover:bg-[#ecfdf5]/50 transition">
                        <td className="py-3.5 px-6 font-semibold text-[#10231d]">{mr.marketName}</td>
                        <td className="py-3.5 px-4 text-[#64748b]">{mr.city}</td>
                        <td className="py-3.5 px-4 font-mono font-medium">{mr.totalOrders}</td>
                        <td className="py-3.5 px-4 font-mono text-[#064e3b] font-semibold">{mr.completedOrders}</td>
                        <td className="py-3.5 px-6 text-right font-bold text-[#064e3b] text-sm">
                          {formatCurrency(mr.totalRevenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Most Active Farmers */}
          <div className="bg-white border border-[#e2e8e5] rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-white text-[#10231d] border-b border-[#e2e8e5] flex items-center justify-between">
              <div>
                <h3 className="font-serif font-normal text-base text-[#10231d]">Top Performing Growers (By Turnover)</h3>
                <p className="text-xs text-[#64748b]">Ranked by settled cash revenue and total reservation volume</p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#064e3b]" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8f7f2] text-[#064e3b] uppercase tracking-wider text-[11px] font-semibold border-b border-[#e2e8e5]">
                    <th className="py-3 px-6">Rank &amp; Farmer</th>
                    <th className="py-3 px-4">Stall Number</th>
                    <th className="py-3 px-4">Active Crops</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Completed Pickups</th>
                    <th className="py-3 px-6 text-right">Cash Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8e5] text-[#10231d]">
                  {(!reportsData?.topFarmers || reportsData.topFarmers.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#64748b]">
                        No farmer sales data available yet.
                      </td>
                    </tr>
                  ) : (
                    reportsData.topFarmers.map((f, idx) => (
                      <tr key={f.farmerId} className="hover:bg-[#ecfdf5]/50 transition">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#ecfdf5] text-[#064e3b] font-semibold flex items-center justify-center text-xs border border-emerald-200">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-semibold text-[#10231d] text-sm">{f.farmName}</div>
                              <div className="text-[#64748b] text-[11px]">Grower: {f.farmerName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#64748b]">{f.stallNumber}</td>
                        <td className="py-3.5 px-4">{f.productCount} crop varieties</td>
                        <td className="py-3.5 px-4 font-mono">{f.orderCount}</td>
                        <td className="py-3.5 px-4 font-mono text-[#064e3b] font-semibold">{f.completedOrderCount}</td>
                        <td className="py-3.5 px-6 text-right font-bold text-[#064e3b] text-sm">
                          {formatCurrency(f.totalRevenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. TAB: SYSTEM CONFIGURATION */}
      {/* ===================================================================== */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
          {/* Card 1: Product Categories Manager */}
          <div className="bg-white border border-[#e2e8e5] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-[#e2e8e5]">
                <div className="p-2.5 rounded-xl bg-[#ecfdf5] text-[#064e3b]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-normal text-lg text-[#10231d]">Product Categories</h3>
                  <p className="text-xs text-[#64748b]">Categories used to filter and organize agricultural produce</p>
                </div>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="mt-5 flex gap-2">
                <input
                  type="text"
                  placeholder="New category name (e.g. Exotic Herbs)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8e5] text-xs text-[#10231d] placeholder-[#64748b]/60 focus:outline-none focus:border-[#10b981] bg-[#f8f7f2] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isSubmittingSystem || !newCategoryName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </form>

              {/* Categories List */}
              <div className="mt-6 space-y-2 max-h-96 overflow-y-auto pr-1">
                {categories.length === 0 ? (
                  <p className="text-xs text-[#64748b] text-center py-6">No categories defined.</p>
                ) : (
                  categories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs"
                    >
                      <span className="font-medium text-[#10231d]">{c.name}</span>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'category',
                            id: c.id,
                            title: 'Delete Produce Category',
                            name: c.name,
                            description: `Are you sure you want to permanently delete category "${c.name}"? Products in this category will become unassigned.`,
                            confirmText: 'Delete Category',
                            variant: 'danger',
                          })
                        }
                        className="text-[#64748b] hover:text-[#b3261e] transition p-1 cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#64748b] pt-4 border-t border-[#e2e8e5] mt-6">
              Total active categories: <span className="font-semibold text-[#10231d]">{categories.length}</span>
            </p>
          </div>

          {/* Card 2: Platform Announcements Manager */}
          <div className="bg-white border border-[#e2e8e5] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-[#e2e8e5]">
                <div className="p-2.5 rounded-xl bg-[#ecfdf5] text-[#064e3b]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-normal text-lg text-[#10231d]">Platform Announcements</h3>
                  <p className="text-xs text-[#64748b]">
                    Broadcast bulletins that customers and farmers see directly on their dashboard
                  </p>
                </div>
              </div>

              {/* Post Announcement Form */}
              <form onSubmit={handlePostAnnouncement} className="mt-5 space-y-3">
                <textarea
                  rows={3}
                  placeholder="Enter platform bulletin message (e.g. Sabzi Mandi Gate 3 opening 30 mins early tomorrow due to high dawn arrivals)..."
                  value={newAnnouncementMessage}
                  onChange={(e) => setNewAnnouncementMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8e5] text-xs text-[#10231d] placeholder-[#64748b]/60 focus:outline-none focus:border-[#10b981] bg-[#f8f7f2] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isSubmittingSystem || !newAnnouncementMessage.trim()}
                  className="w-full py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white font-semibold text-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Megaphone className="w-4 h-4 text-emerald-300" />
                  Broadcast Announcement
                </button>
              </form>

              {/* Active Announcements List */}
              <div className="mt-6 space-y-3 max-h-80 overflow-y-auto pr-1">
                {announcements.length === 0 ? (
                  <p className="text-xs text-[#64748b] text-center py-6">No active platform announcements.</p>
                ) : (
                  announcements.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-xs flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="text-[#10231d] leading-relaxed font-medium">{a.message}</p>
                        <span className="text-[10px] text-[#64748b]">
                          Posted on {new Date(a.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setDeleteTarget({
                            type: 'announcement',
                            id: a.id,
                            title: 'Remove Platform Announcement',
                            name: a.message.length > 40 ? a.message.slice(0, 40) + '...' : a.message,
                            description: 'Are you sure you want to permanently remove this bulletin from all user dashboards?',
                            confirmText: 'Remove Bulletin',
                            variant: 'danger',
                          })
                        }
                        className="text-[#64748b] hover:text-[#b3261e] transition p-1 shrink-0 cursor-pointer"
                        title="Remove announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#64748b] pt-4 border-t border-[#e2e8e5] mt-6">
              Active bulletins: <span className="font-semibold text-[#10231d]">{announcements.length}</span>
            </p>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD / EDIT MARKET */}
      {/* ===================================================================== */}
      {isMarketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10231d]/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#e2e8e5] rounded-2xl p-6 sm:p-8 text-[#10231d] shadow-2xl relative my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e8e5]">
              <div>
                <h3 className="font-serif font-normal text-xl text-[#10231d]">
                  {editingMarket ? 'Edit Mandi Market' : 'Add New Mandi Market'}
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Configure location details, schedule, and stall capacity
                </p>
              </div>
              <button
                onClick={() => setIsMarketModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarket} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                    Market Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={marketFormData.name}
                    onChange={(e) => setMarketFormData({ ...marketFormData, name: e.target.value })}
                    placeholder="e.g. Super Highway Sabzi Mandi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] placeholder-[#64748b]/60 focus:outline-none focus:border-[#10b981] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={marketFormData.city}
                    onChange={(e) => setMarketFormData({ ...marketFormData, city: e.target.value })}
                    placeholder="e.g. Karachi, Lahore, Islamabad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] placeholder-[#64748b]/60 focus:outline-none focus:border-[#10b981] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                  Physical Address *
                </label>
                <input
                  type="text"
                  required
                  value={marketFormData.address}
                  onChange={(e) => setMarketFormData({ ...marketFormData, address: e.target.value })}
                  placeholder="e.g. Main Super Highway (M-9), Scheme 33, Karachi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] placeholder-[#64748b]/60 focus:outline-none focus:border-[#10b981] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={marketFormData.latitude}
                    onChange={(e) => setMarketFormData({ ...marketFormData, latitude: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-none focus:border-[#10b981] font-mono focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={marketFormData.longitude}
                    onChange={(e) => setMarketFormData({ ...marketFormData, longitude: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-none focus:border-[#10b981] font-mono focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                    Total Stall Count
                  </label>
                  <input
                    type="number"
                    value={marketFormData.stall_count}
                    onChange={(e) => setMarketFormData({ ...marketFormData, stall_count: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-none focus:border-[#10b981] font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                    Operating Days
                  </label>
                  <input
                    type="text"
                    value={marketFormData.operating_days}
                    onChange={(e) => setMarketFormData({ ...marketFormData, operating_days: e.target.value })}
                    placeholder="e.g. Daily, or Monday, Tuesday..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-none focus:border-[#10b981] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                      Opens
                    </label>
                    <input
                      type="text"
                      value={marketFormData.opening_time}
                      onChange={(e) => setMarketFormData({ ...marketFormData, opening_time: e.target.value })}
                      placeholder="04:30 AM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-none focus:border-[#10b981] font-mono focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                      Closes
                    </label>
                    <input
                      type="text"
                      value={marketFormData.closing_time}
                      onChange={(e) => setMarketFormData({ ...marketFormData, closing_time: e.target.value })}
                      placeholder="11:30 AM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-none focus:border-[#10b981] font-mono focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#064e3b] mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  value={marketFormData.image_url}
                  onChange={(e) => setMarketFormData({ ...marketFormData, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f7f2] border border-[#e2e8e5] text-xs text-[#10231d] focus:outline-none focus:border-[#10b981] font-mono focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8e5]">
                <button
                  type="button"
                  onClick={() => setIsMarketModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e8e5] text-[#10231d] hover:bg-[#eef2ec] text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  {editingMarket ? 'Update Market' : 'Create Market'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CONFIRM DELETE MODAL (Unified across all deletion actions)            */}
      {/* ===================================================================== */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleExecuteConfirmedDelete}
          title={deleteTarget.title}
          itemName={deleteTarget.name}
          description={deleteTarget.description}
          confirmButtonText={deleteTarget.confirmText || 'Delete Permanently'}
          variant={deleteTarget.variant || 'danger'}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminDashboardView;
