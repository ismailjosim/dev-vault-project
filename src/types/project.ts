import { z } from 'zod'

export const projectCategorySchema = z.enum([
	'Full Stack',
	'Frontend',
	'Backend',
	'Mobile',
	'Other',
])

export const envTypeSchema = z.enum([
	'secret',
	'jwt',
	'api_key',
	'url',
	'database_url',
	'other',
])

export const environmentSchema = z.enum(['dev', 'prod', 'staging', 'test'])

const tagsSchema = z.array(z.string().trim().min(1).max(32)).max(12).default([])

export const projectCreateSchema = z.object({
	projectName: z.string().trim().min(2).max(80),
	description: z.string().trim().max(500).optional().default(''),
	category: projectCategorySchema.default('Other'),
	framework: z.string().trim().min(1).max(60).default('Other'),
	tags: tagsSchema,
})

export const projectUpdateSchema = projectCreateSchema
	.partial()
	.extend({
		isPinned: z.boolean().optional(),
	})
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	})

export const projectQuerySchema = z.object({
	search: z.string().trim().optional().default(''),
	category: z.string().trim().optional().default(''),
	framework: z.string().trim().optional().default(''),
	tag: z.string().trim().optional().default(''),
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(50).optional().default(12),
})

export const envVariableCreateSchema = z.object({
	key: z
		.string()
		.trim()
		.min(1)
		.max(120)
		.regex(
			/^[A-Z][A-Z0-9_]*$/,
			'Use uppercase letters, numbers, and underscores',
		),
	value: z.string().min(1).max(10000),
	type: envTypeSchema.default('other'),
	isPublic: z.boolean().default(false),
	note: z.string().trim().max(500).optional().default(''),
	environment: environmentSchema.default('dev'),
	expiryDate: z.string().datetime().nullable().optional(),
})

export const envVariableImportSchema = z.object({
	variables: z
		.array(
			envVariableCreateSchema.pick({
				key: true,
				value: true,
				type: true,
				isPublic: true,
				note: true,
				environment: true,
				expiryDate: true,
			}),
		)
		.min(1)
		.max(200),
})

export const envVariableUpdateSchema = envVariableCreateSchema
	.partial()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	})

export const envQuerySchema = z.object({
	environment: environmentSchema.optional(),
	reveal: z.coerce.boolean().optional().default(false),
})

export const exportSchema = z.object({
	format: z.enum([
		'env',
		'env.local',
		'env.production',
		'env.development',
		'env.test',
		'json',
		'yaml',
		'markdown',
		'example',
	]),
	environment: environmentSchema.optional(),
	resolveInterpolation: z.boolean().optional().default(false),
})

export const projectDocumentationSchema = z.object({
	clientRepo: z.string().trim().url().or(z.literal('')).optional().default(''),
	serverRepo: z.string().trim().url().or(z.literal('')).optional().default(''),
	liveURL: z.string().trim().url().or(z.literal('')).optional().default(''),
	vercelURL: z.string().trim().url().or(z.literal('')).optional().default(''),
	herokuURL: z.string().trim().url().or(z.literal('')).optional().default(''),
	databaseName: z.string().trim().max(120).optional().default(''),
	adminEmail: z
		.string()
		.trim()
		.email()
		.or(z.literal(''))
		.optional()
		.default(''),
	testUserEmail: z
		.string()
		.trim()
		.email()
		.or(z.literal(''))
		.optional()
		.default(''),
	apiDocsURL: z.string().trim().url().or(z.literal('')).optional().default(''),
	teamMembers: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
	notes: z.string().trim().max(5000).optional().default(''),
	status: z.enum(['active', 'archived', 'completed']).default('active'),
})

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
export type EnvVariableCreateInput = z.infer<typeof envVariableCreateSchema>
export type EnvVariableUpdateInput = z.infer<typeof envVariableUpdateSchema>
export type ProjectDocumentationInput = z.infer<
	typeof projectDocumentationSchema
>
