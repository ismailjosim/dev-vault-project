import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Workspace } from '@/models/Workspace'
import { WorkspaceMember } from '@/models/WorkspaceMember'
import { workspaceCreateSchema } from '@/types/workspace'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		await connectDB()

		// Get all workspace IDs the user belongs to
		const memberships = await WorkspaceMember.find({ userId })
		const workspaceIds = memberships.map((m) => m.workspaceId)

		// Also get workspaces owned by user directly
		const workspaces = await Workspace.find({
			$or: [{ ownerId: userId }, { _id: { $in: workspaceIds } }],
		}).sort({ createdAt: -1 })

		const membershipMap = new Map(
			memberships.map((m) => [m.workspaceId.toString(), m]),
		)

		const workspacesWithRoles = workspaces.map((ws) => {
			const serialized = serializeDocument<Record<string, unknown>>(ws)
			const isOwner = ws.ownerId === userId
			const member = membershipMap.get(ws._id.toString())
			return {
				...serialized,
				role: isOwner ? 'owner' : member?.role || 'viewer',
				allowedEnvironments: isOwner
					? ['dev', 'staging', 'prod', 'test']
					: member?.allowedEnvironments || ['dev'],
				canRevealSecrets: isOwner ? true : !!member?.canRevealSecrets,
				canExportSecrets: isOwner ? true : !!member?.canExportSecrets,
			}
		})

		return NextResponse.json({ workspaces: workspacesWithRoles })
	} catch (error) {
		return handleApiError(error)
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const user = await getCurrentUser()
		const userEmail = user?.email || 'user@example.com'

		await connectDB()

		const input = workspaceCreateSchema.parse(await request.json())

		// Ensure slug uniqueness
		const existing = await Workspace.findOne({ slug: input.slug })
		if (existing) {
			return NextResponse.json(
				{ error: 'A workspace with this identifier slug already exists' },
				{ status: 409 },
			)
		}

		const workspace = await Workspace.create({
			name: input.name,
			slug: input.slug,
			description: input.description || '',
			ownerId: userId,
		})

		// Add owner membership record
		await WorkspaceMember.create({
			workspaceId: workspace._id,
			userId,
			email: userEmail,
			role: 'owner',
			allowedEnvironments: ['dev', 'staging', 'prod', 'test'],
			canRevealSecrets: true,
			canExportSecrets: true,
		})

		return NextResponse.json(
			{
				workspace: {
					...serializeDocument<Record<string, unknown>>(workspace),
					role: 'owner',
				},
			},
			{ status: 201 },
		)
	} catch (error) {
		return handleApiError(error)
	}
}
