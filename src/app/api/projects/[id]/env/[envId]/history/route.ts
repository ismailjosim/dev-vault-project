import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { EnvVariable } from '@/models/EnvVariable'
import { EnvVariableVersion } from '@/models/EnvVariableVersion'
import { Project } from '@/models/Project'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
	params: Promise<{ id: string; envId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
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

		const reveal = request.nextUrl.searchParams.get('reveal') === 'true'

		const versions = await EnvVariableVersion.find({
			variableId: variable._id,
		}).sort({ versionNumber: -1 })

		const payload = versions.map((version) => {
			const item = serializeDocument<Record<string, unknown>>(version)
			item.value = reveal ? version.getDecryptedValue() : null
			return item
		})

		return NextResponse.json({
			success: true,
			currentVersion: {
				_id: variable._id,
				key: variable.key,
				environment: variable.environment,
				currentValue: reveal ? variable.getDecryptedValue() : null,
			},
			versions: payload,
		})
	} catch (error) {
		return handleApiError(error)
	}
}
