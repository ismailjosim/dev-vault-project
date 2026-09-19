import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { Project } from '@/models/Project'
import { Workspace } from '@/models/Workspace'
import { WorkspaceMember } from '@/models/WorkspaceMember'
import { workspaceUpdateSchema } from '@/types/workspace'
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

		const workspace = await Workspace.findById(id)
		if (!workspace) {
			return NextResponse.json(
				{ error: 'Workspace not found' },
				{ status: 404 },
			)
		}

		const isOwner = workspace.ownerId === userId
		const member = await WorkspaceMember.findOne({ workspaceId: id, userId })

		if (!isOwner && !member) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		return NextResponse.json({
			workspace: {
				...serializeDocument<Record<string, unknown>>(workspace),
				role: isOwner ? 'owner' : member?.role,
				allowedEnvironments: isOwner
					? ['dev', 'staging', 'prod', 'test']
					: member?.allowedEnvironments,
				canRevealSecrets: isOwner ? true : !!member?.canRevealSecrets,
				canExportSecrets: isOwner ? true : !!member?.canExportSecrets,
			},
		})
	} catch (error) {
		return handleApiError(error)
	}
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const { id } = await params
		await connectDB()

		const workspace = await Workspace.findById(id)
		if (!workspace) {
			return NextResponse.json(
				{ error: 'Workspace not found' },
				{ status: 404 },
			)
		}

		const isOwner = workspace.ownerId === userId
		const member = await WorkspaceMember.findOne({ workspaceId: id, userId })
		const isAdmin = member?.role === 'admin'

		if (!isOwner && !isAdmin) {
			return NextResponse.json(
				{ error: 'Only owners and admins can modify workspace settings' },
				{ status: 403 },
			)
		}

		const input = workspaceUpdateSchema.parse(await request.json())

		if (input.name) workspace.name = input.name
		if (input.description !== undefined)
			workspace.description = input.description
		await workspace.save()

		return NextResponse.json({ workspace: serializeDocument(workspace) })
	} catch (error) {
		return handleApiError(error)
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		const { id } = await params
		await connectDB()

		const workspace = await Workspace.findById(id)
		if (!workspace) {
			return NextResponse.json(
				{ error: 'Workspace not found' },
				{ status: 404 },
			)
		}

		if (workspace.ownerId !== userId) {
			return NextResponse.json(
				{ error: 'Only the workspace owner can delete this workspace' },
				{ status: 403 },
			)
		}

		// Delete members and unlink projects
		await Promise.all([
			WorkspaceMember.deleteMany({ workspaceId: id }),
			Project.updateMany({ workspaceId: id }, { $set: { workspaceId: null } }),
			Workspace.findByIdAndDelete(id),
		])

		return NextResponse.json({ message: 'Workspace deleted successfully' })
	} catch (error) {
		return handleApiError(error)
	}
}
