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

export type WorkspaceCreateInput = z.infer<typeof workspaceCreateSchema>
export type WorkspaceMemberAddInput = z.infer<typeof workspaceMemberAddSchema>
