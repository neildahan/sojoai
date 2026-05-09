import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const DELIVERABLE_TYPES = [
  'prd',
  'wireframes',
  'design-tokens',
  'frontend-code',
  'backend-code',
  'security-report',
  'test-plan',
  'devops-config',
  'marketing-plan',
  'social-post',
  'adr',
  'other',
] as const;
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number];

const ExportSchema = new Schema(
  {
    platform: {
      type: String,
      enum: ['google-docs', 'notion', 'confluence', 'pdf', 'markdown'],
      required: true,
    },
    url: { type: String, default: null },
    exportedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const DeliverableSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    agentId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: DELIVERABLE_TYPES, required: true },
    /** Markdown body. */
    content: { type: String, required: true },
    status: { type: String, enum: ['draft', 'delivered', 'exported'], default: 'draft' },
    exports: { type: [ExportSchema], default: [] },
  },
  { timestamps: true },
);

DeliverableSchema.index({ projectId: 1, createdAt: -1 });

export type DeliverableDoc = InferSchemaType<typeof DeliverableSchema> & { _id: string };

export const Deliverable: Model<DeliverableDoc> =
  (models.Deliverable as Model<DeliverableDoc>) ||
  model<DeliverableDoc>('Deliverable', DeliverableSchema);
