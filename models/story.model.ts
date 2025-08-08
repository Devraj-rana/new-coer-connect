import mongoose, { Document, Model } from "mongoose";

export type StoryMediaType = 'image' | 'video';

export interface IStory {
  userId: string;
  mediaUrl: string; // can be base64 or remote URL
  type: StoryMediaType;
  textOverlay?: string;
  createdAt?: Date;
  expiresAt: Date;
  viewers: { userId: string; viewedAt: Date }[];
  isPrivateAtCreation?: boolean; // snapshot of privacy at post time
}

export interface IStoryDocument extends IStory, Document {}

const storySchema = new mongoose.Schema<IStoryDocument>({
  userId: { type: String, required: true, index: true },
  mediaUrl: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  textOverlay: { type: String, default: '' },
  expiresAt: { type: Date, required: true, index: true },
  viewers: [{ userId: String, viewedAt: { type: Date, default: () => new Date() } }],
  isPrivateAtCreation: { type: Boolean, default: false }
}, { timestamps: true });

storySchema.index({ userId: 1, expiresAt: 1 });

export const Story: Model<IStoryDocument> = mongoose.models?.Story || mongoose.model<IStoryDocument>("Story", storySchema);
