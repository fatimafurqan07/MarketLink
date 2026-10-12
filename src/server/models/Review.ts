import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  productId: Types.ObjectId;
  farmerId: Types.ObjectId;
  customerId: Types.ObjectId;
  rating: number;
  comment: string;
  farmerResponse?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  farmerResponse: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
