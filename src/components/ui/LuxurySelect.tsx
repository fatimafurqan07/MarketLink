import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface LuxurySelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
  subLabel?: string;
  badge?: string;
  icon?: React.FC<{ className?: string }>;
}

interface LuxurySelectProps<T extends string | number = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: LuxurySelectOption<T>[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.FC<{ className?: string }>;
}

export function LuxurySelect<T extends string | number = string | number>({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  label,
  disabled = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  variant = 'light',
  size = 'md',
  icon: TriggerIcon,
}: LuxurySelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const isDark = variant === 'dark';

  // Compute fixed floating coordinates for portal rendering
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const minWidth = Math.max(rect.width, 220);
    let left = rect.left;
    if (left + minWidth > viewportWidth - 12) {
      left = Math.max(12, viewportWidth - minWidth - 12);
    }
    if (left < 12) left = 12;

    const spaceBelow = viewportHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;

    // Prefer opening below unless there's not enough room and more room above
    const openAbove = spaceBelow < 200 && spaceAbove > spaceBelow;
    const preferredHeight = 280;
    const maxHeight = Math.min(preferredHeight, Math.max(160, openAbove ? spaceAbove : spaceBelow));

    const top = openAbove ? Math.max(8, rect.top - maxHeight - 6) : rect.bottom + 6;

    setCoords({
      top,
      left,
      width: minWidth,
      maxHeight,
    });
  }, []);

  // Update coordinates when opened, and attach global listeners
  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      updateCoords();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updateCoords);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen, updateCoords]);

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-3.5 text-xs sm:text-sm',
    lg: 'h-11 px-4 text-sm',
  }[size];

  return (
    <div
      className={`relative inline-block w-full ${isOpen ? 'z-50' : 'z-10'} ${className}`}
      ref={containerRef}
    >
      {label && (
        <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 font-sans">
          {label}
        </label>
      )}

      {/* Trigger Button with relative positioning and active states */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none text-left shadow-2xs relative z-10 ${sizeClasses} ${
          isDark
            ? 'bg-[#0A2118] border-[#123829] text-white hover:border-emerald-500/50 hover:bg-[#0D2B20]'
            : 'bg-white border-[#E5E7EB] text-[#0F172A] hover:border-emerald-400 hover:bg-stone-50/80'
        } ${
          isOpen
            ? isDark
              ? 'ring-2 ring-emerald-500/30 border-emerald-500'
              : 'ring-2 ring-emerald-500/15 border-[#15803D]'
            : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {TriggerIcon && (
            <TriggerIcon
              className={`w-4 h-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-[#15803D]'}`}
            />
          )}
          {selectedOption?.icon && (
            <selectedOption.icon
              className={`w-4 h-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-[#15803D]'}`}
            />
          )}
          <span className="truncate font-semibold tracking-tight">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                isDark
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-emerald-50 text-[#15803D] border border-emerald-200'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        {/* Animated Chevron Rotating 180deg */}
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'rotate-180 text-emerald-500' : isDark ? 'text-stone-400' : 'text-stone-500'
          }`}
        />
      </button>

      {/* Popover Menu rendered via React Portal directly into document.body to guarantee ZERO clipping */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              top: coords ? `${coords.top}px` : '-9999px',
              left: coords ? `${coords.left}px` : '-9999px',
              width: coords ? `${coords.width}px` : 'auto',
              maxHeight: coords ? `${coords.maxHeight}px` : '280px',
              zIndex: 99999,
            }}
            className={`rounded-2xl border p-1.5 backdrop-blur-2xl overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.22)] select-none transition-opacity duration-150 animate-in fade-in zoom-in-95 ${
              isDark
                ? 'bg-[#061A12]/98 border-[#123829] text-stone-100 shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
                : 'bg-white/98 border-stone-200 text-[#0F172A] shadow-[0_20px_50px_rgba(0,0,0,0.18)]'
            } ${menuClassName}`}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              const ItemIcon = option.icon;

              return (
                <div
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer flex items-center justify-between gap-2.5 my-0.5 select-none ${
                    isSelected
                      ? 'bg-[#061A12] text-emerald-400 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                      : isDark
                      ? 'text-stone-300 hover:bg-emerald-950/60 hover:text-white'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {ItemIcon && (
                      <ItemIcon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected
                            ? 'text-emerald-400'
                            : isDark
                            ? 'text-stone-400'
                            : 'text-stone-500'
                        }`}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{option.label}</span>
                        {option.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold tracking-tight ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}
                          >
                            {option.badge}
                          </span>
                        )}
                      </div>
                      {option.subLabel && (
                        <div
                          className={`text-[11px] truncate font-normal mt-0.5 ${
                            isSelected
                              ? 'text-emerald-300/80 font-mono'
                              : isDark
                              ? 'text-stone-400'
                              : 'text-stone-500'
                          }`}
                        >
                          {option.subLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
