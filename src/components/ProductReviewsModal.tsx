import React, { useState, useEffect } from 'react';
import {
  Star,
  X,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CornerDownRight,
  Send,
} from 'lucide-react';
import { Product, Review, User } from '../types.ts';
import { api } from '../services/api.ts';
import { StarRating, UserAvatar } from './common/index.ts';
import { formatDate } from '../utils/formatters.ts';

interface ProductReviewsModalProps {
  product: Product;
  currentUser: User | null;
  canReview: boolean;
  onClose: () => void;
  onReviewSubmitted?: (review: Review) => void;
}

export const ProductReviewsModal: React.FC<ProductReviewsModalProps> = ({
  product,
  currentUser,
  canReview,
  onClose,
  onReviewSubmitted,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New review form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Farmer response state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  const isFarmerOwner =
    currentUser &&
    (currentUser.role === 'admin' ||
      (currentUser.role === 'farmer' &&
        (currentUser.id.toString() === product.farmer_id.toString() ||
          currentUser.stall_number === product.stall_number)));

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getReviewsForProduct(product.id);
      setReviews(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitError('Please write a brief comment describing the produce freshness.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await api.createReview({
        productId: product.id,
        rating,
        comment: comment.trim(),
      });
      setSubmitSuccess('Thank you! Your verified review was posted.');
      setComment('');
      setReviews((prev) => [res.review, ...prev]);
      if (onReviewSubmitted) onReviewSubmitted(res.review);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to post review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [replyError, setReplyError] = useState<string | null>(null);

  const handleFarmerReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    setReplyError(null);
    try {
      const res = await api.respondToReview(reviewId, replyText.trim());
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, farmer_response: res.review.farmer_response } : r))
      );
      setReplyingReviewId(null);
      setReplyText('');
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const avgRatingNum =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 5.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#e2e8e5] overflow-hidden my-auto max-h-[85vh] flex flex-col transform-gpu">
        {/* Header */}
        <div className="bg-white text-[#10231d] p-4 sm:p-5 border-b border-[#e2e8e5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#e2e8e5] shrink-0 bg-[#eef2ec]"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] border border-emerald-200">
                  {product.category}
                </span>
                <span className="text-xs text-[#64748b]">
                  {product.farmer_name || 'Verified Farmer'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-normal text-[#10231d] mt-0.5">
                {product.name} Reviews
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close reviews"
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#10231d] hover:bg-[#eef2ec] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8f7f2]">
          {replyError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#b3261e] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#b3261e] shrink-0" />
              <span>{replyError}</span>
            </div>
          )}
          {/* Rating Summary Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e2e8e5] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="text-3xl sm:text-4xl font-serif font-normal text-[#10231d]">
                {avgRatingNum.toFixed(1)}
              </div>
              <div>
                <StarRating rating={avgRatingNum} size="md" />
                <span className="text-xs text-[#64748b] block mt-0.5">
                  Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#064e3b] bg-[#ecfdf5] border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
              <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
              <span>Verified Mandi Stall Pickups Only</span>
            </div>
          </div>

          {/* Review Submission Form (Only if canReview) */}
          {canReview ? (
            <div className="bg-white p-5 rounded-xl border border-[#e2e8e5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#10231d] uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#064e3b]" />
                  Rate &amp; Review Your Produce
                </span>
                <span className="text-[10px] font-semibold text-[#064e3b] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Buyer
                </span>
              </div>

              {submitSuccess && (
                <div className="p-3 bg-[#ecfdf5] border border-emerald-200 text-[#064e3b] rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#064e3b] shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {submitError && (
                <div className="p-3 bg-[#b3261e]/10 border border-[#b3261e]/30 text-[#b3261e] rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#b3261e] shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-[#64748b] block mb-1">
                    Your Rating:
                  </label>
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={rating}
                      size="lg"
                      interactive
                      onRatingChange={(newVal) => setRating(newVal)}
                    />
                    <span className="text-xs font-semibold text-[#10231d] ml-1">
                      {rating} out of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#64748b] block mb-1">
                    Your Inspection &amp; Taste Experience:
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share how the produce tasted, freshness, stall experience..."
                    className="w-full p-3 rounded-lg border border-[#e2e8e5] bg-[#f8f7f2] text-xs text-[#10231d] placeholder:text-[#64748b]/60 focus:outline-hidden focus:border-[#10b981] focus:bg-white transition-all"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="px-5 py-2.5 rounded-lg bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{isSubmitting ? 'Posting...' : 'Submit Verified Review'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-[#e2e8e5] rounded-xl p-4 text-xs text-[#64748b] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#64748b]/60 shrink-0" />
              <div>
                <strong className="block text-[#10231d]">Authentic Buyer Reviews</strong>
                <span className="text-[11px] text-[#64748b]">
                  {currentUser
                    ? 'Only customers who have an inspected and completed pickup pass for this produce can post a review.'
                    : 'Sign in to order fresh harvest and leave verified reviews.'}
                </span>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-[#10231d] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#064e3b]" />
              Customer Experiences ({reviews.length})
            </h4>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#64748b] space-y-2">
                <div className="w-6 h-6 border-2 border-[#064e3b] border-t-transparent rounded-full animate-spin mx-auto" />
                <span>Loading reviews...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-[#b3261e]/10 border border-[#b3261e]/30 text-[#b3261e] rounded-xl text-xs">
                {error}
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#e2e8e5] p-8 text-center space-y-2 shadow-2xs">
                <MessageSquare className="w-8 h-8 text-[#64748b]/40 mx-auto" />
                <p className="text-xs font-semibold text-[#10231d]">No reviews yet for this item.</p>
                <p className="text-[11px] text-[#64748b]">
                  Be among the first to order and review this farmer&apos;s harvest!
                </p>
              </div>
            ) : (
              reviews.map((rev, rIdx) => (
                <div
                  key={`user-review-${rev.id || rIdx}`}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-[#e2e8e5] shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={rev.customer_name || 'Customer'}
                        avatarUrl={rev.customer_avatar}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-[#10231d]">
                            {rev.customer_name || 'Verified Customer'}
                          </span>
                          <span className="text-[10px] text-[#064e3b] bg-[#ecfdf5] px-1.5 py-0.2 rounded font-medium border border-emerald-200">
                            Verified
                          </span>
                        </div>
                        <span className="text-[10px] text-[#64748b] block">
                          {formatDate(rev.created_at, 'short')}
                        </span>
                      </div>
                    </div>

                    <StarRating rating={rev.rating} size="sm" />
                  </div>

                  <p className="text-xs text-[#10231d] leading-relaxed pl-1">
                    {rev.comment}
                  </p>

                  {/* Farmer Response if exists */}
                  {rev.farmer_response && (
                    <div className="mt-2.5 p-3 rounded-lg bg-[#ecfdf5] border border-emerald-200 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#064e3b]">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#064e3b]" />
                        <span>Farmer Response ({product.farmer_name || 'Farm'}):</span>
                      </div>
                      <p className="text-xs text-[#10231d] pl-5 leading-snug">
                        {rev.farmer_response}
                      </p>
                    </div>
                  )}

                  {/* Farmer Reply Button / Form if user owns product */}
                  {isFarmerOwner && !rev.farmer_response && (
                    <div className="pt-2 border-t border-[#e2e8e5]">
                      {replyingReviewId === rev.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a response to this customer..."
                            className="w-full p-2.5 text-xs rounded-lg border border-[#e2e8e5] bg-[#f8f7f2] focus:border-[#10b981] focus:bg-white focus:outline-none text-[#10231d]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingReviewId(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1.5 text-xs text-[#64748b] hover:bg-[#eef2ec] rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isSubmittingReply || !replyText.trim()}
                              onClick={() => handleFarmerReply(rev.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#064e3b] hover:bg-[#043d2e] rounded-lg cursor-pointer disabled:opacity-50"
                            >
                              {isSubmittingReply ? 'Saving...' : 'Post Response'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(rev.id);
                            setReplyText('');
                          }}
                          className="text-[11px] font-semibold text-[#064e3b] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Respond as Farmer</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
