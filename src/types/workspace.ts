import { z } from 'zod'

export const workspaceRoleSchema = z.enum([
	'owner',
	'admin',
	'developer',
	'viewer',
])

export const workspaceCreateSchema = z.object({
	name: z.string().trim().min(2).max(60),
	slug: z
		.string()
		.trim()
		.min(2)
		.max(60)
		.regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and dashes'),
	description: z.string().trim().max(300).optional().default(''),
})

export const workspaceUpdateSchema = workspaceCreateSchema.partial()

export const workspaceMemberAddSchema = z.object({
	email: z.string().trim().email(),
	role: workspaceRoleSchema.default('developer'),
	allowedEnvironments: z
		.array(z.enum(['dev', 'staging', 'prod', 'test']))
		.default(['dev', 'staging', 'test']),
	canRevealSecrets: z.boolean().default(false),
	canExportSecrets: z.boolean().default(false),
})

export const workspaceMemberUpdateSchema = workspaceMemberAddSchema
	.partial()
	.refine((val) => Object.keys(val).length > 0, {
		message: 'At least one field is required',
	})

export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>
export type WorkspaceCreateInput = z.infer<typeof workspaceCreateSchema>
export type WorkspaceMemberAddInput = z.infer<typeof workspaceMemberAddSchema>

// --- Workspace Entity Interfaces ---

export interface WorkspaceItem {
	_id: string
	name: string
	slug: string
	role?: WorkspaceRole | string
	description?: string
}

/** Alias for backwards compatibility with WorkspaceItem */
export type WorkspaceRecord = WorkspaceItem

export interface WorkspaceMemberItem {
	_id: string
	workspaceId?: string
	userId?: string
	email: string
	role: WorkspaceRole
	allowedEnvironments: string[]
	canRevealSecrets: boolean
	canExportSecrets: boolean
	createdAt?: string | Date
	updatedAt?: string | Date
}

/** Alias for backwards compatibility with WorkspaceMemberItem */
export type Member = WorkspaceMemberItem

// --- Component Props Interfaces ---

export interface WorkspaceSwitcherProps {
	initialWorkspaces?: WorkspaceItem[]
}

export interface CreateWorkspaceDialogProps {
	onCreated?: (workspace: WorkspaceItem) => void
	trigger?: React.ReactNode
}

export interface MembersManagementProps {
	workspaceId: string
	initialMembers: WorkspaceMemberItem[]
	currentUserRole: string
}

export interface InviteMemberDialogProps {
	workspaceId: string
	isOpen: boolean
	onClose: () => void
	onMemberInvited: (member: WorkspaceMemberItem) => void
}

export interface MembersTableProps {
	members: WorkspaceMemberItem[]
	isOwnerOrAdmin: boolean
	onRemoveMember: (memberId: string) => Promise<void> | void
}

export interface WorkspaceMenuItemProps {
	workspace: WorkspaceItem
	isActive: boolean
	onSelect: (id: string) => void
	onManageTeam: () => void
}

