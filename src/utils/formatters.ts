/**
 * Pure helper utility functions for MarketLink application
 */

/**
 * Format currency in Pakistani Rupees (PKR)
 * Example: formatCurrency(1250) => "Rs. 1,250"
 */
export function formatCurrency(
  amount: number | undefined | null,
  options: { prefix?: string; showZeroFree?: boolean; countryCode?: string } = {}
): string {
  const { prefix = 'Rs.', showZeroFree = false, countryCode = 'PK' } = options;
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  if (num === 0 && showZeroFree) {
    return 'Free';
  }

  const resolvedPrefix = countryCode === 'IN' ? '₹' : countryCode === 'US' ? '$' : prefix;
  
  const formattedNum = num.toLocaleString('en-US', {
    minimumFractionDigits: countryCode === 'US' ? 2 : 0,
    maximumFractionDigits: countryCode === 'US' ? 2 : 0,
  });
  
  return `${resolvedPrefix} ${formattedNum}`;
}

/**
 * Format date into a clean, human-readable string
 * Example: formatDate('2026-09-26') => "Sep 26, 2026"
 */
export function formatDate(
  dateInput: string | Date | number | undefined | null,
  style: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!dateInput) return '—';
  
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    
    if (style === 'short') {
      return d.toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
      });
    }
    
    if (style === 'long') {
      return d.toLocaleDateString('en-PK', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    
    return d.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format date and time
 * Example: formatDateTime('2026-09-26T07:30:00Z') => "Sep 26, 2026, 12:30 PM"
 */
export function formatDateTime(
  dateInput: string | Date | number | undefined | null
): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleString('en-PK', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Extract 1 or 2 letter initials from a person or stall name
 * Example: getInitials("Tariq Mehmood") => "TM"
 */
export function getInitials(name: string | undefined | null, maxChars = 2): string {
  if (!name || typeof name !== 'string') return 'ML';
  const clean = name.trim();
  if (!clean) return 'ML';
  
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, maxChars).toUpperCase();
  }
  
  return parts
    .slice(0, maxChars)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

/**
 * Format CNIC to standard format (XXXXX-XXXXXXX-X)
 */
export function formatCnic(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

/**
 * Format Pakistani mobile phone number to standard format (03XX-XXXXXXX)
 */
export function formatPhoneNumber(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (digits.startsWith('92')) {
    const local = '0' + digits.slice(2);
    if (local.length <= 4) return local;
    return `${local.slice(0, 4)}-${local.slice(4, 11)}`;
  }
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
}

/**
 * Truncate text safely with ellipsis
 */
export function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
