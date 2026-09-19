import { handleApiError } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { SharedSecret } from '@/models/SharedSecret'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
	params: Promise<{ shareId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
	try {
		const { shareId } = await params
		let passphrase = ''

		try {
			const body = await request.json()
			if (body && typeof body.passphrase === 'string') {
				passphrase = body.passphrase.trim()
			}
		} catch {
			// Optional empty body
		}

		await connectDB()

		const secret = await SharedSecret.findOne({ shareId })

		if (!secret) {
			return NextResponse.json(
				{ error: 'This secret has expired or was already burned.' },
				{ status: 404 },
			)
		}

		// Verify TTL
		if (new Date() > new Date(secret.expiresAt)) {
			await SharedSecret.deleteOne({ _id: secret._id })
			return NextResponse.json(
				{ error: 'This secret has expired.' },
				{ status: 404 },
			)
		}

		// Verify passphrase if protected
		if (secret.passphraseHash) {
			if (!passphrase) {
				return NextResponse.json(
					{ error: 'Passphrase required to unlock this secret.' },
					{ status: 401 },
				)
			}
			const match = await bcrypt.compare(passphrase, secret.passphraseHash)
			if (!match) {
				return NextResponse.json(
					{ error: 'Incorrect passphrase. Please try again.' },
					{ status: 401 },
				)
			}
		}

		const newCurrentViews = secret.currentViews + 1
		const encryptedContent = secret.encryptedContent
		const remainingViews = Math.max(0, secret.maxViews - newCurrentViews)

		if (newCurrentViews >= secret.maxViews) {
			// Burn immediately: permanent deletion from database
			await SharedSecret.deleteOne({ _id: secret._id })
		} else {
			// Update current views count
			secret.currentViews = newCurrentViews
			await secret.save()
		}

		return NextResponse.json({
			success: true,
			encryptedContent,
			burned: newCurrentViews >= secret.maxViews,
			remainingViews,
		})
	} catch (error) {
		return handleApiError(error)
	}
}
