import { handleApiError, requireUserId } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import { recordAudit } from '@/utils/audit'
import { recordEnvVersion } from '@/utils/versioning'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const cloneEnvSchema = z.object({
	sourceEnvironment: z.string().min(1),
	targetEnvironment: z.string().min(1),
	copyValues: z.boolean().default(false),
	keys: z.array(z.string()).optional(),
})

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		await connectDB()
		const { id } = await context.params
		const project = await Project.findOne({ _id: id, userId })

		if (!project) {
			return NextResponse.json(
				{ message: 'Project not found' },
				{ status: 404 },
			)
		}

		const body = cloneEnvSchema.parse(await request.json())
		const {
			sourceEnvironment,
			targetEnvironment,
			copyValues,
			keys: selectedKeys,
		} = body

		if (sourceEnvironment === targetEnvironment) {
			return NextResponse.json(
				{ message: 'Source and target environments must be different' },
				{ status: 400 },
			)
		}

		// Find existing keys in target environment
		const targetExisting = await EnvVariable.find({
			projectId: project._id,
			environment: targetEnvironment,
		}).select('key')
		const existingKeysSet = new Set(targetExisting.map((v) => v.key))

		// Find source variables
		const sourceQuery: Record<string, unknown> = {
			projectId: project._id,
			environment: sourceEnvironment,
		}
		if (selectedKeys && selectedKeys.length > 0) {
			sourceQuery.key = { $in: selectedKeys }
		}

		const sourceVars = await EnvVariable.find(sourceQuery)
		const missingInTarget = sourceVars.filter(
			(v) => !existingKeysSet.has(v.key),
		)

		if (missingInTarget.length === 0) {
			return NextResponse.json({
				clonedCount: 0,
				message: 'No missing variables found to clone',
				keys: [],
			})
		}

		const user = await getCurrentUser()
		const clonedKeys: string[] = []

		for (const srcVar of missingInTarget) {
			const initialValue = copyValues ? srcVar.getDecryptedValue() : ''
			const newVar = await EnvVariable.create({
				projectId: project._id,
				environment: targetEnvironment,
				key: srcVar.key,
				value: initialValue,
				type: srcVar.type,
				isPublic: srcVar.isPublic,
				note: srcVar.note
					? `[Cloned from ${sourceEnvironment}] ${srcVar.note}`
					: `Cloned from ${sourceEnvironment}`,
			})

			project.envVariables.addToSet(newVar._id)

			await recordEnvVersion({
				variableId: newVar._id,
				projectId: project._id,
				environment: targetEnvironment,
				key: newVar.key,
				value: initialValue,
				changeType: 'created',
				changeReason: `Cloned from environment ${sourceEnvironment}`,
				modifiedByUserId: userId,
			})

			await recordAudit({
				userId,
				userEmail: user?.email || 'user',
				action: 'SECRET_CREATE',
				projectId: project._id,
				projectName: project.projectName,
				targetKey: newVar.key,
				environment: targetEnvironment,
				request,
			})

			clonedKeys.push(newVar.key)
		}

		await project.save()

		return NextResponse.json({
			clonedCount: clonedKeys.length,
			keys: clonedKeys,
			message: `Successfully cloned ${clonedKeys.length} variable(s) to ${targetEnvironment}`,
		})
	} catch (error) {
		return handleApiError(error)
	}
}
