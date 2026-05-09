import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    /** Agent id when role==='assistant'; 'user' string when role==='user'. */
    senderId: { type: String, required: true },
    content: { type: String, required: true },
    /** Token usage at the time the message was generated (for billing/diagnostics). */
    usage: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
      tier: { type: String, default: null },
    },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: true },
);

const ConversationSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    type: { type: String, enum: ['dm', 'team', 'meeting'], required: true },
    /** Agent ids + literal 'user'. */
    participants: { type: [String], default: [] },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true },
);

ConversationSchema.index({ projectId: 1, type: 1, updatedAt: -1 });

export type ConversationDoc = InferSchemaType<typeof ConversationSchema> & { _id: string };

export const Conversation: Model<ConversationDoc> =
  (models.Conversation as Model<ConversationDoc>) ||
  model<ConversationDoc>('Conversation', ConversationSchema);
