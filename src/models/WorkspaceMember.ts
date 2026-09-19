import mongoose, { Schema, Document, Types } from 'mongoose'

export type WorkspaceRole = 'owner' | 'admin' | 'developer' | 'viewer'

export interface IWorkspaceMember extends Document {
	workspaceId: Types.ObjectId
	userId: string
	email: string
	role: WorkspaceRole
	allowedEnvironments: string[]
	canRevealSecrets: boolean
	canExportSecrets: boolean
	createdAt: Date
	updatedAt: Date
}

const workspaceMemberSchema = new Schema<IWorkspaceMember>(
	{
		workspaceId: {
			type: Schema.Types.ObjectId,
			ref: 'Workspace',
			required: true,
			index: true,
		},
		userId: { type: String, required: true, index: true },
		email: { type: String, required: true, trim: true, lowercase: true },
		role: {
			type: String,
			enum: ['owner', 'admin', 'developer', 'viewer'],
			default: 'developer',
		},
		allowedEnvironments: {
			type: [String],
			default: ['dev', 'staging', 'test'],
		},
		canRevealSecrets: { type: Boolean, default: false },
		canExportSecrets: { type: Boolean, default: false },
	},
	{ timestamps: true },
)

workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true })
workspaceMemberSchema.index({ workspaceId: 1, email: 1 }, { unique: true })

export const WorkspaceMember =
	mongoose.models.WorkspaceMember ||
	mongoose.model<IWorkspaceMember>('WorkspaceMember', workspaceMemberSchema)
