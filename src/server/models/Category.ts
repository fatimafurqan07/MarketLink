import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
