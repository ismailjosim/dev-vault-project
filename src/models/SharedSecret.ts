import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ISharedSecret extends Document {
	shareId: string
	encryptedContent: string
	passphraseHash?: string | null
	maxViews: number
	currentViews: number
	expiresAt: Date
	createdAt: Date
	updatedAt: Date
}

const sharedSecretSchema = new Schema<ISharedSecret>(
	{
		shareId: {
			type: String,
			required: true,
			unique: true,
			index: true,
			trim: true,
		},
		encryptedContent: {
			type: String,
			required: true,
		},
		passphraseHash: {
			type: String,
			default: null,
		},
		maxViews: {
			type: Number,
			default: 1,
			min: 1,
		},
		currentViews: {
			type: Number,
			default: 0,
			min: 0,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	},
)

// MongoDB TTL index: documents are automatically removed by MongoDB after expiresAt
sharedSecretSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const SharedSecret: Model<ISharedSecret> =
	mongoose.models.SharedSecret ||
	mongoose.model<ISharedSecret>('SharedSecret', sharedSecretSchema)
