# Feature Specification: Workspaces & Role-Based Access Control (RBAC)

- **Status**: Proposed
- **Priority**: P1 (High)
- **Target Component**: Organization Architecture, Permissions & Project Sharing

---

## 1. Problem Statement

DevVault currently associates projects strictly with a single `userId`.

- There is no concept of a shared team workspace or organization.
- Team members cannot collaborate on the same set of project secrets.
- There are no role boundaries: if a developer has access to a project, they have unrestricted access to all environments, including production database strings, payment gateway keys, and cloud credentials.

In modern enterprise secret managers, **Role-Based Access Control (RBAC)** and environment permission gates are standard requirements to uphold the principle of least privilege.

---

## 2. User Stories

1. **As an Organization Owner**, I want to invite teammates to a shared workspace via email with assigned roles (`Admin`, `Developer`, `Viewer`).
2. **As an Engineering Lead**, I want to restrict `prod` environment variables so junior developers and contractors can view and edit `dev` and `staging`, but cannot read production secrets.
3. **As a Developer**, I want to toggle between my personal workspace and multiple company workspaces without logging out.

---

## 3. Data Architecture

### Mongoose Models

#### 1. `Workspace` (`src/models/Workspace.ts`)

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IWorkspace extends Document {
	name: string
	slug: string
	ownerId: string
	createdAt: Date
	updatedAt: Date
}

const workspaceSchema = new Schema<IWorkspace>(
	{
		name: { type: String, required: true, trim: true },
		slug: { type: String, required: true, unique: true, lowercase: true },
		ownerId: { type: String, required: true, index: true },
	},
	{ timestamps: true },
)

export const Workspace =
	mongoose.models.Workspace ||
	mongoose.model<IWorkspace>('Workspace', workspaceSchema)
```

#### 2. `WorkspaceMember` (`src/models/WorkspaceMember.ts`)

```typescript
import mongoose, { Schema, Document, Types } from 'mongoose'

export type WorkspaceRole = 'owner' | 'admin' | 'developer' | 'viewer'

export interface IWorkspaceMember extends Document {
	workspaceId: Types.ObjectId
	userId: string
	email: string
	role: WorkspaceRole
	// Environment permission overrides: ['dev', 'staging', 'prod', 'test']
	allowedEnvironments: string[]
	canRevealSecrets: boolean
	canExportSecrets: boolean
	createdAt: Date
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
		email: { type: String, required: true },
		role: {
			type: String,
			enum: ['owner', 'admin', 'developer', 'viewer'],
			default: 'developer',
		},
		allowedEnvironments: {
			type: [String],
			default: ['dev', 'staging', 'test'], // 'prod' gated by default
		},
		canRevealSecrets: { type: Boolean, default: false },
		canExportSecrets: { type: Boolean, default: false },
	},
	{ timestamps: true },
)

workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true })

export const WorkspaceMember =
	mongoose.models.WorkspaceMember ||
	mongoose.model<IWorkspaceMember>('WorkspaceMember', workspaceMemberSchema)
```

---

## 4. Permission Matrix

| Role          | View Dev/Staging |     View Prod     | Edit Secrets |   Reveal Value    | Export Files | Invite Members |
| ------------- | :--------------: | :---------------: | :----------: | :---------------: | :----------: | :------------: |
| **Owner**     |        ✅        |        ✅         |      ✅      |        ✅         |      ✅      |       ✅       |
| **Admin**     |        ✅        |        ✅         |      ✅      |        ✅         |      ✅      |       ✅       |
| **Developer** |        ✅        | ❌ (Configurable) |      ✅      | ✅ (Configurable) |      ❌      |       ❌       |
| **Viewer**    |        ✅        |        ❌         |      ❌      |        ❌         |      ❌      |       ❌       |

---

## 5. UI/UX Workflow

1. **Workspace Switcher**:
   - Placed in the top-left navigation next to the DevVault logo.
   - Allows quick switching between "Personal Vault" and organization vaults.
2. **Team Settings Page** (`/dashboard/settings/members`):
   - Member list with email, current role badge, and status.
   - "Invite Member" modal sending email invite tokens.
   - Permission overrides modal for individual users (e.g. Granting production reveal rights).
3. **Environment Lockout UI**:
   - If a developer selects the `prod` tab on a project without authorized permissions:
     - The table displays keys with a lock icon.
     - Values display "Restricted: Production access required".
     - The "Add Secret" button is disabled with an explanatory tooltip.
