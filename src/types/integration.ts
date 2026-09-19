import { z } from 'zod'

export const integrationProviderSchema = z.enum(['vercel', 'github', 'webhook'])

export const environmentMappingSchema = z.object({
	sourceEnv: z.enum(['dev', 'staging', 'prod', 'test']),
	targetEnv: z.string().trim().min(1).max(60),
})

export const integrationCreateSchema = z.object({
	provider: integrationProviderSchema,
	name: z.string().trim().min(2).max(60),
	targetIdentifier: z.string().trim().min(2).max(120),
	authToken: z.string().min(1).max(500),
	environmentMapping: z.array(environmentMappingSchema).min(1),
})

export const integrationUpdateSchema = z.object({
	name: z.string().trim().min(2).max(60).optional(),
	targetIdentifier: z.string().trim().min(2).max(120).optional(),
	authToken: z.string().min(1).max(500).optional(),
	environmentMapping: z.array(environmentMappingSchema).optional(),
	isActive: z.boolean().optional(),
})

export type IntegrationCreateInput = z.infer<typeof integrationCreateSchema>
export type IntegrationUpdateInput = z.infer<typeof integrationUpdateSchema>
