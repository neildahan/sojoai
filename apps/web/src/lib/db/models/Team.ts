import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { AGENT_IDS } from '@/lib/agents/registry';

const STATUS_VALUES = ['active', 'busy', 'blocked', 'talking', 'idle'] as const;
export type AgentStatus = (typeof STATUS_VALUES)[number];

const TeamSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    agentId: { type: String, enum: AGENT_IDS, required: true },
    status: { type: String, enum: STATUS_VALUES, default: 'idle' },
    hiredAt: { type: Date, default: () => new Date() },
    currentTask: { type: String, default: '' },
    /** 0–100. */
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

TeamSchema.index({ projectId: 1, agentId: 1 }, { unique: true });

export type TeamDoc = InferSchemaType<typeof TeamSchema> & { _id: string };

export const Team: Model<TeamDoc> =
  (models.Team as Model<TeamDoc>) || model<TeamDoc>('Team', TeamSchema);
