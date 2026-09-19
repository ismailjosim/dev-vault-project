# Feature Specification: Audit Logging & Compliance Trails

- **Status**: Implemented ✅
- **Priority**: P0 (Critical)
- **Target Component**: Security, API & Dashboard

---

## 1. Problem Statement

Security compliance standards (SOC 2, ISO 27001, HIPAA) mandate that any access to sensitive secrets (passwords, private keys, database credentials) must generate a tamper-evident audit record.

Currently, DevVault has **zero logging** when:

- A user unmasks a secret value on screen.
- A user copies a secret to the clipboard.
- A user exports `.env` or JSON payloads.
- An environment variable or project is created, modified, or deleted.

If a credential leak occurs, administrators have no way of auditing who accessed or exported the secret.

---

## 2. User Stories

1. **As a Security Admin**, I want to see an immutable activity log of all secret views and exports to ensure no unauthorized exfiltration has occurred.
2. **As a Developer**, I want to know who modified or rotated a database key when an application breaks.
3. **As an Auditor**, I want to export audit logs in CSV/JSON format for compliance reporting.

---

## 3. Data Architecture

### Mongoose Model: `AuditLog` (`src/models/AuditLog.ts`)

```typescript
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

// Compound index for querying project audit streams
auditLogSchema.index({ projectId: 1, createdAt: -1 })
auditLogSchema.index({ userId: 1, createdAt: -1 })

export const AuditLog =
	mongoose.models.AuditLog ||
	mongoose.model<IAuditLog>('AuditLog', auditLogSchema)
```

---

## 4. API Endpoints

### 1. `POST /api/audit/log`

Triggered by client or server when a sensitive action occurs (e.g. unmasking a secret or copying to clipboard).

- **Request Body**:

```json
{
	"action": "SECRET_REVEAL",
	"projectId": "proj_123",
	"targetKey": "DATABASE_URL",
	"environment": "prod"
}
```

### 2. `GET /api/audit/project/[id]`

Retrieve paginated audit logs for a specific project.

- **Query Params**: `page=1&limit=50&action=SECRET_REVEAL`
- **Response**:

```json
{
	"logs": [
		{
			"id": "log_01",
			"userEmail": "alex@company.com",
			"action": "SECRET_REVEAL",
			"targetKey": "STRIPE_SECRET_KEY",
			"environment": "prod",
			"createdAt": "2026-09-19T14:22:10Z"
		}
	],
	"total": 45
}
```

---

## 5. UI/UX Workflow

1. Add an **"Audit Log"** tab inside the project dashboard navigation (`/dashboard/projects/[id]/audit`).
2. Display a real-time event table with:
   - Event badge (`REVEAL`, `COPY`, `EXPORT`, `UPDATE`) with color codes.
   - Target variable name & environment pill.
   - User email & timestamp with relative time formatting (e.g., "5 minutes ago").
   - Filter by event type, date range, or specific variable key.
3. Provide an **"Export CSV"** button for compliance documentation.
