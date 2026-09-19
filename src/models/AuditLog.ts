import mongoose, { Schema, Document, Types } from 'mongoose'

export type AuditActionType =
	| 'SECRET_REVEAL'
	| 'SECRET_COPY'
	| 'SECRET_CREATE'
	| 'SECRET_UPDATE'
	| 'SECRET_DELETE'
	| 'SECRET_ROLLBACK'
	| 'ENV_EXPORT'
	| 'ENV_IMPORT'
	| 'PROJECT_CREATE'
	| 'PROJECT_DELETE'
	| 'SESSION_LOCK'

export interface IAuditLog extends Document {
	userId: string
	userEmail: string
	action: AuditActionType
	projectId?: Types.ObjectId
	projectName?: string
	targetKey?: string
	environment?: string
	ipAddress?: string
	userAgent?: string
	metadata?: Record<string, unknown>
	createdAt: Date
}

const auditLogSchema = new Schema<IAuditLog>(
	{
		userId: { type: String, required: true, index: true },
		userEmail: { type: String, required: true },
		action: {
			type: String,
			required: true,
			index: true,
		},
		projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
		projectName: { type: String },
		targetKey: { type: String },
		environment: { type: String },
		ipAddress: { type: String, default: 'unknown' },
		userAgent: { type: String, default: 'unknown' },
		metadata: { type: Schema.Types.Mixed, default: {} },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
)

auditLogSchema.index({ projectId: 1, createdAt: -1 })
auditLogSchema.index({ userId: 1, createdAt: -1 })

export const AuditLog =
	mongoose.models.AuditLog ||
	mongoose.model<IAuditLog>('AuditLog', auditLogSchema)
