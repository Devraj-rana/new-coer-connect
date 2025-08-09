import mongoose, { Document, Model, Schema } from "mongoose";

export interface IConversation {
  participants: string[]; // Clerk user IDs (exactly 2 for DM)
  lastMessage?: string;
  lastSenderId?: string;
  typingUsers?: string[]; // userIds currently typing
  typingUpdatedAt?: Date; // last time typingUsers changed
}

export interface IConversationDocument extends IConversation, Document {
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversationDocument>({
  participants: {
    type: [String],
    required: true,
    validate: {
      validator: (arr: string[]) => Array.isArray(arr) && arr.length === 2,
      message: "Direct conversations must have exactly 2 participants",
    },
    index: true,
  },
  lastMessage: { type: String },
  lastSenderId: { type: String },
  typingUsers: { type: [String], default: [] },
  typingUpdatedAt: { type: Date },
}, { timestamps: true });

conversationSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation: Model<IConversationDocument> = mongoose.models?.Conversation || mongoose.model<IConversationDocument>("Conversation", conversationSchema);
