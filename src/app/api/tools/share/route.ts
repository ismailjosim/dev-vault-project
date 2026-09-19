import { handleApiError } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { SharedSecret } from '@/models/SharedSecret'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createShareSchema = z.object({
	encryptedContent: z.string().min(1, 'Encrypted content is required'),
	maxViews: z.number().int().min(1).max(20).default(1),
	ttlSeconds: z.number().int().min(60).max(604800).default(3600), // between 1 min and 7 days
	passphrase: z.string().optional(),
})

export async function POST(request: NextRequest) {
	try {
		const json = await request.json()
		const parsed = createShareSchema.parse(json)

		await connectDB()

		// Generate random unique shareId (e.g. sec_7a9f8b1c4e2d3f6a)
		const randomToken = crypto.randomBytes(12).toString('hex')
		const shareId = `sec_${randomToken}`

		let passphraseHash: string | null = null
		if (parsed.passphrase && parsed.passphrase.trim().length > 0) {
			passphraseHash = await bcrypt.hash(parsed.passphrase.trim(), 10)
		}

		const expiresAt = new Date(Date.now() + parsed.ttlSeconds * 1000)

		const sharedDoc = await SharedSecret.create({
			shareId,
			encryptedContent: parsed.encryptedContent,
			passphraseHash,
			maxViews: parsed.maxViews,
			currentViews: 0,
			expiresAt,
		})

		return NextResponse.json(
			{
				success: true,
				shareId: sharedDoc.shareId,
				expiresAt: sharedDoc.expiresAt.toISOString(),
				maxViews: sharedDoc.maxViews,
			},
			{ status: 201 },
		)
	} catch (error) {
		return handleApiError(error)
	}
}
