import mongoose, { Schema, Document } from 'mongoose'
import { hashValue } from '@/utils/encryption'

export interface IApiKey extends Document {
	userId: string
	name: string
	keyPrefix: string
	hashedKey: string
	lastUsedAt?: Date
	expiresAt?: Date
	createdAt: Date
	updatedAt: Date
}

const apiKeySchema = new Schema<IApiKey>(
	{
		userId: { type: String, required: true, index: true },
		name: { type: String, required: true, trim: true },
		keyPrefix: { type: String, required: true },
		hashedKey: {
			type: String,
			required: true,
			set: (rawKey: string) =>
				rawKey.length === 64 ? rawKey : hashValue(rawKey),
		},
		lastUsedAt: { type: Date },
		expiresAt: { type: Date },
	},
	{ timestamps: true },
)

apiKeySchema.index({ userId: 1, createdAt: -1 })
apiKeySchema.index({ hashedKey: 1 })

export const ApiKey =
	mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', apiKeySchema)
