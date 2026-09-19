import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import { envVariableUpdateSchema } from '@/types/project'
import { recordAudit } from '@/utils/audit'
import { recordEnvVersion } from '@/utils/versioning'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
	params: Promise<{ id: string; envId: string }>
}

async function getOwnedProject(id: string, userId: string) {
	return Project.findOne({ _id: id, userId })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		await connectDB()
		const { id, envId } = await context.params
		const project = await getOwnedProject(id, userId)

		if (!project) {
			return NextResponse.json(
				{ message: 'Project not found' },
				{ status: 404 },
			)
		}

		const input = envVariableUpdateSchema.parse(await request.json())
		const update: Record<string, unknown> = { ...input }

		if ('expiryDate' in input) {
			update.expiryDate = input.expiryDate ? new Date(input.expiryDate) : null
		}

		const variable = await EnvVariable.findOneAndUpdate(
			{ _id: envId, projectId: project._id },
			update,
			{ new: true, runValidators: true },
		)

		if (!variable) {
			return NextResponse.json(
				{ message: 'Environment variable not found' },
				{ status: 404 },
			)
		}

		if ('value' in input && input.value) {
			await recordEnvVersion({
				variableId: variable._id,
				projectId: project._id,
				environment: variable.environment,
				key: variable.key,
				value: input.value,
				changeType: 'updated',
				changeReason: 'Updated secret value',
				modifiedByUserId: userId,
			})
		}

		const user = await getCurrentUser()
		await recordAudit({
			userId,
			userEmail: user?.email || 'user',
			action: 'SECRET_UPDATE',
			projectId: project._id,
			projectName: project.projectName,
			targetKey: variable.key,
			environment: variable.environment,
			request,
		})

		const payload = serializeDocument<Record<string, unknown>>(variable)
		payload.value = null

		return NextResponse.json({ variable: payload })
	} catch (error) {
		return handleApiError(error)
	}
}

export async function DELETE(request: NextRequest, context: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		await connectDB()
		const { id, envId } = await context.params
		const project = await getOwnedProject(id, userId)

		if (!project) {
			return NextResponse.json(
				{ message: 'Project not found' },
				{ status: 404 },
			)
		}

		const variable = await EnvVariable.findOneAndDelete({
			_id: envId,
			projectId: project._id,
		})

		if (!variable) {
			return NextResponse.json(
				{ message: 'Environment variable not found' },
				{ status: 404 },
			)
		}

		await recordEnvVersion({
			variableId: variable._id,
			projectId: project._id,
			environment: variable.environment,
			key: variable.key,
			value: variable.getDecryptedValue(),
			changeType: 'deleted',
			changeReason: 'Variable deleted',
			modifiedByUserId: userId,
		})

		const user = await getCurrentUser()
		await recordAudit({
			userId,
			userEmail: user?.email || 'user',
			action: 'SECRET_DELETE',
			projectId: project._id,
			projectName: project.projectName,
			targetKey: variable.key,
			environment: variable.environment,
			request,
		})

		project.envVariables.pull(variable._id)
		await project.save()

		return NextResponse.json({ message: 'Environment variable deleted' })
	} catch (error) {
		return handleApiError(error)
	}
}
