import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { Integration } from '@/models/Integration'
import { Project } from '@/models/Project'
import { integrationUpdateSchema } from '@/types/integration'
import { encryptValue } from '@/utils/encryption'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
	params: Promise<{ id: string; integrationId: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const { id, integrationId } = await params
		await connectDB()

		const project = await Project.findOne({ _id: id, userId })
		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const integration = await Integration.findOne({
			_id: integrationId,
			projectId: id,
		})
		if (!integration) {
			return NextResponse.json(
				{ error: 'Integration not found' },
				{ status: 404 },
			)
		}

		const input = integrationUpdateSchema.parse(await request.json())

		if (input.name) integration.name = input.name
		if (input.targetIdentifier)
			integration.targetIdentifier = input.targetIdentifier
		if (input.isActive !== undefined) integration.isActive = input.isActive
		if (input.environmentMapping)
			integration.environmentMapping = input.environmentMapping
		if (input.authToken) {
			integration.encryptedAuthToken = encryptValue(input.authToken)
		}

		await integration.save()

		const serialized = serializeDocument<Record<string, unknown>>(integration)
		delete serialized.encryptedAuthToken

		return NextResponse.json({ integration: serialized })
	} catch (error) {
		return handleApiError(error)
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const { id, integrationId } = await params
		await connectDB()

		const project = await Project.findOne({ _id: id, userId })
		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const deleted = await Integration.findOneAndDelete({
			_id: integrationId,
			projectId: id,
		})

		if (!deleted) {
			return NextResponse.json(
				{ error: 'Integration not found' },
				{ status: 404 },
			)
		}

		return NextResponse.json({
			message: 'Integration disconnected successfully',
		})
	} catch (error) {
		return handleApiError(error)
	}
}
