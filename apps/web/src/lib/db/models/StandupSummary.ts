import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const AgentReportSchema = new Schema(
  {
    agentId: { type: String, required: true },
    update: { type: String, required: true },
    status: { type: String, enum: ['on-track', 'in-discussion', 'blocked'], required: true },
    blocker: { type: String, default: null },
  },
  { _id: false },
);

const StandupSummarySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    date: { type: Date, required: true },
    agentReports: { type: [AgentReportSchema], default: [] },
    /** Compiled by Jamie. */
    summary: { type: String, default: '' },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

StandupSummarySchema.index({ projectId: 1, date: -1 });

export type StandupSummaryDoc = InferSchemaType<typeof StandupSummarySchema> & { _id: string };

export const StandupSummary: Model<StandupSummaryDoc> =
  (models.StandupSummary as Model<StandupSummaryDoc>) ||
  model<StandupSummaryDoc>('StandupSummary', StandupSummarySchema);
