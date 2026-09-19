import mongoose, { Schema, Document } from 'mongoose'

export interface IWorkspace extends Document {
	name: string
	slug: string
	ownerId: string
	description?: string
	createdAt: Date
	updatedAt: Date
}

const workspaceSchema = new Schema<IWorkspace>(
	{
		name: { type: String, required: true, trim: true },
		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		ownerId: { type: String, required: true, index: true },
		description: { type: String, default: '' },
	},
	{ timestamps: true },
)

workspaceSchema.index({ ownerId: 1, createdAt: -1 })

export const Workspace =
	mongoose.models.Workspace ||
	mongoose.model<IWorkspace>('Workspace', workspaceSchema)
