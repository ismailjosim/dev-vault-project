import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { Integration } from '@/models/Integration'
import { Project } from '@/models/Project'
import { integrationCreateSchema } from '@/types/integration'
import { encryptValue } from '@/utils/encryption'
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

		const integrations = await Integration.find({ projectId: id })
			.select('-encryptedAuthToken')
			.sort({ createdAt: -1 })

		return NextResponse.json({
			integrations: serializeDocument(integrations),
		})
	} catch (error) {
		return handleApiError(error)
	}
}

export async function POST(request: NextRequest, { params }: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const { id } = await params
		await connectDB()

		const project = await Project.findOne({ _id: id, userId })
		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const input = integrationCreateSchema.parse(await request.json())

		const integration = await Integration.create({
			projectId: id,
			provider: input.provider,
			name: input.name,
			targetIdentifier: input.targetIdentifier,
			encryptedAuthToken: encryptValue(input.authToken),
			environmentMapping: input.environmentMapping,
		})

		const serialized = serializeDocument<Record<string, unknown>>(integration)
		delete serialized.encryptedAuthToken

		return NextResponse.json({ integration: serialized }, { status: 201 })
	} catch (error) {
		return handleApiError(error)
	}
}
