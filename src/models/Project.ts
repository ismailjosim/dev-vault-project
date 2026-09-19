import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IProject extends Document {
	userId: string
	workspaceId?: Types.ObjectId
	projectName: string
	slug: string
	description: string
	category: string
	framework: string
	tags: string[]
	isPinned: boolean
	envVariables: Types.ObjectId[]
	environments: string[]
	documentation: {
		clientRepo: string
		serverRepo: string
		liveURL: string
		vercelURL: string
		herokuURL: string
		databaseName: string
		adminEmail: string
		testUserEmail: string
		apiDocsURL: string
		teamMembers: string[]
		notes: string
		status: 'active' | 'archived' | 'completed'
	}
	createdAt: Date
	updatedAt: Date
}

const projectSchema = new Schema<IProject>(
	{
		userId: {
			type: String,
			required: true,
			index: true,
		},
		workspaceId: {
			type: Schema.Types.ObjectId,
			ref: 'Workspace',
			default: null,
			index: true,
		},
		projectName: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			index: true,
		},
		description: {
			type: String,
			default: '',
		},
		category: {
			type: String,
			enum: ['Full Stack', 'Frontend', 'Backend', 'Mobile', 'Other'],
			default: 'Other',
		},
		framework: {
			type: String,
			default: 'Other',
		},
		tags: {
			type: [String],
			default: [],
		},
		isPinned: {
			type: Boolean,
			default: false,
		},
		envVariables: [
			{
				type: Schema.Types.ObjectId,
				ref: 'EnvVariable',
			},
		],
		environments: {
			type: [String],
			enum: ['dev', 'staging', 'prod', 'test'],
			default: ['dev', 'prod'],
		},
		documentation: {
			clientRepo: { type: String, default: '' },
			serverRepo: { type: String, default: '' },
			liveURL: { type: String, default: '' },
			vercelURL: { type: String, default: '' },
			herokuURL: { type: String, default: '' },
			databaseName: { type: String, default: '' },
			adminEmail: { type: String, default: '' },
			testUserEmail: { type: String, default: '' },
			apiDocsURL: { type: String, default: '' },
			teamMembers: { type: [String], default: [] },
			notes: { type: String, default: '' },
			status: {
				type: String,
				enum: ['active', 'archived', 'completed'],
				default: 'active',
			},
		},
	},
	{
		timestamps: true,
	},
)

// Index for user projects
projectSchema.index({ userId: 1, createdAt: -1 })

export const Project =
	mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema)
