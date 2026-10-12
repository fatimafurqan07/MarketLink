import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  farmerId: Types.ObjectId;
  marketId: Types.ObjectId;
  name: string;
  category: string;
  price: number;
  unit: string;
  stockQuantity: number;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  farming_type?: string;
  harvest_date?: string;
  isSoldOut: boolean;
  isTemplateActive?: boolean;
  defaultStockQuantity?: number;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  marketId: {
    type: Schema.Types.ObjectId,
    ref: 'Market',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  image_url: {
    type: String,
    trim: true,
  },
  farming_type: {
    type: String,
    default: 'Organic',
  },
  harvest_date: {
    type: String,
    trim: true,
  },
  isSoldOut: {
    type: Boolean,
    default: false,
  },
  isTemplateActive: {
    type: Boolean,
    default: false,
  },
  defaultStockQuantity: {
    type: Number,
    default: 20,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
