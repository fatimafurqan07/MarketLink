import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  AlertCircle,
  ShieldCheck,
  User as UserIcon,
  Sprout,
  Shield,
} from 'lucide-react';
import { Order, User, Product } from '../../types.ts';
import { cn } from '../../utils/cn.ts';

// ---------------------------------------------------------------------------
// 1. Order Status Types & Config
// ---------------------------------------------------------------------------
export type OrderStatus = Order['order_status'];
export type OrderStatusType = 'placed' | 'accepted' | 'ready' | 'completed' | 'cancelled';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  type?: string;
}

const ORDER_STATUS_MAP: Record<string, { label: string; classes: string; dotClass: string }> = {
  placed: {
    label: 'Order Placed',
    classes: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dotClass: 'bg-amber-500',
  },
  accepted: {
    label: 'Accepted by Farmer',
    classes: 'bg-teal-50 text-teal-800 border-teal-200/80',
    dotClass: 'bg-teal-600',
  },
  ready: {
    label: 'Ready for Pickup',
    classes: 'bg-[#ecfdf5] text-[#064e3b] border-emerald-200/80 font-bold',
    dotClass: 'bg-[#064e3b]',
  },
  completed: {
    label: 'Completed & Paid',
    classes: 'bg-[#eef2ec] text-[#064e3b] border-[#e2e8e5]',
    dotClass: 'bg-[#064e3b]',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-rose-50 text-[#b3261e] border-rose-200/80',
    dotClass: 'bg-[#b3261e]',
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className,
  size = 'sm',
}) => {
  const normalized = (status || '').toLowerCase().trim();
  const config = ORDER_STATUS_MAP[normalized] || {
    label: String(status),
    classes: 'bg-[#f8f7f2] text-[#64748b] border-[#e2e8e5]',
    dotClass: 'bg-stone-400',
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-wider rounded-full border',
        sizeClasses,
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
};

// ---------------------------------------------------------------------------
// 2. Product Stock Status Badge
// ---------------------------------------------------------------------------
export type ProductStockStatusType = 'in_stock' | 'low_stock' | 'sold_out' | 'archived';

export interface ProductStockBadgeProps {
  inStock: number;
  isSoldOut?: boolean;
  className?: string;
  unit?: string;
}

export const ProductStockBadge: React.FC<ProductStockBadgeProps> = ({
  inStock,
  isSoldOut,
  className,
  unit = 'kg',
}) => {
  const isOutOfStock = isSoldOut || inStock <= 0;
  const isLowStock = !isOutOfStock && inStock <= 5;

  if (isOutOfStock) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#b3261e] border border-rose-200/80',
          className
        )}
      >
        Sold Out
      </span>
    );
  }

  if (isLowStock) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80',
          className
        )}
      >
        Low Stock ({inStock} {unit})
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ecfdf5] text-[#064e3b] border border-emerald-200/80',
        className
      )}
    >
      {inStock} {unit} Available
    </span>
  );
};

// ---------------------------------------------------------------------------
// 3. User Role Badge
// ---------------------------------------------------------------------------
export type UserRole = User['role'];
export type UserRoleType = 'customer' | 'farmer' | 'admin';

const USER_ROLE_MAP: Record<string, { label: string; classes: string }> = {
  admin: {
    label: 'Mandi Admin',
    classes: 'bg-[#064e3b] text-white border-[#064e3b]',
  },
  farmer: {
    label: 'Verified Farmer',
    classes: 'bg-[#ecfdf5] text-[#064e3b] border-emerald-200',
  },
  customer: {
    label: 'Customer / Buyer',
    classes: 'bg-[#eef2ec] text-[#10231d] border-[#e2e8e5]',
  },
};

export interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role, className }) => {
  const config = USER_ROLE_MAP[role] || {
    label: String(role),
    classes: 'bg-[#f8f7f2] text-[#64748b] border-[#e2e8e5]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
};

// ---------------------------------------------------------------------------
// 4. Account Status Badge
// ---------------------------------------------------------------------------
export type UserStatusType = 'active' | 'pending_approval' | 'suspended';

export interface AccountStatusBadgeProps {
  isApproved?: boolean;
  isSuspended?: boolean;
  className?: string;
}

export const AccountStatusBadge: React.FC<AccountStatusBadgeProps> = ({
  isApproved = true,
  isSuspended = false,
  className,
}) => {
  if (isSuspended) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#b3261e] border border-rose-200/80',
          className
        )}
      >
        Suspended
      </span>
    );
  }

  if (!isApproved) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/80',
          className
        )}
      >
        Pending Review
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ecfdf5] text-[#064e3b] border border-emerald-200/80',
        className
      )}
    >
      Active & Verified
    </span>
  );
};

