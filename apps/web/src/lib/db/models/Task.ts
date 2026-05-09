import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const TaskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    agentId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done', 'blocked'],
      default: 'todo',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    /** Free text or another agent id when an agent has flagged a blocker. */
    blockedBy: { type: String, default: null },
    /** 'user' or an agent id. */
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

TaskSchema.index({ projectId: 1, status: 1, priority: -1 });

export type TaskDoc = InferSchemaType<typeof TaskSchema> & { _id: string };

export const Task: Model<TaskDoc> =
  (models.Task as Model<TaskDoc>) || model<TaskDoc>('Task', TaskSchema);
