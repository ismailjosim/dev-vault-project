import { z } from 'zod'

export const apiKeyCreateSchema = z.object({
	name: z.string().trim().min(2).max(60),
	expiresInDays: z.number().int().min(1).max(365).nullable().optional(),
})

export type ApiKeyCreateInput = z.infer<typeof apiKeyCreateSchema>
