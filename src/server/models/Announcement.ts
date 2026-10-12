import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  message: string;
  createdAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>({
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
export default Announcement;
