import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { ApiKey } from '@/models/ApiKey'
import { apiKeyCreateSchema } from '@/types/api-key'
import { hashValue } from '@/utils/encryption'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		await connectDB()

		const keys = await ApiKey.find({ userId })
			.select('-hashedKey')
			.sort({ createdAt: -1 })

		return NextResponse.json({ apiKeys: serializeDocument(keys) })
	} catch (error) {
		return handleApiError(error)
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		await connectDB()

		const input = apiKeyCreateSchema.parse(await request.json())

		// Generate random token: dv_live_ followed by 32 random hex chars
		const randomPart = crypto.randomBytes(20).toString('hex')
		const rawToken = `dv_live_${randomPart}`
		const keyPrefix = rawToken.slice(0, 14) + '...'
		const hashedKey = hashValue(rawToken)

		let expiresAt: Date | undefined
		if (input.expiresInDays) {
			expiresAt = new Date()
			expiresAt.setDate(expiresAt.getDate() + input.expiresInDays)
		}

		const apiKey = await ApiKey.create({
			userId,
			name: input.name,
			keyPrefix,
			hashedKey,
			expiresAt,
		})

		const serialized = serializeDocument<Record<string, unknown>>(apiKey)
		delete serialized.hashedKey

		return NextResponse.json(
			{
				apiKey: serialized,
				token: rawToken,
			},
			{ status: 201 },
		)
	} catch (error) {
		return handleApiError(error)
	}
}
