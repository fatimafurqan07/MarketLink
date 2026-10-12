import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn.ts';

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  totalReviews?: number;
  reviewCount?: number;
  showScore?: boolean;
  showNumeric?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  totalReviews,
  reviewCount,
  showScore = true,
  showNumeric = false,
  size = 'sm',
  className,
  interactive = false,
  onRatingChange,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const roundedRating = Math.max(0, Math.min(maxStars, activeRating || 0));

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  const textClasses = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold',
  }[size];

  const displayCount = totalReviews !== undefined ? totalReviews : reviewCount;
  const shouldShowNumeric = (showScore && !interactive) || showNumeric;

  return (
    <div
      className={cn('inline-flex items-center gap-1 text-amber-500', className)}
      onMouseLeave={() => interactive && setHoverRating(null)}
    >
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starVal = idx + 1;
          const isFilled = idx < Math.floor(roundedRating);
          const isHalf = !isFilled && idx < roundedRating;

          return (
            <button
              key={`star-${idx}`}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starVal)}
              onMouseEnter={() => interactive && setHoverRating(starVal)}
              className={cn(
                'focus:outline-hidden p-0.5 transition-transform',
                interactive ? 'cursor-pointer hover:scale-115' : 'cursor-default pointer-events-none'
              )}
              aria-label={interactive ? `Rate ${starVal} stars` : undefined}
            >
              <Star
                className={cn(
                  sizeClasses,
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'text-stone-300 fill-stone-100'
                )}
              />
            </button>
          );
        })}
      </div>

      {shouldShowNumeric && (
        <span className={cn('font-mono font-bold text-stone-800 ml-1', textClasses)}>
          {roundedRating.toFixed(1)}
        </span>
      )}

      {displayCount !== undefined && !interactive && (
        <span className="text-[11px] text-stone-400 font-sans ml-0.5">
          ({displayCount})
        </span>
      )}
    </div>
  );
};
