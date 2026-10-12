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

export interface LuxurySelectProps<T extends string | number = string | number> {
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
        <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5 font-sans">
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
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none text-left shadow-xs relative z-10 ${sizeClasses} bg-white border-[#e2e8e5] text-[#10231d] hover:border-[#064e3b]/50 hover:bg-[#f8f7f2] ${
          isOpen ? 'ring-2 ring-[#10b981]/25 border-[#064e3b]' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {TriggerIcon && (
            <TriggerIcon className="w-4 h-4 shrink-0 text-[#064e3b]" />
          )}
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 shrink-0 text-[#064e3b]" />
          )}
          <span className="truncate font-medium text-[#10231d]">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 bg-[#ecfdf5] text-[#064e3b] border border-[#e2e8e5]">
              {selectedOption.badge}
            </span>
          )}
        </div>

        {/* Animated Chevron */}
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'rotate-180 text-[#064e3b]' : 'text-[#64748b]'
          }`}
        />
      </button>

      {/* Popover Menu rendered via React Portal directly into document.body */}
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
            className={`rounded-xl border p-1.5 bg-white border-[#e2e8e5] text-[#10231d] shadow-lg select-none transition-opacity duration-150 animate-in fade-in zoom-in-95 overflow-y-auto ${menuClassName}`}
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
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer flex items-center justify-between gap-2.5 my-0.5 select-none ${
                    isSelected
                      ? 'bg-[#eef2ec] text-[#064e3b] font-semibold'
                      : 'text-[#10231d] hover:bg-[#f8f7f2]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {ItemIcon && (
                      <ItemIcon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-[#064e3b]' : 'text-[#64748b]'
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
                                ? 'bg-[#ecfdf5] text-[#064e3b] border border-emerald-200'
                                : 'bg-[#eef2ec] text-[#64748b] border border-[#e2e8e5]'
                            }`}
                          >
                            {option.badge}
                          </span>
                        )}
                      </div>
                      {option.subLabel && (
                        <div
                          className={`text-[11px] truncate font-normal mt-0.5 ${
                            isSelected ? 'text-[#064e3b]/80' : 'text-[#64748b]'
                          }`}
                        >
                          {option.subLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#064e3b] shrink-0 ml-2" />
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
