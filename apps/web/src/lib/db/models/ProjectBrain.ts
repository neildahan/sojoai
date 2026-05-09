import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

/**
 * The shared memory all agents read from. Populated progressively as the team works.
 *
 * Crucial invariant: "agent-to-agent" handoffs aren't real conversations — they all
 * read from this doc. When Sarah finishes a PRD, it lands in `prd`. When Alex is
 * invoked next, the prompt builder injects `prd` into Alex's system prompt. The
 * illusion of a conversation is created in the UI.
 */

const ProjectBrainSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
      index: true,
    },

    // Populated by Sarah / discovery
    projectDescription: { type: String, default: '' },
    techStack: { type: Schema.Types.Mixed, default: null },
    prd: { type: String, default: '' },
    userStories: { type: [Schema.Types.Mixed], default: [] },

    // Populated by Marcus
    apiSchema: { type: Schema.Types.Mixed, default: null },
    dbSchema: { type: Schema.Types.Mixed, default: null },

    // Populated by Alex
    designSystem: { type: Schema.Types.Mixed, default: null },
    figmaComponents: { type: [Schema.Types.Mixed], default: [] },
    figmaColorTokens: { type: Schema.Types.Mixed, default: null },

    // Populated by Ryan
    securityNotes: { type: String, default: '' },

    // Populated by David
    deploymentConfig: { type: Schema.Types.Mixed, default: null },

    // Populated when GitHub is connected
    repoStructure: { type: String, default: '' },
    keyFiles: { type: Schema.Types.Mixed, default: null },
    dependencies: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

export type ProjectBrainDoc = InferSchemaType<typeof ProjectBrainSchema> & { _id: string };

export const ProjectBrain: Model<ProjectBrainDoc> =
  (models.ProjectBrain as Model<ProjectBrainDoc>) ||
  model<ProjectBrainDoc>('ProjectBrain', ProjectBrainSchema);
