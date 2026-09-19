import { handleApiError } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { SharedSecret } from '@/models/SharedSecret'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
	params: Promise<{ shareId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { shareId } = await params

		await connectDB()

		const secret = await SharedSecret.findOne({ shareId })

		if (!secret) {
			return NextResponse.json(
				{
					exists: false,
					error: 'This secret has expired or was already burned.',
				},
				{ status: 404 },
			)
		}

		// Check if expired
		if (new Date() > new Date(secret.expiresAt)) {
			await SharedSecret.deleteOne({ _id: secret._id })
			return NextResponse.json(
				{ exists: false, error: 'This secret has expired.' },
				{ status: 404 },
			)
		}

		return NextResponse.json({
			exists: true,
			shareId: secret.shareId,
			requiresPassphrase: Boolean(secret.passphraseHash),
			maxViews: secret.maxViews,
			currentViews: secret.currentViews,
			expiresAt: secret.expiresAt.toISOString(),
			createdAt: secret.createdAt.toISOString(),
		})
	} catch (error) {
		return handleApiError(error)
	}
}
