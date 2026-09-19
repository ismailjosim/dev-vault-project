import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import { envVariableImportSchema } from '@/types/project'
import { recordAudit } from '@/utils/audit'
import { recordEnvVersion } from '@/utils/versioning'
import { NextRequest, NextResponse } from 'next/server'

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

		const input = envVariableImportSchema.parse(await request.json())
		const savedVariables = []

		for (const variableInput of input.variables) {
			const existingVariable = await EnvVariable.findOne({
				projectId: project._id,
				key: variableInput.key,
				environment: variableInput.environment,
			})

			if (existingVariable) {
				existingVariable.set({
					...variableInput,
					expiryDate: variableInput.expiryDate
						? new Date(variableInput.expiryDate)
						: null,
				})
				const updated = await existingVariable.save()
				await recordEnvVersion({
					variableId: updated._id,
					projectId: project._id,
					environment: variableInput.environment,
					key: variableInput.key,
					value: variableInput.value,
					changeType: 'updated',
					changeReason: 'Updated via .env import',
					modifiedByUserId: userId,
				})
				savedVariables.push(updated)
				continue
			}

			const variable = await EnvVariable.create({
				...variableInput,
				expiryDate: variableInput.expiryDate
					? new Date(variableInput.expiryDate)
					: null,
				projectId: project._id,
			})
			project.envVariables.addToSet(variable._id)
			await recordEnvVersion({
				variableId: variable._id,
				projectId: project._id,
				environment: variableInput.environment,
				key: variableInput.key,
				value: variableInput.value,
				changeType: 'created',
				changeReason: 'Created via .env import',
				modifiedByUserId: userId,
			})
			savedVariables.push(variable)
		}

		await project.save()

		const user = await getCurrentUser()
		await recordAudit({
			userId,
			userEmail: user?.email || 'user',
			action: 'ENV_IMPORT',
			projectId: project._id,
			projectName: project.projectName,
			metadata: { importedCount: savedVariables.length },
			request,
		})

		const variables =
			serializeDocument<Record<string, unknown>[]>(savedVariables)

		return NextResponse.json({
			variables: variables.map((variable) => ({
				...variable,
				value: null,
			})),
			count: savedVariables.length,
		})
	} catch (error) {
		return handleApiError(error)
	}
}
