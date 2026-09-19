import { handleApiError, requireUserId } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { ApiKey } from '@/models/ApiKey'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const { id } = await params
		await connectDB()

		const deleted = await ApiKey.findOneAndDelete({ _id: id, userId })
		if (!deleted) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 })
		}

		return NextResponse.json({ message: 'API key revoked successfully' })
	} catch (error) {
		return handleApiError(error)
	}
}
