import React from 'react';
import { cn } from '../../utils/cn.ts';
import { formatCurrency } from '../../utils/formatters.ts';

export interface PriceDisplayProps {
  amount: number;
  unit?: string;
  originalAmount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emerald' | 'dark' | 'amber' | 'muted';
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  unit,
  originalAmount,
  size = 'md',
  variant = 'emerald',
  className,
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-lg sm:text-xl font-bold',
    xl: 'text-2xl sm:text-3xl font-bold',
  };

  const variantClasses = {
    emerald: 'text-[#064e3b]',
    dark: 'text-[#10231d]',
    amber: 'text-amber-800',
    muted: 'text-[#64748b]',
  };

  const formatted = formatCurrency(amount);

  return (
    <div className={cn('inline-flex items-baseline gap-1 font-mono tabular-nums', className)}>
      <span className={cn(sizeClasses[size], variantClasses[variant])}>
        {formatted}
      </span>

      {unit && (
        <span className="text-xs text-[#64748b] font-sans font-normal">
          / {unit}
        </span>
      )}

      {typeof originalAmount === 'number' && originalAmount > amount && (
        <span className="text-xs text-[#64748b]/70 line-through font-normal ml-1">
          {formatCurrency(originalAmount)}
        </span>
      )}
    </div>
  );
};
