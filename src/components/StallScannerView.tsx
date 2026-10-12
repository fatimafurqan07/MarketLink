import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Camera,
  CameraOff,
  Minus,
  Plus,
  Check,
  RotateCcw,
  ShoppingBag,
  Store,
  Phone,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Order } from '../types.ts';
import { api } from '../services/api.ts';

interface StallScannerViewProps {
  orders: Order[];
  onOrderCompleted: () => void;
}

interface ItemInspectionState {
  itemId: number;
  acceptedQty: number;
  rejectedQty: number;
  unitPrice: number;
  unit: string;
  name: string;
  inspected: boolean;
}

export const StallScannerView: React.FC<StallScannerViewProps> = ({ orders, onOrderCompleted }) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [inspectedItems, setInspectedItems] = useState<ItemInspectionState[]>([]);
  const [isCompletingOrder, setIsCompletingOrder] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAdjustments, setShowAdjustments] = useState<boolean>(false);

  // Scanner Mode: 'pin' (default, manual entry) | 'camera'
  const [scannerMode, setScannerMode] = useState<'pin' | 'camera'>('pin');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Synchronize items when an order is verified
  useEffect(() => {
    if (verifiedOrder && verifiedOrder.items) {
      const initialItems: ItemInspectionState[] = verifiedOrder.items.map((it) => ({
        itemId: it.id,
        acceptedQty: it.accepted_qty ?? it.reserved_qty ?? 1,
        rejectedQty: it.rejected_qty ?? 0,
        unitPrice: it.unit_price,
        unit: it.unit || 'kg',
        name: it.product_name,
        inspected: true,
      }));
      setInspectedItems(initialItems);
    } else {
      setInspectedItems([]);
    }
  }, [verifiedOrder]);

  // Physical keyboard numeric input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        if (pinInput.length < 4) {
          const nextPin = pinInput + e.key;
          setPinInput(nextPin);
          if (nextPin.length === 4) {
            verifyPin(nextPin);
          }
        }
      } else if (e.key === 'Backspace') {
        setPinInput((prev) => prev.slice(0, -1));
        setErrorMessage(null);
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinInput, orders]);

  // Camera management
  const startCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera support is not available in this browser. Please enter the 4-digit code.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera permission denied.';
      setCameraError(`${msg} Enter 4-digit code on the keypad instead.`);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch { /* ignore */ }
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleDigitPress = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage(null);
  };

  const handleClear = () => {
    setPinInput('');
    setVerifiedOrder(null);
    setInspectedItems([]);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowAdjustments(false);
  };

  const verifyPin = async (code: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const foundOrder = orders.find(
        (o) => o.pickup_pin === code || o.order_code?.toLowerCase() === code.toLowerCase()
      );

      if (foundOrder) {
        setVerifiedOrder(foundOrder);
        setSuccessMessage(`Order #${foundOrder.order_code} mil gaya!`);
      } else {
        const verified = await api.verifyPin(code);
        setVerifiedOrder(verified);
        setSuccessMessage(`Order #${verified.order_code} mil gaya!`);
      }
    } catch (err: unknown) {
      const localMatch = orders.find((o) => o.pickup_pin === code);
      if (localMatch) {
        setVerifiedOrder(localMatch);
        setSuccessMessage(`Order #${localMatch.order_code} mil gaya!`);
      } else {
        setVerifiedOrder(null);
        setErrorMessage(`Code [ ${code} ] galat hai ya koi order nahi mila. Please customer se code dobara confirm karein.`);
      }
    }
  };

  const handleItemQtyAdjust = (itemId: number, delta: number) => {
    setInspectedItems((prev) =>
      prev.map((item) => {
        if (item.itemId !== itemId) return item;
        const matchingOriginalItem = verifiedOrder?.items?.find((it) => it.id === itemId);
        const maxQty = matchingOriginalItem?.reserved_qty ?? 10;
        const newAccepted = Math.max(0, Math.min(maxQty, item.acceptedQty + delta));
        const newRejected = maxQty - newAccepted;
        return {
          ...item,
          acceptedQty: newAccepted,
          rejectedQty: newRejected,
        };
      })
    );
  };

  const liveTotalCashDue = inspectedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.acceptedQty,
    0
  );

  const handleCompleteOrder = async () => {
    if (!verifiedOrder) return;

    setIsCompletingOrder(true);
    setErrorMessage(null);

    try {
      const adjustments = inspectedItems.map((item) => ({
        itemId: item.itemId,
        acceptedQty: item.acceptedQty,
        rejectedQty: item.rejectedQty,
        rejectionNote: item.rejectedQty > 0 ? 'Quality adjusted at stall' : undefined,
      }));

      try {
        await api.submitStallInspection(verifiedOrder.id, adjustments, 'Pickup confirmed at stall counter.');
      } catch {
        await api.updateOrderStatus(verifiedOrder.id, 'completed');
      }

      setSuccessMessage(
        `Order Complete! Rs. ${Math.round(liveTotalCashDue).toLocaleString()} cash wasool hua.`
      );
      setVerifiedOrder((prev) =>
        prev
          ? {
              ...prev,
              order_status: 'completed',
              final_total_due: liveTotalCashDue,
            }
          : null
      );
      onOrderCompleted();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Order complete nahi ho saka.');
    } finally {
      setIsCompletingOrder(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Top Banner with Clear Instruction */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#e2e8e5] shadow-xs text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ecfdf5] text-[#064e3b] text-xs font-semibold border border-emerald-200 mb-2">
            <span>Stall Scanner &amp; Cash Counter</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#10231d]">
            Customer Pickup &amp; PIN Verification
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1 font-medium">
            👉 <strong>Customer ka 4-digit code enter karein ya QR scan karein:</strong>
          </p>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-2 bg-[#ecfdf5] border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold text-[#064e3b]">
          <span>Rs. 0 Online • Cash at Stall</span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 bg-[#eef2ec] p-1.5 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => {
            setScannerMode('pin');
            stopCamera();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            scannerMode === 'pin'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:text-[#064e3b]'
          }`}
        >
          <span>4-Digit PIN Code</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setScannerMode('camera');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            scannerMode === 'camera'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-[#64748b] hover:text-[#064e3b]'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Camera QR Scan</span>
        </button>
      </div>

      {/* Main Grid: Input Keypad / Camera (Left) + Order Details & 1-Tap Confirmation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Keypad or Camera (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e2e8e5] shadow-xs p-6 sm:p-7 flex flex-col items-center">
          {scannerMode === 'camera' ? (
            <div className="w-full flex flex-col items-center">
              <div className="text-center mb-4">
                <span className="text-xs font-semibold text-[#10231d] uppercase tracking-wider block">
                  Scan Customer QR Code
                </span>
                <span className="text-xs text-[#64748b]">
                  Customer ka phone screen camera ke saamne layen
                </span>
              </div>

              {cameraError && (
                <div className="w-full p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col items-center gap-2 text-center mb-4">
                  <CameraOff className="w-6 h-6 text-amber-600" />
                  <p className="font-bold">Camera Notice</p>
                  <p>{cameraError}</p>
                </div>
              )}

              {!isCameraActive ? (
                <div className="w-full aspect-square max-w-[280px] rounded-2xl border-2 border-dashed border-[#e2e8e5] bg-[#f8f7f2] flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#064e3b]">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-normal text-[#10231d]">Camera Chalu Karein</h4>
                    <p className="text-xs text-[#64748b] mt-1">
                      Neeche diye button ko dabayein
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-3 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-300" />
                    <span>Camera On Karein</span>
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden bg-black border-2 border-[#064e3b] flex items-center justify-center shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-8 border-2 border-[#10b981] rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-300" />
                        <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-300" />
                      </div>
                      <div className="text-center">
                        <span className="px-2 py-0.5 rounded-full bg-black/70 text-emerald-300 text-xs font-mono font-bold">
                          Scanning...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-300" />
                        <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-300" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#64748b] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Camera Band Karein</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Large Tactile Keypad */
            <div className="w-full flex flex-col items-center">
              <div className="text-center mb-4">
                <span className="text-xs font-semibold text-[#10231d] uppercase tracking-wider block">
                  Customer Code
                </span>
                <span className="text-xs text-[#64748b]">
                  4 Number Type Karein
                </span>
              </div>

              {/* 4 Large PIN Digit Slots */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 w-full">
                {[0, 1, 2, 3].map((idx) => {
                  const digit = pinInput[idx];
                  return (
                    <div
                      key={`pin-box-slot-${idx}`}
                      className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-3xl sm:text-4xl font-mono font-bold transition-all ${
                        digit
                          ? 'border-[#064e3b] bg-[#ecfdf5] text-[#064e3b] shadow-xs scale-105'
                          : 'border-[#e2e8e5] bg-[#f8f7f2] text-stone-300'
                      }`}
                    >
                      {digit || '—'}
                    </div>
                  );
                })}
              </div>

              {/* Big, Easy-to-Press Keypad Buttons */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[320px]">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={`pin-keypad-btn-${digit}`}
                    type="button"
                    onClick={() => handleDigitPress(digit)}
                    disabled={pinInput.length >= 4}
                    className="py-4 sm:py-5 rounded-2xl bg-[#f8f7f2] hover:bg-[#ecfdf5] active:bg-[#eef2ec] text-[#10231d] font-mono text-2xl sm:text-3xl font-bold border border-[#e2e8e5] transition-all cursor-pointer disabled:opacity-30 shadow-xs active:scale-95"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleClear}
                  className="py-4 sm:py-5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-[#b3261e] font-sans text-xs sm:text-sm font-semibold border border-rose-200 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => handleDigitPress('0')}
                  disabled={pinInput.length >= 4}
                  className="py-4 sm:py-5 rounded-2xl bg-[#f8f7f2] hover:bg-[#ecfdf5] active:bg-[#eef2ec] text-[#10231d] font-mono text-2xl sm:text-3xl font-bold border border-[#e2e8e5] transition-all cursor-pointer disabled:opacity-30 shadow-xs active:scale-95"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleBackspace}
                  className="py-4 sm:py-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-[#64748b] text-xl font-bold border border-[#e2e8e5] transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                  title="Backspace"
                >
                  ⌫
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Details & 1-Tap Pickup Button (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e2e8e5] shadow-xs p-6 sm:p-7 flex flex-col justify-between min-h-[460px]">
          <div>
            {/* Big Prominent Error Feedback */}
            {errorMessage && (
              <div className="p-4 mb-5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3 shadow-xs">
                <XCircle className="w-6 h-6 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-rose-900">Code Galat Hai!</h4>
                  <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Big Prominent Success Feedback */}
            {successMessage && (
              <div className="p-4 mb-5 rounded-xl bg-[#ecfdf5] border-2 border-emerald-300 text-emerald-900 flex items-start gap-3 shadow-xs">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-[#064e3b] mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-[#064e3b]">Zabardast! Order Mil Gaya</h4>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">{successMessage}</p>
                </div>
              </div>
            )}

            {verifiedOrder ? (
              <div className="space-y-5">
                {/* Order Summary Header */}
                <div className="p-4 bg-[#ecfdf5] border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#64748b] uppercase">Order ID:</span>
                      <span className="text-lg font-mono font-bold text-[#10231d]">{verifiedOrder.order_code}</span>
                    </div>
                    <p className="text-xs text-[#64748b] font-medium mt-1 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                      <span>Customer: <strong className="text-[#10231d]">{verifiedOrder.customer_name || 'Customer'}</strong></span>
                      {verifiedOrder.customer_phone && (
                        <>
                          <span className="text-stone-300">·</span>
                          <span className="font-mono">{verifiedOrder.customer_phone}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider self-start sm:self-center border ${
                      verifiedOrder.order_status === 'completed'
                        ? 'bg-emerald-100 text-[#064e3b] border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {verifiedOrder.order_status === 'completed' ? 'Completed' : 'Ready for Pickup'}
                  </span>
                </div>

                {/* Items List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#10231d] uppercase tracking-wider">
                      Order Items:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdjustments(!showAdjustments)}
                      className="text-xs font-semibold text-[#064e3b] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showAdjustments ? 'Hide Adjustments' : 'Adjust Produce Quantity'}</span>
                      {showAdjustments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {inspectedItems.map((item) => {
                      const itemTotal = item.unitPrice * item.acceptedQty;
                      return (
                        <div
                          key={`scanner-item-${item.itemId}`}
                          className="p-3.5 rounded-xl border border-[#e2e8e5] bg-white space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-[#064e3b] shrink-0" />
                              <span className="font-medium text-sm text-[#10231d]">{item.name}</span>
                            </div>
                            <span className="font-mono font-bold text-base text-[#064e3b]">
                              Rs. {Math.round(itemTotal).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#64748b]">
                            <span>
                              Rs. {Math.round(item.unitPrice).toLocaleString()} / {item.unit}
                            </span>
                            <span className="font-medium text-[#10231d]">
                              Quantity: {item.acceptedQty} {item.unit}
                            </span>
                          </div>

                          {showAdjustments && (
                            <div className="pt-2 border-t border-[#e2e8e5] flex items-center justify-between">
                              <span className="text-xs text-amber-800 font-semibold">Change Accepted Qty:</span>
                              <div className="flex items-center border border-[#e2e8e5] rounded-lg bg-[#f8f7f2] overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleItemQtyAdjust(item.itemId, -1)}
                                  disabled={item.acceptedQty <= 0}
                                  className="px-2.5 py-1 text-stone-700 hover:bg-[#eae8df] cursor-pointer disabled:opacity-40"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-3 font-mono font-bold text-xs">{item.acceptedQty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleItemQtyAdjust(item.itemId, 1)}
                                  className="px-2.5 py-1 text-stone-700 hover:bg-[#eae8df] cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Big Total Cash Display */}
                <div className="p-4 rounded-xl bg-[#064e3b] text-white flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs text-emerald-200 font-semibold block uppercase tracking-wider">
                      Customer Se Total Cash Wasool Karein:
                    </span>
                    <span className="text-xs text-emerald-100/80">
                      Payment on Pickup (Rs. 0 Advance)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
                      Rs. {Math.round(liveTotalCashDue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-[#64748b] space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#f8f7f2] flex items-center justify-center mx-auto text-[#64748b]">
                  <QrCode className="w-8 h-8" />
                </div>
                <h4 className="text-base font-serif font-normal text-[#10231d]">
                  Code Ka Intezar Hai...
                </h4>
                <p className="text-xs text-[#64748b] max-w-xs mx-auto leading-relaxed">
                  Jab customer stall par aaye, unka 4-digit code (maslan <strong>4921</strong>) keypad par enter karein ya unka QR code scan karein.
                </p>
              </div>
            )}
          </div>

          {/* Big High-Visibility 1-Tap Confirmation Button */}
          {verifiedOrder && (
            <div className="pt-4 border-t border-[#e2e8e5] mt-4">
              {verifiedOrder.order_status === 'completed' ? (
                <div className="p-4 bg-[#ecfdf5] border-2 border-emerald-300 rounded-xl text-center text-sm font-semibold text-[#064e3b] flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#064e3b]" />
                  <span>Pickup Mukammal Ho Gaya Aur Cash Wasool Hua!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={isCompletingOrder}
                  className="w-full py-4 bg-[#064e3b] hover:bg-[#043d2e] text-white rounded-xl font-semibold text-base shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-98"
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                  <span>
                    {isCompletingOrder
                      ? 'Confirming...'
                      : `Confirm Pickup & Cash Wasool (Rs. ${Math.round(liveTotalCashDue).toLocaleString()})`}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
