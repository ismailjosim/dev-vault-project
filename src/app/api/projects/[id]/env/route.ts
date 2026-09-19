import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import { envQuerySchema, envVariableCreateSchema } from '@/types/project'
import { recordAudit } from '@/utils/audit'
import { resolveInterpolation } from '@/utils/interpolation'
import { recordEnvVersion } from '@/utils/versioning'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
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

		const query = envQuerySchema.parse(
			Object.fromEntries(request.nextUrl.searchParams),
		)
		const filter: Record<string, unknown> = { projectId: project._id }

		if (query.environment) filter.environment = query.environment

		const variables = await EnvVariable.find(filter).sort({
			environment: 1,
			key: 1,
		})

		let resolvedMap: Record<string, string> = {}
		let errorsMap: Record<string, string> = {}
		let dependenciesMap: Record<string, string[]> = {}

		if (query.reveal) {
			const dict: Record<string, string> = {}
			for (const variable of variables) {
				dict[variable.key] = variable.getDecryptedValue()
			}
			const interpolation = resolveInterpolation(dict)
			resolvedMap = interpolation.resolved
			errorsMap = interpolation.errors
			dependenciesMap = interpolation.dependencies
		}

		const payload = variables.map((variable) => {
			const item = serializeDocument<Record<string, unknown>>(variable)
			const decrypted = query.reveal ? variable.getDecryptedValue() : null
			item.value = decrypted
			if (query.reveal && decrypted !== null) {
				item.resolvedValue = resolvedMap[variable.key] ?? decrypted
				item.interpolationError = errorsMap[variable.key] ?? null
				item.dependencies = dependenciesMap[variable.key] ?? []
			}
			return item
		})

		return NextResponse.json({ variables: payload })
	} catch (error) {
		return handleApiError(error)
	}
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

		const input = envVariableCreateSchema.parse(await request.json())
		const variable = await EnvVariable.create({
			...input,
			projectId: project._id,
			expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
		})

		project.envVariables.addToSet(variable._id)
		await project.save()

		await recordEnvVersion({
			variableId: variable._id,
			projectId: project._id,
			environment: variable.environment,
			key: variable.key,
			value: input.value,
			changeType: 'created',
			changeReason: 'Initial creation',
			modifiedByUserId: userId,
		})

		const user = await getCurrentUser()
		await recordAudit({
			userId,
			userEmail: user?.email || 'user',
			action: 'SECRET_CREATE',
			projectId: project._id,
			projectName: project.projectName,
			targetKey: variable.key,
			environment: variable.environment,
			request,
		})

		const payload = serializeDocument<Record<string, unknown>>(variable)
		payload.value = null

		return NextResponse.json({ variable: payload }, { status: 201 })
	} catch (error) {
		return handleApiError(error)
	}
}
