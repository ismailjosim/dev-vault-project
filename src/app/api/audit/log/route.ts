import { handleApiError, requireUserId } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Project } from '@/models/Project'
import { recordAudit } from '@/utils/audit'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const auditInputSchema = z.object({
	action: z.enum([
		'SECRET_REVEAL',
		'SECRET_COPY',
		'SECRET_CREATE',
		'SECRET_UPDATE',
		'SECRET_DELETE',
		'SECRET_ROLLBACK',
		'ENV_EXPORT',
		'ENV_IMPORT',
		'PROJECT_CREATE',
		'PROJECT_DELETE',
		'SESSION_LOCK',
	]),
	projectId: z.string().optional(),
	targetKey: z.string().optional(),
	environment: z.string().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const user = await getCurrentUser()
		const userEmail = user?.email || 'unknown@user.com'

		const body = await request.json()
		const input = auditInputSchema.parse(body)

		await connectDB()

		let projectName: string | undefined
		if (input.projectId) {
			const project = await Project.findOne({ _id: input.projectId, userId })
			if (project) projectName = project.projectName
		}

		await recordAudit({
			userId,
			userEmail,
			action: input.action,
			projectId: input.projectId,
			projectName,
			targetKey: input.targetKey,
			environment: input.environment,
			metadata: input.metadata,
			request,
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		return handleApiError(error)
	}
}
