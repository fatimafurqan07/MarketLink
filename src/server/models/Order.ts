import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  productName?: string;
  quantity: number;
  acceptedQty?: number;
  rejectedQty?: number;
  rejectionNote?: string;
  price: number;
  unit?: string;
  subtotal?: number;
}

export interface IOrder extends Document {
  customerId: Types.ObjectId;
  farmerId?: Types.ObjectId;
  marketId?: Types.ObjectId;
  orderCode?: string;
  pickupPin?: string;
  pickupToken?: string;
  paymentMethod?: string;
  items: IOrderItem[];
  totalAmount: number;
  finalTotalDue?: number;
  pickupDate: string;
  pickupTimeSlot: string;
  inspectionNotes?: string;
  cancelledReason?: string;
  status: 'placed' | 'accepted' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    acceptedQty: {
      type: Number,
      default: 1,
    },
    rejectedQty: {
      type: Number,
      default: 0,
    },
    rejectionNote: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      trim: true,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  marketId: {
    type: Schema.Types.ObjectId,
    ref: 'Market',
  },
  orderCode: {
    type: String,
    trim: true,
  },
  pickupPin: {
    type: String,
    trim: true,
  },
  pickupToken: {
    type: String,
    trim: true,
  },
  paymentMethod: {
    type: String,
    default: 'Cash On Pickup',
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [(val: IOrderItem[]) => val.length > 0, 'Order must contain at least one item'],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  finalTotalDue: {
    type: Number,
    min: 0,
  },
  pickupDate: {
    type: String,
    required: true,
  },
  pickupTimeSlot: {
    type: String,
    required: true,
  },
  inspectionNotes: {
    type: String,
    trim: true,
  },
  cancelledReason: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'ready', 'completed', 'cancelled'],
    default: 'placed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
