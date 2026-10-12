import { useState, useEffect } from 'react';
import { Product, Market, FarmerProfile } from '../types.ts';

export interface HarvestCutoffStatus {
  isLocked: boolean;
  timeRemaining: {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  formattedCountdown: string;
  badgeText: string;
  deadlineDate: Date | null;
  cutoffHours: number;
  openingTime: string;
}

/**
 * Calculates real-time harvest cutoff deadline and ticking countdown.
 * SRS Formula:
 * Deadline = Market Opening Timestamp - (Farmer Cutoff Hours * 3600 * 1000)
 */
export function useHarvestCutoff(
  product: Product,
  market?: Market | null,
  farmer?: FarmerProfile | null,
  targetPickupDate?: string
): HarvestCutoffStatus {
  const cutoffHours = product.cutoff_hours || farmer?.cutoff_hours || 12;
  const openingTime = (market?.opening_time || product.market_opening || '07:00:00').slice(0, 8);

  const calculateStatus = (): HarvestCutoffStatus => {
    const now = new Date();

    // Determine target market date (pickup date, harvest date, or tomorrow)
    let pickupDateStr = targetPickupDate || product.harvest_date;
    if (!pickupDateStr) {
      // Default to next day
      const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      pickupDateStr = nextDay.toISOString().split('T')[0];
    }

    // Construct target market opening timestamp
    const openingTimestamp = new Date(`${pickupDateStr}T${openingTime}`).getTime();

    // If openingTimestamp is in the past compared to now, look at the next occurrence (tomorrow's market opening)
    let effectiveOpeningTime = openingTimestamp;
    if (isNaN(effectiveOpeningTime) || effectiveOpeningTime < now.getTime()) {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
      effectiveOpeningTime = new Date(`${tomorrowDateStr}T${openingTime}`).getTime();
    }

    // Deadline calculation: Opening - (Cutoff Hours in ms)
    let deadlineMs = effectiveOpeningTime - cutoffHours * 60 * 60 * 1000;
    let diffMs = deadlineMs - now.getTime();
    let isNextCycle = false;

    // If the cutoff for the immediate dawn harvest has already elapsed,
    // automatically roll over to the Next Harvest Batch (next morning) so customers
    // are never locked out of ordering fresh farm produce that is in stock.
    if (diffMs <= 0 && !targetPickupDate) {
      // Advance by 24 hours to target the next harvest cycle
      effectiveOpeningTime += 24 * 60 * 60 * 1000;
      deadlineMs = effectiveOpeningTime - cutoffHours * 60 * 60 * 1000;
      diffMs = deadlineMs - now.getTime();
      isNextCycle = true;
    }

    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const isStockDepleted = product.in_stock <= 0 || (product as any).is_sold_out || (product as any).isSoldOut;
    // An item is only locked if stock is 0 or if an explicitly requested targetPickupDate is in the past
    const isLocked = isStockDepleted || (!!targetPickupDate && diffMs <= 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedCountdown = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

    let badgeText = '';
    if (isStockDepleted) {
      badgeText = 'Sold Out';
    } else if (isLocked) {
      badgeText = 'Pre-order Locked (Cutoff Passed)';
    } else if (isNextCycle) {
      badgeText = `Next Dawn Harvest • Locks in ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
    } else {
      badgeText = `Pre-orders Open • Locks in ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
    }

    return {
      isLocked,
      timeRemaining: {
        hours,
        minutes,
        seconds,
        totalSeconds,
      },
      formattedCountdown,
      badgeText,
      deadlineDate: new Date(deadlineMs),
      cutoffHours,
      openingTime,
    };
  };

  const [status, setStatus] = useState<HarvestCutoffStatus>(calculateStatus);

  useEffect(() => {
    // Initial evaluation
    setStatus(calculateStatus());

    // Live 1-second pulse for real-time countdown accuracy
    const timer = setInterval(() => {
      setStatus(calculateStatus());
    }, 1000);

    return () => clearInterval(timer);
  }, [
    product.id,
    product.in_stock,
    product.cutoff_hours,
    product.harvest_date,
    market?.opening_time,
    farmer?.cutoff_hours,
    targetPickupDate,
  ]);

  return status;
}
