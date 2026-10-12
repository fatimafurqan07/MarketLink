import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, AlertCircle } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  itemName?: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  description,
  confirmButtonText = 'Delete Permanently',
  cancelButtonText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#e2e8e5] overflow-hidden my-auto p-6 sm:p-7 space-y-5 transform-gpu">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-xl text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDanger
                ? 'bg-rose-50 text-[#b3261e] border-rose-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-6 h-6 text-[#b3261e]" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
          </div>

          <div className="space-y-1 pr-6">
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#10231d] leading-snug">
              {title}
            </h3>
            {itemName && (
              <div className="inline-block font-mono text-xs font-bold text-[#064e3b] bg-[#ecfdf5] border border-emerald-200 px-2.5 py-0.5 rounded-lg mt-0.5 max-w-full truncate">
                {itemName}
              </div>
            )}
          </div>
        </div>

        {/* Description / Notice */}
        <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
          {description ||
            'Are you sure you want to delete this item? This action cannot be undone and will immediately remove the record from MarketLink.'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e2e8e5]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4.5 py-2.5 rounded-xl border border-[#e2e8e5] text-xs font-semibold text-[#10231d] bg-white hover:bg-[#f8f7f2] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelButtonText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98 ${
              isDanger
                ? 'bg-[#b3261e] hover:bg-rose-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isLoading ? 'Processing...' : confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
