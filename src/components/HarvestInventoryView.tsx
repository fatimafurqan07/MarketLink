import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Sprout,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  Clock,
  ShieldCheck,
  Upload,
  Link,
  Sparkles,
  Trash2,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Star,
  MessageSquare,
  Send,
  RotateCcw,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  BookmarkCheck,
  User as UserIcon,
  Phone,
  Mail,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Product, User, FarmerProfile, Order, Review } from '../types.ts';
import { api } from '../services/api.ts';
import { LuxurySelect } from './common/LuxurySelect.tsx';
import { OrderStatusBadge, ProductStockBadge } from './common/StatusBadge.tsx';
import { formatCurrency } from '../utils/formatters.ts';
import { FarmerWeatherWidget } from './common/FarmerWeatherWidget.tsx';

interface HarvestInventoryViewProps {
  products: Product[];
  currentUser: User;
  farmers?: FarmerProfile[];
  currentFarmerProfile?: FarmerProfile | null;
  onRefreshProducts: () => void;
  orders?: Order[];
  onRefreshOrders?: () => void;
}

// Authentic Verified Crop Presets with true-to-life Unsplash agricultural photography
const CROP_PRESETS = [
  {
    name: 'Organic Roma Tomatoes',
    category: 'Fresh Vegetables' as const,
    unit: 'kg' as const,
    price: '2.80',
    farmingType: 'Organic' as const,
    description: 'Plump, sun-ripened red Roma tomatoes harvested at morning dawn. Dense flesh, low seeds, ideal for rich sauces.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Crisp Fuji Apples',
    category: 'Orchard Fruits' as const,
    unit: 'kg' as const,
    price: '3.50',
    farmingType: 'Organic' as const,
    description: 'Crisp, sweet, and extraordinarily juicy mountain Fuji apples grown without chemical waxes.',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Farm Fresh Brown Eggs',
    category: 'Farm Fresh Dairy & Eggs' as const,
    unit: 'dozen' as const,
    price: '4.50',
    farmingType: 'Conventional' as const,
    description: 'Pasture-raised grade-A brown eggs from free-range heritage hens roaming clover meadows.',
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Raw Wildflower Honey',
    category: 'Raw Honey & Preserves' as const,
    unit: 'jar' as const,
    price: '8.00',
    farmingType: 'Organic' as const,
    description: 'Unfiltered, unheated pure raw honey harvested from apiaries beside mountain wildflower meadows.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Fresh Baby Spinach',
    category: 'Fresh Vegetables' as const,
    unit: 'bunch' as const,
    price: '2.20',
    farmingType: 'Organic' as const,
    description: 'Tender baby spinach leaves triple-washed in natural mountain spring water. Crisp texture with sweet flavor.',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Organic Nantes Carrots',
    category: 'Fresh Vegetables' as const,
    unit: 'kg' as const,
    price: '2.00',
    farmingType: 'Organic' as const,
    description: 'Crunchy sweet organic carrots freshly pulled from sandy loam soil with leafy green tops attached.',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sweet Italian Genovese Basil',
    category: 'Organic Herbs' as const,
    unit: 'bunch' as const,
    price: '2.50',
    farmingType: 'Organic' as const,
    description: 'Fragrant broadleaf Genovese basil bunches cut at sunrise for pesto, caprese, and pasta garnishes.',
    imageUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Plump Orchard Blackberries',
    category: 'Orchard Fruits' as const,
    unit: 'punnet' as const,
    price: '4.50',
    farmingType: 'Organic' as const,
    description: 'Hand-harvested dark berries bursting with deep summer sweetness packed in ventilated pulp punnets.',
    imageUrl: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tuscan Dinosaur Kale',
    category: 'Fresh Vegetables' as const,
    unit: 'bunch' as const,
    price: '2.50',
    farmingType: 'Organic' as const,
    description: 'Crinkled dark blue-green Lacinato kale leaves packed with calcium and vitamin K. Hearty and tender.',
    imageUrl: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&w=800&q=80',
  },
];

type FarmerTab = 'products' | 'orders' | 'insights' | 'reviews';

interface FarmerInsightsData {
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
}

