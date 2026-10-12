import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  address?: string;
  country?: string;
  province?: string;
  city?: string;
  cnic?: string;
  role: 'customer' | 'farmer' | 'admin';
  role_title?: string;
  organization?: string;
  avatar_url?: string;
  farm_name?: string;
  stall_number?: string;
  cutoff_hours?: number;
  bio?: string;
  market_id?: string;
  modules?: string[];
  isApproved?: boolean;
  isSuspended?: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
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
  },
  city: {
    type: String,
    trim: true,
  },
  cnic: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['customer', 'farmer', 'admin'],
    default: 'customer',
  },
  role_title: {
    type: String,
    trim: true,
  },
  organization: {
    type: String,
    trim: true,
  },
  avatar_url: {
    type: String,
    trim: true,
  },
  farm_name: {
    type: String,
    trim: true,
  },
  stall_number: {
    type: String,
    trim: true,
  },
  cutoff_hours: {
    type: Number,
    default: 12,
  },
  bio: {
    type: String,
    trim: true,
  },
  market_id: {
    type: String,
    trim: true,
  },
  modules: {
    type: [String],
    default: ['markets_discovery', 'produce_catalog', 'my_preorders', 'agro_copilot'],
  },
  isApproved: {
    type: Boolean,
    default: function (this: any) {
      return this.role !== 'farmer';
    },
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
