import mongoose, { Schema, Document } from 'mongoose';

export interface IMarket extends Document {
  name: string;
  slug?: string;
  address: string;
  country?: string;
  province?: string;
  city?: string;
  latitude: number;
  longitude: number;
  plus_code?: string;
  gps_coords?: string;
  stall_bays?: string;
  operatingDays: string[];
  timings: string;
  opening_time?: string;
  closing_time?: string;
  description?: string;
  parking_info?: string;
  image_url?: string;
  is_active?: boolean;
  stall_count?: number;
  createdAt: Date;
}

const marketSchema = new Schema<IMarket>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    default: 'Pakistan',
  },
  province: {
    type: String,
    trim: true,
    default: 'Sindh',
  },
  city: {
    type: String,
    trim: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  plus_code: {
    type: String,
    trim: true,
  },
  gps_coords: {
    type: String,
    trim: true,
  },
  stall_bays: {
    type: String,
    trim: true,
  },
  operatingDays: {
    type: [String],
    default: [],
  },
  timings: {
    type: String,
    required: true,
    trim: true,
  },
  opening_time: {
    type: String,
    trim: true,
  },
  closing_time: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  parking_info: {
    type: String,
    trim: true,
  },
  image_url: {
    type: String,
    trim: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  stall_count: {
    type: Number,
    default: 24,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Market = mongoose.model<IMarket>('Market', marketSchema);
export default Market;
