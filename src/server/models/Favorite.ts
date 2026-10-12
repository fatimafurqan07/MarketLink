import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  customerId: Types.ObjectId;
  farmerId?: Types.ObjectId;
  productId?: Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
export default Favorite;
