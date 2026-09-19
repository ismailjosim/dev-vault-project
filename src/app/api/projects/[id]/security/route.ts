import { handleApiError, requireUserId } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import { decryptValue } from '@/utils/encryption'
import { evaluateProjectHealth } from '@/utils/security-scanner'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const { id } = await params
		await connectDB()

		const project = await Project.findOne({ _id: id, userId })
		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const variables = await EnvVariable.find({ projectId: project._id })

		const decryptedVariables = variables.map((v) => {
			let value = ''
			try {
				value = decryptValue(v.encryptedValue)
			} catch {
				value = ''
			}
			return {
				key: v.key,
				value,
				environment: v.environment,
				type: v.type,
			}
		})

		const result = evaluateProjectHealth(decryptedVariables)

		return NextResponse.json({
			project: {
				id: project._id.toString(),
				name: project.projectName,
			},
			...result,
		})
	} catch (error) {
		return handleApiError(error)
	}
}
