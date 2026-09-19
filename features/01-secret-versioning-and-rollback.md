# Feature Specification: Secret Versioning & Rollback History

- **Status**: Proposed
- **Priority**: P0 (Critical)
- **Target Component**: Environment Variables Management & API

---

## 1. Problem Statement

Currently in DevVault, updating an environment variable immediately overwrites the existing value in the MongoDB collection (`EnvVariable`). If a developer accidentally overrides a production database URI, an API key, or enters a broken formatting string:

- There is no record of what the previous value was.
- There is no record of who made the change or when it was made.
- There is no one-click mechanism to roll back to a known working configuration.

In platforms like **Infisical** and **Doppler**, every secret modification creates an immutable snapshot version, enabling instant comparison and point-in-time rollbacks.

---

## 2. User Stories

1. **As a Developer**, I want to view the complete history of any variable so I can see what changed and when.
2. **As a Lead Engineer**, I want to compare the previous version of a variable with the current version via a visual diff before approving deployments.
3. **As a DevOps Engineer**, I want to rollback an individual secret or an entire environment to a previous point in time if a deployment fails due to invalid configuration.

---

## 3. Data Architecture

### Mongoose Model: `EnvVariableVersion` (`src/models/EnvVariableVersion.ts`)

```typescript
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
```

---

## 4. API Endpoints

### 1. `GET /api/env/[id]/history`

Fetch the historical versions of a specific variable.

- **Authentication**: Required (Project Owner / Member)
- **Response**:

```json
{
	"success": true,
	"versions": [
		{
			"id": "v3_id",
			"versionNumber": 3,
			"changeType": "updated",
			"changeReason": "Rotated API key for Q3",
			"modifiedByUserId": "usr_123",
			"createdAt": "2026-09-19T10:00:00Z"
		},
		{
			"id": "v2_id",
			"versionNumber": 2,
			"changeType": "updated",
			"changeReason": "Fixed hostname",
			"modifiedByUserId": "usr_123",
			"createdAt": "2026-08-01T15:30:00Z"
		}
	]
}
```

### 2. `POST /api/env/[id]/rollback`

Revert a variable to a specified version number.

- **Payload**: `{ "targetVersionNumber": 2, "reason": "Incident mitigation" }`
- **Behavior**:
  1. Retrieve decrypted value from version 2.
  2. Create a new `versionNumber` (e.g. 4) with `changeType: 'rollback'`.
  3. Update `EnvVariable` current value.
  4. Trigger audit event.

---

## 5. UI/UX Workflow

1. In the project environment table (`EnvVariableItem.tsx`), add a **"History"** icon button next to the reveal/copy buttons.
2. Clicking **"History"** slides open a drawer showing a chronological timeline of modifications.
3. Each version card displays:
   - Version tag (e.g., `v2`, `v1`).
   - Timestamp and user tag.
   - Commit note / reason.
   - "Compare with Current" button.
   - "Rollback to this version" button with confirmation modal.
