import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const PLAN_VALUES = ['free', 'starter', 'pro', 'team'] as const;
export type Plan = (typeof PLAN_VALUES)[number];

const UserSchema = new Schema(
  {
    /** Clerk userId — primary external identity. */
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    plan: { type: String, enum: PLAN_VALUES, default: 'free' },
    stripeCustomerId: { type: String, default: null },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>('User', UserSchema);
