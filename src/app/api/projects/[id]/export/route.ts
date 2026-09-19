import { handleApiError, requireUserId } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import { exportSchema } from '@/types/project'
import { recordAudit } from '@/utils/audit'
import { generateEnvFile, getExportFilename } from '@/utils/env-exporter'
import { resolveInterpolation } from '@/utils/interpolation'
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

		const input = exportSchema.parse(await request.json())
		const filter: Record<string, unknown> = { projectId: project._id }

		if (input.environment) filter.environment = input.environment

		const variables = await EnvVariable.find(filter).sort({
			environment: 1,
			key: 1,
		})
		let exportVariables = variables.map((variable) => ({
			key: variable.key,
			value: variable.getDecryptedValue(),
			note: variable.note,
			type: variable.type,
			environment: variable.environment,
		}))

		if (input.resolveInterpolation) {
			const dict: Record<string, string> = {}
			for (const v of exportVariables) {
				dict[v.key] = v.value
			}
			const { resolved } = resolveInterpolation(dict)
			exportVariables = exportVariables.map((v) => ({
				...v,
				value: resolved[v.key] ?? v.value,
			}))
		}

		const filename = getExportFilename(project.slug, input.format)
		const content = generateEnvFile(exportVariables, input.format)

		const user = await getCurrentUser()
		await recordAudit({
			userId,
			userEmail: user?.email || 'user',
			action: 'ENV_EXPORT',
			projectId: project._id,
			projectName: project.projectName,
			environment: input.environment,
			metadata: { format: input.format, count: exportVariables.length },
			request,
		})

		return NextResponse.json({ filename, content })
	} catch (error) {
		return handleApiError(error)
	}
}
