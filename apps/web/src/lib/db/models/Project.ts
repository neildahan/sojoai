import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const IntegrationSchema = new Schema(
  {
    connected: { type: Boolean, default: false },
    /** OAuth tokens encrypted at rest — see lib/crypto.ts (Phase 5). */
    accessToken: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['greenfield', 'existing'], default: 'greenfield' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },

    integrations: {
      github: IntegrationSchema,
      figma: IntegrationSchema,
      notion: IntegrationSchema,
      googleDrive: IntegrationSchema,
    },

    settings: {
      standupTime: { type: String, default: '09:00' },
      timezone: { type: String, default: 'UTC' },
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' },
      },
    },
  },
  { timestamps: true },
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema> & { _id: string };

export const Project: Model<ProjectDoc> =
  (models.Project as Model<ProjectDoc>) || model<ProjectDoc>('Project', ProjectSchema);
