import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IMessage {
  conversationId: Types.ObjectId;
  senderId: string; // Clerk user ID
  content: string;
  readBy: string[]; // userIds who read the message
}

export interface IMessageDocument extends IMessage, Document {
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessageDocument>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  readBy: { type: [String], default: [], index: true },
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message: Model<IMessageDocument> = mongoose.models?.Message || mongoose.model<IMessageDocument>("Message", messageSchema);
