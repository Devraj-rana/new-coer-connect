import mongoose from 'mongoose';

export interface IFollow {
  _id?: mongoose.Types.ObjectId;
  followerId: string;  // User who is following
  followingId: string; // User being followed
  createdAt?: Date;
}

const followSchema = new mongoose.Schema<IFollow>({
  followerId: {
    type: String,
    required: true,
  },
  followingId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Create compound index to prevent duplicate follows and optimize queries
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followerId: 1 });
followSchema.index({ followingId: 1 });

const Follow = mongoose.models.Follow || mongoose.model<IFollow>('Follow', followSchema);

export default Follow;