export const HarvestInventoryView: React.FC<HarvestInventoryViewProps> = ({
  products,
  currentUser,
  farmers = [],
  currentFarmerProfile,
  onRefreshProducts,
  onRefreshOrders,
}) => {
  const [activeTab, setActiveTab] = useState<FarmerTab>('products');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Farmer Orders State
  const [farmerOrders, setFarmerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'placed' | 'accepted' | 'ready' | 'completed' | 'cancelled'>('all');
  const [declineModalOrder, setDeclineModalOrder] = useState<Order | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);

  // Farmer Insights State
  const [insights, setInsights] = useState<FarmerInsightsData | null>(null);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);

  // Reviews State
  const [farmerReviews, setFarmerReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);

  // Weekly Template Applying State
  const [isApplyingTemplate, setIsApplyingTemplate] = useState<boolean>(false);
  const [optimisticSoldOutMap, setOptimisticSoldOutMap] = useState<Record<string | number, boolean>>({});
  const [optimisticTemplateMap, setOptimisticTemplateMap] = useState<Record<string | number, boolean>>({});

  // Dynamically resolve farmer profile strictly from authenticated user session
  const farmerProfile =
    currentFarmerProfile ||
    farmers.find((f) => f.user_id === currentUser.id) ||
    null;

  const resolvedFarmerId = farmerProfile
    ? farmerProfile.id
    : currentUser.role === 'admin'
    ? farmers[0]?.id || 1
    : null;
  const resolvedMarketId = farmerProfile
    ? farmerProfile.market_id
    : farmers.find((f) => f.id === resolvedFarmerId)?.market_id || 1;

  // Add stock form state
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<Product['category']>('Fresh Vegetables');
  const [price, setPrice] = useState<string>('2.80');
  const [unit, setUnit] = useState<Product['unit']>('kg');
  const [stockQty, setStockQty] = useState<string>('40');
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [farmingType, setFarmingType] = useState<'Organic' | 'Conventional'>('Organic');
  const [description, setDescription] = useState<string>('');
  const [isTemplateItem, setIsTemplateItem] = useState<boolean>(true);

  // Image Upload Mode: 'upload' (local file/base64) | 'url' (web link)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter products for this farmer (or all if admin)
  const farmerProducts = currentUser.role === 'admin'
    ? products
    : products.filter((p) => p.farmer_id === resolvedFarmerId || (p as any).farmerId === resolvedFarmerId);

  // Fetch Farmer Orders
  const fetchFarmerOrders = async () => {
    setLoadingOrders(true);
    try {
      const ords = await api.getFarmerOrders();
      setFarmerOrders(ords);
    } catch (err) {
      console.warn('Could not load incoming orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Insights
  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const data = await api.getFarmerInsights();
      setInsights(data);
    } catch (err) {
      console.warn('Could not load insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Fetch Reviews
  const fetchFarmerReviews = async () => {
    setLoadingReviews(true);
    try {
      const revs = await api.getFarmerReviews();
      setFarmerReviews(revs);
    } catch (err) {
      console.warn('Could not load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load data based on tab
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchFarmerOrders();
    } else if (activeTab === 'insights') {
      fetchInsights();
    } else if (activeTab === 'reviews') {
      fetchFarmerReviews();
    }
  }, [activeTab]);

  // Initial orders & insights fetch in background
  useEffect(() => {
    fetchFarmerOrders();
    fetchInsights();
  }, []);

  // Handle direct local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Image size should be under 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setImageUrlInput('');
    };
    reader.readAsDataURL(file);
  };

  // Quick Preset Selection
  const handleSelectPreset = (preset: typeof CROP_PRESETS[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setPrice(preset.price);
    setUnit(preset.unit);
    setFarmingType(preset.farmingType);
    setDescription(preset.description);
    setImagePreview(preset.imageUrl);
    setImageUrlInput(preset.imageUrl);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !stockQty) {
      setFeedback({ type: 'error', message: 'Produce name, price, and stock quantity are required.' });
      return;
    }

    const resolvedImageUrl =
      imagePreview.trim() ||
      imageUrlInput.trim() ||
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';

    if (!resolvedFarmerId) {
      setFeedback({
        type: 'error',
        message: 'No registered farmer stall profile found for this account. Please register your stall profile first.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const numPrice = parseFloat(price);
      const numQty = parseInt(stockQty);

      await api.addProduct({
        name: name.trim(),
        category,
        price_per_unit: numPrice,
        unit,
        stock_limit: numQty,
        in_stock: numQty,
        farming_type: farmingType,
        harvest_date: harvestDate,
        description: description.trim() || `Freshly harvested ${name.trim()} from certified community grower.`,
        image_url: resolvedImageUrl,
        status: 'active',
        farmer_id: resolvedFarmerId,
        market_id: resolvedMarketId,
      });

      setFeedback({ type: 'success', message: `Added "${name}" to today's active harvest inventory!` });
      setIsModalOpen(false);

      setName('');
      setDescription('');
      setImagePreview('');
      setImageUrlInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      onRefreshProducts();
      fetchInsights();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to publish harvest stock.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick stock quantity adjustments directly from table
  const handleQuickStockAdjust = async (prod: Product, delta: number) => {
    const newStock = Math.max(0, prod.in_stock + delta);
    try {
      await api.updateProduct(prod.id, {
        in_stock: newStock,
        status: newStock === 0 ? 'out_of_stock' : 'active',
      });
      onRefreshProducts();
    } catch {
      setFeedback({ type: 'error', message: 'Could not update stock level.' });
    }
  };

  // Toggle Sold Out with Instant Optimistic UI Response
  const handleToggleSoldOut = async (prod: Product) => {
    const currentSoldOut = optimisticSoldOutMap[prod.id] !== undefined
      ? optimisticSoldOutMap[prod.id]
      : (prod.is_sold_out || (prod as any).isSoldOut || prod.in_stock <= 0);
    const willBeSoldOut = !currentSoldOut;

    // Instant local state update for zero latency
    setOptimisticSoldOutMap((prev) => ({ ...prev, [prod.id]: willBeSoldOut }));
    prod.is_sold_out = willBeSoldOut;
    (prod as any).isSoldOut = willBeSoldOut;
    if (!willBeSoldOut && prod.in_stock <= 0) {
      prod.in_stock = 15;
    }

    try {
      const res = await api.toggleProductSoldOut(prod.id);
      setFeedback({
        type: 'success',
        message: res.message || `"${prod.name}" is now marked as ${willBeSoldOut ? 'Sold Out' : 'Available'}.`,
      });
      onRefreshProducts();
    } catch (err) {
      // Revert on error
      setOptimisticSoldOutMap((prev) => ({ ...prev, [prod.id]: currentSoldOut }));
      prod.is_sold_out = currentSoldOut;
      (prod as any).isSoldOut = currentSoldOut;
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to toggle sold out state.',
      });
    }
  };

  // Toggle Weekly Template inclusion
  const handleToggleTemplate = async (prod: Product) => {
    const currentTemplate = optimisticTemplateMap[prod.id] !== undefined
      ? optimisticTemplateMap[prod.id]
      : Boolean(prod.is_template_active ?? (prod as any).isTemplateActive);
    const newStatus = !currentTemplate;

    setOptimisticTemplateMap((prev) => ({ ...prev, [prod.id]: newStatus }));
    try {
      await api.updateProductTemplate(prod.id, {
        isTemplateActive: newStatus,
        defaultStockQuantity: prod.default_stock_quantity || prod.in_stock || 25,
      });
      setFeedback({
        type: 'success',
        message: `"${prod.name}" ${newStatus ? 'marked as' : 'removed from'} weekly restock template.`,
      });
      onRefreshProducts();
    } catch (err) {
      setOptimisticTemplateMap((prev) => ({ ...prev, [prod.id]: currentTemplate }));
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update template preference.',
      });
    }
  };

  // Apply Weekly Template
  const handleApplyWeeklyTemplate = async () => {
    setIsApplyingTemplate(true);
    setFeedback(null);
    try {
      const res = await api.applyWeeklyTemplate();
      setFeedback({
        type: 'success',
        message: res.message || `Successfully applied weekly stock template to ${res.count} crops.`,
      });
      onRefreshProducts();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to apply weekly template.',
      });
    } finally {
      setIsApplyingTemplate(false);
    }
  };

  // Farmer Order Actions
  const handleAcceptOrder = async (order: Order) => {
    setIsActionInProgress(true);
    try {
      const res = await api.acceptOrder(order.id);
      setFeedback({
        type: 'success',
        message: res.message || `Order #${order.order_code} accepted! Customer notified.`,
      });
      fetchFarmerOrders();
      fetchInsights();
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to accept order.',
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleOpenDeclineModal = (order: Order) => {
    setDeclineModalOrder(order);
    setDeclineReason('');
  };

  const handleConfirmDecline = async () => {
    if (!declineModalOrder) return;
    setIsActionInProgress(true);
    try {
      const res = await api.declineOrder(declineModalOrder.id, declineReason);
      setFeedback({
        type: 'success',
        message: res.message || `Order #${declineModalOrder.order_code} declined. Produce stock restored to stall inventory.`,
      });
      setDeclineModalOrder(null);
      fetchFarmerOrders();
      fetchInsights();
      onRefreshProducts();
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to decline order.',
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleMarkReady = async (order: Order) => {
    setIsActionInProgress(true);
    try {
      const res = await api.markOrderReady(order.id);
      setFeedback({
        type: 'success',
        message: res.message || `Order #${order.order_code} marked ready for pickup!`,
      });
      fetchFarmerOrders();
      fetchInsights();
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to mark order ready.',
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Review Response Action
  const handleSubmitReviewResponse = async (reviewId: string) => {
    const text = replyTextMap[reviewId]?.trim();
    if (!text) return;

    setSubmittingReplyId(reviewId);
    try {
      const res = await api.respondToReview(reviewId, text);
      setFeedback({
        type: 'success',
        message: res.message || 'Grower response published successfully.',
      });
      setEditingReplyId(null);
      fetchFarmerReviews();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to post response.',
      });
    } finally {
      setSubmittingReplyId(null);
    }
  };

  // Filtered orders
  const filteredOrders = farmerOrders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.order_status === orderFilter;
  });

  const pendingOrdersCount = farmerOrders.filter(
    (o) => o.order_status === 'placed' || o.order_status === 'accepted'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e2e8e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#064e3b] font-semibold text-[10px] uppercase border border-emerald-200">
              Grower Command Center
            </span>
            <span className="text-xs text-[#64748b] font-medium">Daily Dawn Harvest Batches</span>
          </div>
          <h2 className="text-2xl font-serif font-normal text-[#10231d] tracking-tight">
            {farmerProfile?.farm_name || 'Farmer Stall'} Dashboard
          </h2>
          <p className="text-xs text-[#64748b] mt-1 max-w-xl">
            {farmerProfile ? (
              <span>
                Managing physical stall <strong>{farmerProfile.stall_number}</strong> at {farmerProfile.market_name || 'Central Sabzi Mandi'}.
                Cutoff deadline is {farmerProfile.cutoff_hours || 12}h prior to morning market opening.
              </span>
            ) : (
              <span>
                Manage stall crops, process incoming reservations, track real-time revenue, and engage with customer reviews.
              </span>
            )}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleApplyWeeklyTemplate}
            disabled={isApplyingTemplate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#eef2ec] hover:bg-[#eae8df] text-[#064e3b] border border-[#e2e8e5] rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Reset active crops to default weekly stock levels"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isApplyingTemplate ? 'animate-spin' : ''}`} />
            <span>{isApplyingTemplate ? 'Applying...' : 'Apply Weekly Template'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer border border-[#064e3b]"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Today's Stock</span>
          </button>
        </div>
      </div>

      {/* Modern High-End Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#e2e8e5] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:text-[#064e3b] hover:bg-[#eef2ec]'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-400" />
          <span>Manage Products</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'products' ? 'bg-[#043d2e] text-emerald-200' : 'bg-[#eef2ec] text-[#064e3b]'
          }`}>
            {farmerProducts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:text-[#064e3b] hover:bg-[#eef2ec]'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>Incoming Orders</span>
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold animate-pulse">
              {pendingOrdersCount} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'insights'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:text-[#064e3b] hover:bg-[#eef2ec]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:text-[#064e3b] hover:bg-[#eef2ec]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Product Reviews</span>
          {farmerReviews.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'reviews' ? 'bg-[#043d2e] text-emerald-200' : 'bg-[#eef2ec] text-[#064e3b]'
            }`}>
              {farmerReviews.length}
            </span>
          )}
        </button>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-700 cursor-pointer font-bold text-base leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MANAGE PRODUCTS                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Today's Climate & Weather Widget for Farmer */}
          <FarmerWeatherWidget cityName={currentUser.city || 'Mandi Hub'} />

          {/* Quick Explainer Bar */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-[#15803D]">
              <BookmarkCheck className="w-4 h-4 shrink-0" />
              <span>
                <strong>Weekly Restock Template:</strong> Tag items with the template badge to instantly restore stock each Monday dawn using the <em>Apply Weekly Template</em> button.
              </span>
            </div>
            <button
              onClick={handleApplyWeeklyTemplate}
              disabled={isApplyingTemplate}
              className="text-xs font-semibold text-[#064e3b] underline hover:text-[#043d2e] cursor-pointer self-start sm:self-auto shrink-0"
            >
              Reset All Template Items Now →
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8e5] shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e2e8e5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#064e3b]" />
                <h3 className="font-serif font-normal text-[#10231d] text-base">Active Stall Inventory Ledger</h3>
              </div>
              <span className="text-xs text-[#64748b] font-mono">
                {farmerProducts.length} crop types registered
              </span>
            </div>

            {farmerProducts.length === 0 ? (
              <div className="p-12 text-center text-[#64748b]">
                <Sprout className="w-12 h-12 mx-auto text-[#064e3b] mb-3 opacity-60" />
                <p className="text-sm font-semibold text-[#10231d]">No crops listed for today's harvest</p>
                <p className="text-xs text-[#64748b] mt-1 max-w-sm mx-auto">
                  Click &quot;Add Today&apos;s Stock&quot; to upload your crop photos, set prices, and allow customers to reserve baskets for weekend pickup.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e2e8e5]">
                {farmerProducts.map((p) => {
                  const isSoldOut = optimisticSoldOutMap[p.id] !== undefined
                    ? optimisticSoldOutMap[p.id]
                    : Boolean(p.is_sold_out || (p as any).isSoldOut || p.in_stock <= 0);
                  const isTemplate = optimisticTemplateMap[p.id] !== undefined
                    ? optimisticTemplateMap[p.id]
                    : Boolean(p.is_template_active || (p as any).isTemplateActive);

                  return (
                    <div
                      key={p.id}
                      className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#f8f7f2]/60 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-[#e2e8e5] shrink-0">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-serif font-normal text-base text-[#10231d]">{p.name}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#064e3b] font-mono text-[10px] font-bold border border-emerald-200">
                              {p.farming_type || 'Organic'}
                            </span>
                            {isTemplate && (
                              <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] font-mono text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                                <BookmarkCheck className="w-3 h-3" />
                                Weekly Template
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748b] mt-0.5">
                            {p.category} • Harvested {p.harvest_date || 'Today'}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#10231d] font-mono">
                            <span><strong>Rs. {p.price_per_unit.toLocaleString()}</strong> / {p.unit}</span>
                            <span className="text-stone-300">•</span>
                            <span className={!isSoldOut ? 'text-[#064e3b]' : 'text-[#b3261e]'}>
                              {p.in_stock} {p.unit} in stock
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
                        {/* Sold Out Toggle Switch */}
                        <div className="flex items-center gap-2 bg-[#f8f7f2] border border-[#e2e8e5] px-3 py-1.5 rounded-xl">
                          <span className="text-[11px] font-semibold text-[#64748b]">
                            {isSoldOut ? 'Sold Out' : 'Available'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleSoldOut(p)}
                            className="cursor-pointer transition-transform hover:scale-105"
                            title={isSoldOut ? 'Click to mark Available' : 'Click to mark Sold Out'}
                          >
                            {isSoldOut ? (
                              <ToggleLeft className="w-6 h-6 text-[#b3261e]" />
                            ) : (
                              <ToggleRight className="w-6 h-6 text-[#064e3b]" />
                            )}
                          </button>
                        </div>

                        {/* Weekly Template Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleTemplate(p)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isTemplate
                              ? 'bg-[#ecfdf5] text-[#064e3b] border-emerald-200 hover:bg-emerald-100'
                              : 'bg-[#f8f7f2] text-[#64748b] border-[#e2e8e5] hover:bg-[#eae8df]'
                          }`}
                          title="Toggle weekly stock restoration template"
                        >
                          <BookmarkCheck className={`w-3.5 h-3.5 ${isTemplate ? 'text-[#064e3b]' : 'text-stone-400'}`} />
                          <span>{isTemplate ? 'In Template' : '+ Add to Template'}</span>
                        </button>

                        {/* Stock Increment / Decrement Quick Controls */}
                        <div className="flex items-center border border-[#e2e8e5] rounded-xl bg-white overflow-hidden shadow-xs">
                          <button
                            onClick={() => handleQuickStockAdjust(p, -5)}
                            disabled={p.in_stock <= 0}
                            className="px-2.5 py-1.5 text-xs font-bold text-[#64748b] hover:bg-[#f8f7f2] disabled:opacity-40 cursor-pointer"
                            title="Deduct 5 units"
                          >
                            -5
                          </button>
                          <span className="px-3 text-xs font-mono font-bold text-[#10231d] min-w-10 text-center">
                            {p.in_stock}
                          </span>
                          <button
                            onClick={() => handleQuickStockAdjust(p, 5)}
                            className="px-2.5 py-1.5 text-xs font-bold text-[#64748b] hover:bg-[#f8f7f2] cursor-pointer"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase border ${
                            !isSoldOut
                              ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {!isSoldOut ? 'Active' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INCOMING ORDERS                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Status Filters */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-4 rounded-2xl border border-[#e2e8e5]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-4 h-4 text-stone-400 mr-1" />
              {(['all', 'placed', 'accepted', 'ready', 'completed', 'cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    orderFilter === st
                      ? 'bg-[#064e3b] text-white shadow-xs'
                      : 'bg-[#eef2ec] text-[#064e3b] hover:bg-[#eae8df]'
                  }`}
                >
                  {st === 'all' ? 'All Orders' : st}
                </button>
              ))}
            </div>

            <button
              onClick={fetchFarmerOrders}
              className="text-xs font-semibold text-[#064e3b] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center text-[#64748b] bg-white rounded-2xl border border-[#e2e8e5]">
              <RotateCcw className="w-8 h-8 animate-spin mx-auto text-[#064e3b] mb-3" />
              <p className="text-sm font-semibold text-[#10231d]">Fetching incoming customer reservations...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-[#64748b] bg-white rounded-2xl border border-[#e2e8e5]">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#064e3b] mb-3 opacity-60" />
              <p className="text-sm font-semibold text-[#10231d]">No incoming orders matching filter</p>
              <p className="text-xs text-[#64748b] mt-1 max-w-sm mx-auto">
                Customer reservations for your harvest crops will appear here for you to accept, pack, and mark ready for stall pickup.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isPlaced = order.order_status === 'placed';
                const isAccepted = order.order_status === 'accepted';
                const isReady = order.order_status === 'ready';
                const isCompleted = order.order_status === 'completed';
                const isCancelled = order.order_status === 'cancelled';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#e2e8e5] p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#e2e8e5] gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-[#10231d]">
                            Order #{order.order_code}
                          </span>
                          <OrderStatusBadge status={order.order_status} />
                        </div>
                        <p className="text-xs text-[#64748b] mt-1">
                          Pickup on <strong>{order.pickup_date}</strong> • Slot: <strong>{order.pickup_timeslot}</strong>
                        </p>
                      </div>

                      {/* Pickup PIN & Cash Note */}
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-[#f8f7f2] rounded-xl border border-[#e2e8e5] text-right">
                          <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                            Pickup PIN
                          </span>
                          <span className="font-mono font-bold text-sm text-[#10231d] tracking-wider">
                            {order.pickup_pin || '----'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                            Due at Stall
                          </span>
                          <span className="font-mono font-bold text-base text-[#064e3b]">
                            {formatCurrency(order.final_total_due ?? order.initial_total_due)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 bg-[#f8f7f2] p-3 rounded-xl text-xs text-[#10231d] border border-[#e2e8e5]">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                        <span><strong>Customer:</strong> {order.customer_name || 'Market Patron'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span><strong>Phone:</strong> {order.customer_phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-stone-400 truncate" />
                        <span className="truncate"><strong>Email:</strong> {order.customer_email || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 mb-4">
                      {order.items?.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white border border-[#e2e8e5]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 border border-[#e2e8e5] shrink-0">
                              <img
                                src={it.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'}
                                alt={it.product_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-[#10231d]">{it.product_name}</p>
                              <p className="text-[11px] text-[#64748b] font-mono">
                                {it.reserved_qty} {it.unit} @ Rs. {it.unit_price} / {it.unit}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-[#10231d]">
                            Rs. {it.subtotal?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.cancelled_reason && (
                      <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                        <strong>Reason:</strong> {order.cancelled_reason}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-[#e2e8e5] flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] text-[#64748b]">
                        Pay on Pickup: <strong>{order.payment_method || 'Cash On Pickup'}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {isPlaced && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenDeclineModal(order)}
                              disabled={isActionInProgress}
                              className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAcceptOrder(order)}
                              disabled={isActionInProgress}
                              className="px-4 py-2 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              Accept Order
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenDeclineModal(order)}
                              disabled={isActionInProgress}
                              className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkReady(order)}
                              disabled={isActionInProgress}
                              className="px-4 py-2 rounded-xl bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Mark Ready for Pickup</span>
                            </button>
                          </>
                        )}

                        {isReady && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#064e3b] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Awaiting Customer Stall Arrival & PIN Verification</span>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#064e3b]" />
                            <span>Produce Collected & Cash Settled</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INSIGHTS                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {loadingInsights ? (
            <div className="p-12 text-center text-[#64748b] bg-white rounded-2xl border border-[#e2e8e5]">
              <RotateCcw className="w-8 h-8 animate-spin mx-auto text-[#064e3b] mb-3" />
              <p className="text-sm font-semibold text-[#10231d]">Calculating live stall performance metrics...</p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#e2e8e5] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748b] uppercase">Total Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#064e3b] flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-mono font-bold text-[#10231d]">
                    {insights?.totalOrders ?? 0}
                  </h3>
                  <p className="text-[11px] text-[#64748b] mt-1">Lifetime customer reservations</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#e2e8e5] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748b] uppercase">Pending Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-mono font-bold text-amber-700">
                    {insights?.pendingOrders ?? 0}
                  </h3>
                  <p className="text-[11px] text-[#64748b] mt-1">Awaiting packing or stall collection</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#e2e8e5] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748b] uppercase">Completed Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#064e3b] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-mono font-bold text-[#064e3b]">
                    {insights?.completedOrders ?? 0}
                  </h3>
                  <p className="text-[11px] text-[#64748b] mt-1">Verified handovers & cash settled</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#e2e8e5] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748b] uppercase">Total Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-[#064e3b] text-white flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-mono font-bold text-[#064e3b]">
                    Rs. {(insights?.totalRevenue ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-[#64748b] mt-1">From completed pre-orders</p>
                </div>
              </div>

              {/* Top 5 Best-Selling Products Table */}
              <div className="bg-white rounded-2xl border border-[#e2e8e5] shadow-xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#e2e8e5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#064e3b]" />
                    <h3 className="font-serif font-normal text-[#10231d] text-base">
                      Top 5 Best-Selling Crops (by Quantity Sold)
                    </h3>
                  </div>
                  <span className="text-xs text-[#64748b] font-mono">Ranked by volume</span>
                </div>

                {!insights?.topSellingProducts || insights.topSellingProducts.length === 0 ? (
                  <div className="p-8 text-center text-[#64748b]">
                    <Sprout className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p className="text-xs">No crop sales recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8f7f2] border-b border-[#e2e8e5] text-[#64748b] uppercase font-semibold tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Rank</th>
                          <th className="py-3 px-4">Crop Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Unit Price</th>
                          <th className="py-3 px-4 text-center">Volume Sold</th>
                          <th className="py-3 px-4 text-right">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8e5]">
                        {insights.topSellingProducts.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-[#f8f7f2]/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#64748b]">
                              #{idx + 1}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 border border-[#e2e8e5] shrink-0">
                                  <img
                                    src={p.image_url}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="font-medium text-[#10231d]">{p.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-[#64748b]">{p.category}</td>
                            <td className="py-3.5 px-4 font-mono">
                              Rs. {p.price.toLocaleString()} / {p.unit}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-center text-[#10231d]">
                              <span className="px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#064e3b] border border-emerald-200">
                                {p.totalQuantitySold} {p.unit}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-right text-[#064e3b]">
                              Rs. {p.totalRevenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PRODUCT REVIEWS & FARMER RESPONSES                                 */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#e2e8e5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#064e3b]" />
                <h3 className="font-serif font-normal text-[#10231d] text-base">
                  Customer Reviews & Grower Responses
                </h3>
              </div>
              <button
                onClick={fetchFarmerReviews}
                className="text-xs font-semibold text-[#064e3b] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loadingReviews ? 'animate-spin' : ''}`} />
                <span>Refresh Reviews</span>
              </button>
            </div>

            {loadingReviews ? (
              <div className="p-12 text-center text-[#64748b]">
                <RotateCcw className="w-8 h-8 animate-spin mx-auto text-[#064e3b] mb-3" />
                <p className="text-sm font-semibold text-[#10231d]">Fetching reviews for your harvest crops...</p>
              </div>
            ) : farmerReviews.length === 0 ? (
              <div className="p-12 text-center text-[#64748b]">
                <Star className="w-12 h-12 mx-auto text-amber-400 mb-3 opacity-60" />
                <p className="text-sm font-semibold text-[#10231d]">No customer reviews received yet</p>
                <p className="text-xs text-[#64748b] mt-1 max-w-sm mx-auto">
                  When customers complete their pickup orders, they can post star ratings and verified testimonials here. You can post official responses to each review!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e2e8e5]">
                {farmerReviews.map((rev) => {
                  const hasResponse = Boolean(rev.farmer_response && rev.farmer_response.trim());
                  const isEditingThis = editingReplyId === rev.id;
                  const currentReplyValue = replyTextMap[rev.id] !== undefined
                    ? replyTextMap[rev.id]
                    : (rev.farmer_response || '');

                  return (
                    <div key={rev.id} className="p-5 sm:p-6 space-y-4 hover:bg-[#f8f7f2]/40 transition-colors">
                      {/* Review Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.customer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                            alt={rev.customer_name}
                            className="w-9 h-9 rounded-full object-cover border border-[#e2e8e5]"
                          />
                          <div>
                            <h4 className="font-semibold text-xs text-[#10231d]">{rev.customer_name}</h4>
                            <p className="text-[10px] text-[#64748b]">
                              Reviewed on {new Date(rev.created_at).toLocaleDateString()}
                              {(rev as any).product_name && (
                                <span> • For <strong>{(rev as any).product_name}</strong></span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={`farmer-rev-${rev.id}-star-${star}`}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                          <span className="font-mono text-xs font-bold text-[#10231d] ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-[#10231d] bg-[#f8f7f2] p-3 rounded-xl border border-[#e2e8e5]">
                        &quot;{rev.comment}&quot;
                      </p>

                      {/* Existing Response Display */}
                      {hasResponse && !isEditingThis && (
                        <div className="ml-4 sm:ml-8 p-3.5 rounded-xl bg-[#ecfdf5] border border-emerald-200 text-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-[#064e3b] flex items-center gap-1.5 text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#064e3b]" />
                              Your Official Grower Reply:
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReplyId(rev.id);
                                setReplyTextMap((prev) => ({ ...prev, [rev.id]: rev.farmer_response || '' }));
                              }}
                              className="text-[10px] font-semibold text-[#064e3b] hover:underline cursor-pointer"
                            >
                              Edit Reply
                            </button>
                          </div>
                          <p className="text-[#064e3b] font-medium">{rev.farmer_response}</p>
                        </div>
                      )}

                      {/* Inline Reply Form */}
                      {(!hasResponse || isEditingThis) && (
                        <div className="ml-4 sm:ml-8 space-y-2 pt-2">
                          <label className="block text-[11px] font-semibold text-[#10231d] uppercase tracking-wider">
                            {isEditingThis ? 'Edit Grower Reply:' : 'Post Grower Response to Customer:'}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={currentReplyValue}
                              onChange={(e) =>
                                setReplyTextMap((prev) => ({ ...prev, [rev.id]: e.target.value }))
                              }
                              placeholder="Thank the customer or address their feedback..."
                              className="flex-1 px-3.5 py-2 border border-[#e2e8e5] rounded-xl bg-white text-xs text-[#10231d] focus:outline-hidden focus:ring-2 focus:ring-[#10b981] focus:border-[#064e3b]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSubmitReviewResponse(rev.id)}
                              disabled={submittingReplyId === rev.id || !currentReplyValue.trim()}
                              className="px-4 py-2 bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                            >
                              <Send className="w-3.5 h-3.5 text-emerald-300" />
                              <span>{submittingReplyId === rev.id ? 'Saving...' : 'Send Reply'}</span>
                            </button>
                            {isEditingThis && (
                              <button
                                type="button"
                                onClick={() => setEditingReplyId(null)}
                                className="px-3 py-2 border border-[#e2e8e5] text-[#64748b] hover:bg-stone-100 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DECLINE ORDER CONFIRMATION MODAL                                          */}
      {/* ========================================================================= */}
      {declineModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#10231d]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-[#e2e8e5] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#e2e8e5] flex items-center justify-between bg-red-950 text-white">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-sm text-white">Decline Order #{declineModalOrder.order_code}</h3>
              </div>
              <button
                onClick={() => setDeclineModalOrder(null)}
                className="text-stone-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs bg-[#f8f7f2]">
              <p className="text-[#10231d]">
                Are you sure you want to decline this reservation from{' '}
                <strong>{declineModalOrder.customer_name}</strong>?
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <strong>Inventory Notice:</strong> All reserved produce will be immediately returned to your active stall stock.
              </div>

              <div>
                <label className="block font-semibold text-[#10231d] mb-1">
                  Reason for declining (Optional):
                </label>
                <textarea
                  rows={2}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Field frost damage, crop sold out at morning rush..."
                  className="w-full px-3 py-2 border border-[#e2e8e5] rounded-xl bg-white text-xs text-[#10231d] focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e8e5]">
                <button
                  type="button"
                  onClick={() => setDeclineModalOrder(null)}
                  className="px-4 py-2 rounded-xl border border-[#e2e8e5] text-[#64748b] hover:bg-stone-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDecline}
                  disabled={isActionInProgress}
                  className="px-4 py-2 bg-[#b3261e] hover:bg-red-700 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isActionInProgress ? 'Declining...' : 'Confirm Decline & Return Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* "ADD TODAY'S STOCK" MODAL WITH IMAGE UPLOAD & ACCURATE CROP PRESETS       */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#10231d]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-[#e2e8e5] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#064e3b] flex items-center justify-between bg-[#064e3b] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-normal text-white">
                    Publish Today&apos;s Harvest Batch
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    Upload authentic field photography and define stall prices
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStock} className="p-6 space-y-4 text-xs bg-[#f8f7f2] max-h-[85vh] overflow-y-auto">
              {/* Quick Preset Selector */}
              <div className="p-3.5 rounded-xl bg-[#ecfdf5] border border-emerald-200">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#064e3b] mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Quick Pick from Verified Regional Crop Presets:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CROP_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-200 text-[#10231d] font-semibold text-[11px] transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 1: Produce Name */}
              <div>
                <label className="block font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                  1. Produce / Crop Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Roma Tomatoes"
                  className="w-full px-3.5 py-2.5 border border-[#e2e8e5] rounded-xl bg-white text-[#10231d] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#10b981] focus:border-[#064e3b]"
                />
              </div>

              {/* Field 2 & Farming Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                    2. Category *
                  </label>
                  <LuxurySelect<Product['category']>
                    value={category}
                    onChange={(val) => setCategory(val)}
                    size="md"
                    options={[
                      { value: 'Fresh Vegetables', label: 'Fresh Vegetables' },
                      { value: 'Orchard Fruits', label: 'Orchard Fruits' },
                      { value: 'Farm Fresh Dairy & Eggs', label: 'Farm Fresh Dairy & Eggs' },
                      { value: 'Raw Honey & Preserves', label: 'Raw Honey & Preserves' },
                      { value: 'Organic Herbs', label: 'Organic Herbs' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                    Farming Certification
                  </label>
                  <LuxurySelect<'Organic' | 'Conventional'>
                    value={farmingType}
                    onChange={(val) => setFarmingType(val)}
                    size="md"
                    options={[
                      { value: 'Organic', label: 'Certified Organic / Transitional' },
                      { value: 'Conventional', label: 'Eco-Safe Conventional' },
                    ]}
                  />
                </div>
              </div>

              {/* Price, Unit, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                    3. Stall Price (Rs.) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400">Rs.</span>
                    <input
                      type="number"
                      step="0.10"
                      min="0.1"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="250"
                      className="w-full pl-10 pr-3.5 py-2.5 border border-[#e2e8e5] rounded-xl bg-white text-[#10231d] font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-[#10b981] focus:border-[#064e3b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                    4. Unit of Sale *
                  </label>
                  <LuxurySelect<Product['unit']>
                    value={unit}
                    onChange={(val) => setUnit(val)}
                    size="md"
                    options={[
                      { value: 'kg', label: 'Kilogram (kg)' },
                      { value: 'bunch', label: 'Fresh Bunch' },
                      { value: 'punnet', label: 'Punnet / Basket' },
                      { value: 'dozen', label: 'Dozen (12 pcs)' },
                      { value: 'jar', label: 'Glass Jar' },
                      { value: 'piece', label: 'Per Piece' },
                      { value: '500g bag', label: '500g Pouch' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                    5. Initial Stock *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    placeholder="40"
                    className="w-full px-3.5 py-2.5 border border-[#e2e8e5] rounded-xl bg-white text-[#10231d] font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-[#10b981] focus:border-[#064e3b]"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#10231d] uppercase tracking-wider">
                    Crop Photograph *
                  </label>
                  <div className="flex items-center gap-1 text-[11px] bg-[#eef2ec] p-0.5 rounded-lg font-medium">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        imageMode === 'upload' ? 'bg-white text-[#064e3b] shadow-xs' : 'text-[#64748b]'
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        imageMode === 'url' ? 'bg-white text-[#064e3b] shadow-xs' : 'text-[#64748b]'
                      }`}
                    >
                      Web Image URL
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="crop-file-input"
                    />
                    <label
                      htmlFor="crop-file-input"
                      className="border-2 border-dashed border-[#10b981]/50 hover:border-[#064e3b] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-[#ecfdf5]/40 hover:bg-[#ecfdf5]/80 transition-all cursor-pointer text-center"
                    >
                      <Upload className="w-6 h-6 text-[#064e3b]" />
                      <span className="font-semibold text-xs text-[#10231d]">
                        Click or drag to attach field photo
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        Accepts JPG, PNG, WEBP (under 5MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="relative">
                      <Link className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => {
                          setImageUrlInput(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full pl-9 pr-3.5 py-2.5 border border-[#e2e8e5] rounded-xl bg-white text-[#10231d] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#10b981] focus:border-[#064e3b]"
                      />
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-[#e2e8e5] bg-stone-100 shadow-inner group">
                    <img
                      src={imagePreview}
                      alt="Crop Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageUrlInput('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1.5 rounded-xl bg-[#b3261e] text-white hover:bg-red-700 shadow-md cursor-pointer transition-all"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[#10231d] uppercase tracking-wider mb-1">
                  Brief Harvest Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Harvested at dawn, crisp and organic..."
                  className="w-full px-3.5 py-2.5 border border-[#e2e8e5] rounded-xl bg-white text-[#10231d] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#10b981] focus:border-[#064e3b]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#e2e8e5] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e8e5] text-[#64748b] hover:text-[#10231d] hover:bg-[#eae8df] font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-xl font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 border border-[#064e3b]"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish to Stall Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
