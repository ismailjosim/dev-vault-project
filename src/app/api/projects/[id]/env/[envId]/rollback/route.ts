import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { EnvVariable } from '@/models/EnvVariable'
import { EnvVariableVersion } from '@/models/EnvVariableVersion'
import { Project } from '@/models/Project'
import { recordAudit } from '@/utils/audit'
import { recordEnvVersion } from '@/utils/versioning'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

type RouteContext = {
	params: Promise<{ id: string; envId: string }>
}

const rollbackSchema = z.object({
	targetVersionNumber: z.number().int().positive(),
	reason: z.string().optional(),
})

export async function POST(request: NextRequest, context: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		await connectDB()
		const { id, envId } = await context.params
		const project = await Project.findOne({ _id: id, userId })

		if (!project) {
			return NextResponse.json(
				{ message: 'Project not found' },
				{ status: 404 },
			)
		}

		const variable = await EnvVariable.findOne({
			_id: envId,
			projectId: project._id,
		})

		if (!variable) {
			return NextResponse.json(
				{ message: 'Environment variable not found' },
				{ status: 404 },
			)
		}

		const body = await request.json()
		const { targetVersionNumber, reason } = rollbackSchema.parse(body)

		const targetVersion = await EnvVariableVersion.findOne({
			variableId: variable._id,
			versionNumber: targetVersionNumber,
		})

		if (!targetVersion) {
			return NextResponse.json(
				{ message: `Version ${targetVersionNumber} not found` },
				{ status: 404 },
			)
		}

		const restoredValue = targetVersion.getDecryptedValue()

		// Update current variable value (setter will encrypt)
		variable.value = restoredValue
		await variable.save()

		// Record a new version entry for the rollback event
		const newVersion = await recordEnvVersion({
			variableId: variable._id,
			projectId: project._id,
			environment: variable.environment,
			key: variable.key,
			value: restoredValue,
			changeType: 'rollback',
			changeReason: reason || `Rolled back to version ${targetVersionNumber}`,
			modifiedByUserId: userId,
		})

		const user = await getCurrentUser()
		await recordAudit({
			userId,
			userEmail: user?.email || 'user',
			action: 'SECRET_ROLLBACK',
			projectId: project._id,
			projectName: project.projectName,
			targetKey: variable.key,
			environment: variable.environment,
			metadata: { targetVersionNumber, reason },
			request,
		})

		const payload = serializeDocument<Record<string, unknown>>(variable)
		payload.value = null

		return NextResponse.json({
			success: true,
			message: `Rolled back ${variable.key} to version ${targetVersionNumber}`,
			variable: payload,
			version: serializeDocument(newVersion),
		})
	} catch (error) {
		return handleApiError(error)
	}
}
