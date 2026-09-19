import mongoose, { Schema, Document, Types } from 'mongoose'
import { encryptValue, decryptValue } from '@/utils/encryption'

export type IntegrationProvider = 'vercel' | 'github' | 'webhook'

export interface IEnvironmentMapping {
	sourceEnv: 'dev' | 'staging' | 'prod' | 'test'
	targetEnv: string
}

export interface IIntegration extends Document {
	projectId: Types.ObjectId
	provider: IntegrationProvider
	name: string
	environmentMapping: IEnvironmentMapping[]
	encryptedAuthToken: string
	targetIdentifier: string
	isActive: boolean
	lastSyncAt?: Date
	lastSyncStatus?: 'success' | 'failed'
	lastSyncError?: string
	createdAt: Date
	updatedAt: Date

	getDecryptedToken(): string
}

const integrationSchema = new Schema<IIntegration>(
	{
		projectId: {
			type: Schema.Types.ObjectId,
			ref: 'Project',
			required: true,
			index: true,
		},
		provider: {
			type: String,
			enum: ['vercel', 'github', 'webhook'],
			required: true,
		},
		name: { type: String, required: true, trim: true },
		environmentMapping: [
			{
				sourceEnv: { type: String, required: true },
				targetEnv: { type: String, required: true },
			},
		],
		encryptedAuthToken: {
			type: String,
			required: true,
			set: (token: string) =>
				token.startsWith('U2F') || token.length > 40
					? token
					: encryptValue(token),
		},
		targetIdentifier: { type: String, required: true, trim: true },
		isActive: { type: Boolean, default: true },
		lastSyncAt: { type: Date },
		lastSyncStatus: { type: String, enum: ['success', 'failed'] },
		lastSyncError: { type: String },
	},
	{ timestamps: true },
)

integrationSchema.methods.getDecryptedToken = function (): string {
	return decryptValue(this.encryptedAuthToken)
}

export const Integration =
	mongoose.models.Integration ||
	mongoose.model<IIntegration>('Integration', integrationSchema)
