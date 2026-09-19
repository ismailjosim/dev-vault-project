import { handleApiError, requireUserId } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { syncIntegration } from '@/services/sync-engine'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
	params: Promise<{ id: string; integrationId: string }>
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const { id, integrationId } = await params
		await connectDB()

		const project = await Project.findOne({ _id: id, userId })
		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const result = await syncIntegration(integrationId)

		return NextResponse.json({ result })
	} catch (error) {
		return handleApiError(error)
	}
}
