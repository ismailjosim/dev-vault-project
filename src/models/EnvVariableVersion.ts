import mongoose, { Schema, Document, Types } from 'mongoose'
import { encryptValue, decryptValue } from '@/utils/encryption'

export interface IEnvVariableVersion extends Document {
	variableId: Types.ObjectId
	projectId: Types.ObjectId
	environment: 'dev' | 'staging' | 'prod' | 'test'
	key: string
	encryptedValue: string
	versionNumber: number
	changeType: 'created' | 'updated' | 'deleted' | 'rollback'
	changeReason?: string
	modifiedByUserId: string
	createdAt: Date

	getDecryptedValue(): string
}

const envVariableVersionSchema = new Schema<IEnvVariableVersion>(
	{
		variableId: {
			type: Schema.Types.ObjectId,
			ref: 'EnvVariable',
			required: true,
			index: true,
		},
		projectId: {
			type: Schema.Types.ObjectId,
			ref: 'Project',
			required: true,
			index: true,
		},
		environment: {
			type: String,
			enum: ['dev', 'staging', 'prod', 'test'],
			required: true,
		},
		key: {
			type: String,
			required: true,
			trim: true,
		},
		encryptedValue: {
			type: String,
			required: true,
			set: (value: string) => encryptValue(value),
		},
		versionNumber: {
			type: Number,
			required: true,
		},
		changeType: {
			type: String,
			enum: ['created', 'updated', 'deleted', 'rollback'],
			default: 'updated',
		},
		changeReason: {
			type: String,
			default: '',
		},
		modifiedByUserId: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
)

envVariableVersionSchema.index({ variableId: 1, versionNumber: -1 })
envVariableVersionSchema.index({ projectId: 1, environment: 1, createdAt: -1 })

envVariableVersionSchema.methods.getDecryptedValue = function (): string {
	return decryptValue(this.encryptedValue)
}

export const EnvVariableVersion =
	mongoose.models.EnvVariableVersion ||
	mongoose.model<IEnvVariableVersion>(
		'EnvVariableVersion',
		envVariableVersionSchema,
	)
