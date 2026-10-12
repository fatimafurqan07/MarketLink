import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'order_placed'
  | 'order_accepted'
  | 'order_ready'
  | 'order_cancelled';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  message: string;
  type: NotificationType;
  orderId?: mongoose.Types.ObjectId | string;
  orderCode?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['order_placed', 'order_accepted', 'order_ready', 'order_cancelled'],
    required: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  },
  orderCode: {
    type: String,
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