// ---------------------------------------------------------------------------
// 5. Generic Multi-Purpose StatusBadge
// ---------------------------------------------------------------------------
export interface StatusBadgeProps {
  type?: 'order' | 'user' | 'product' | 'role';
  status: string;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  showIcon?: boolean;
  customLabel?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type = 'order',
  status,
  size = 'sm',
  showDot = true,
  showIcon = false,
  customLabel,
  className,
}) => {
  const normalized = (status || '').toLowerCase().trim();

  let config = {
    label: customLabel || status,
    badgeClass: 'bg-[#f8f7f2] text-[#64748b] border-[#e2e8e5]',
    dotClass: 'bg-stone-400',
    icon: undefined as React.FC<{ className?: string }> | undefined,
  };

  if (type === 'order') {
    const orderConfig = ORDER_STATUS_MAP[normalized];
    if (orderConfig) {
      config = {
        label: customLabel || orderConfig.label,
        badgeClass: orderConfig.classes,
        dotClass: orderConfig.dotClass || 'bg-stone-400',
        icon: normalized === 'ready' || normalized === 'completed' ? CheckCircle2 : normalized === 'placed' ? Clock : normalized === 'accepted' ? Package : XCircle,
      };
    }
  } else if (type === 'user') {
    if (normalized === 'active') {
      config = {
        label: customLabel || 'Active & Verified',
        badgeClass: 'bg-[#ecfdf5] text-[#064e3b] border-emerald-200/80',
        dotClass: 'bg-[#064e3b]',
        icon: ShieldCheck,
      };
    } else if (normalized === 'pending_approval' || normalized === 'pending') {
      config = {
        label: customLabel || 'Pending Approval',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
        dotClass: 'bg-amber-500',
        icon: AlertCircle,
      };
    } else if (normalized === 'suspended') {
      config = {
        label: customLabel || 'Suspended',
        badgeClass: 'bg-rose-50 text-[#b3261e] border-rose-200/80',
        dotClass: 'bg-[#b3261e]',
        icon: XCircle,
      };
    }
  } else if (type === 'product') {
    if (normalized === 'in_stock') {
      config = {
        label: customLabel || 'In Stock',
        badgeClass: 'bg-[#ecfdf5] text-[#064e3b] border-emerald-200/80',
        dotClass: 'bg-[#064e3b]',
        icon: undefined,
      };
    } else if (normalized === 'low_stock') {
      config = {
        label: customLabel || 'Low Stock',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
        dotClass: 'bg-amber-500',
        icon: undefined,
      };
    } else if (normalized === 'sold_out') {
      config = {
        label: customLabel || 'Sold Out',
        badgeClass: 'bg-rose-50 text-[#b3261e] border-rose-200/80',
        dotClass: 'bg-[#b3261e]',
        icon: undefined,
      };
    }
  } else if (type === 'role') {
    const roleConfig = USER_ROLE_MAP[normalized];
    if (roleConfig) {
      config = {
        label: customLabel || roleConfig.label,
        badgeClass: roleConfig.classes,
        dotClass: normalized === 'admin' ? 'bg-white' : normalized === 'farmer' ? 'bg-[#064e3b]' : 'bg-[#10231d]',
        icon: normalized === 'admin' ? Shield : normalized === 'farmer' ? Sprout : UserIcon,
      };
    }
  }

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-xs sm:text-sm gap-2',
  };

  const dotSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  };

  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold tracking-wide transition-colors whitespace-nowrap',
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {showDot && !showIcon && (
        <span
          className={cn('rounded-full shrink-0', config.dotClass, dotSizeClasses[size])}
          aria-hidden="true"
        />
      )}
      {showIcon && IconComponent && (
        <IconComponent className={cn('shrink-0', iconSizeClasses[size])} />
      )}
      <span>{customLabel || config.label}</span>
    </span>
  );
};
