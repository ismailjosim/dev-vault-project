import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { Workspace } from '@/models/Workspace'
import { WorkspaceMember } from '@/models/WorkspaceMember'
import {
	workspaceMemberAddSchema,
	workspaceMemberUpdateSchema,
} from '@/types/workspace'
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

		// Ensure user is member or owner
		const isOwner = workspace.ownerId === userId
		const isMember = await WorkspaceMember.exists({ workspaceId: id, userId })
		if (!isOwner && !isMember) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		const members = await WorkspaceMember.find({ workspaceId: id }).sort({
			createdAt: 1,
		})

		return NextResponse.json({ members: serializeDocument(members) })
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

		const workspace = await Workspace.findById(id)
		if (!workspace) {
			return NextResponse.json(
				{ error: 'Workspace not found' },
				{ status: 404 },
			)
		}

		// Check permission: owner or admin
		const isOwner = workspace.ownerId === userId
		const requester = await WorkspaceMember.findOne({
			workspaceId: id,
			userId,
		})
		if (!isOwner && requester?.role !== 'admin') {
			return NextResponse.json(
				{ error: 'Only owners and admins can invite members' },
				{ status: 403 },
			)
		}

		const input = workspaceMemberAddSchema.parse(await request.json())

		// Check if already a member
		const existing = await WorkspaceMember.findOne({
			workspaceId: id,
			email: input.email.toLowerCase(),
		})
		if (existing) {
			return NextResponse.json(
				{ error: 'This user is already a member of this workspace' },
				{ status: 409 },
			)
		}

		// Create member record. If userId matches or placeholder until they join
		const newMember = await WorkspaceMember.create({
			workspaceId: id,
			userId: `invited_${Date.now()}`,
			email: input.email.toLowerCase(),
			role: input.role,
			allowedEnvironments: input.allowedEnvironments,
			canRevealSecrets: input.canRevealSecrets,
			canExportSecrets: input.canExportSecrets,
		})

		return NextResponse.json(
			{ member: serializeDocument(newMember) },
			{ status: 201 },
		)
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
		const requester = await WorkspaceMember.findOne({
			workspaceId: id,
			userId,
		})
		if (!isOwner && requester?.role !== 'admin') {
			return NextResponse.json(
				{ error: 'Only owners and admins can update member permissions' },
				{ status: 403 },
			)
		}

		const body = await request.json()
		const memberId = body.memberId
		if (!memberId) {
			return NextResponse.json(
				{ error: 'memberId is required' },
				{ status: 400 },
			)
		}

		const member = await WorkspaceMember.findOne({
			_id: memberId,
			workspaceId: id,
		})
		if (!member) {
			return NextResponse.json({ error: 'Member not found' }, { status: 404 })
		}

		if (member.role === 'owner' && !isOwner) {
			return NextResponse.json(
				{ error: 'Cannot modify the workspace owner' },
				{ status: 403 },
			)
		}

		const updates = workspaceMemberUpdateSchema.parse(body)
		if (updates.role) member.role = updates.role
		if (updates.allowedEnvironments)
			member.allowedEnvironments = updates.allowedEnvironments
		if (updates.canRevealSecrets !== undefined)
			member.canRevealSecrets = updates.canRevealSecrets
		if (updates.canExportSecrets !== undefined)
			member.canExportSecrets = updates.canExportSecrets

		await member.save()

		return NextResponse.json({ member: serializeDocument(member) })
	} catch (error) {
		return handleApiError(error)
	}
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
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
		const requester = await WorkspaceMember.findOne({
			workspaceId: id,
			userId,
		})
		if (!isOwner && requester?.role !== 'admin') {
			return NextResponse.json(
				{ error: 'Only owners and admins can remove members' },
				{ status: 403 },
			)
		}

		const url = new URL(request.url)
		const memberId = url.searchParams.get('memberId')
		if (!memberId) {
			return NextResponse.json(
				{ error: 'memberId query parameter is required' },
				{ status: 400 },
			)
		}

		const member = await WorkspaceMember.findOne({
			_id: memberId,
			workspaceId: id,
		})
		if (!member) {
			return NextResponse.json({ error: 'Member not found' }, { status: 404 })
		}

		if (member.role === 'owner') {
			return NextResponse.json(
				{ error: 'Cannot remove the workspace owner' },
				{ status: 400 },
			)
		}

		await WorkspaceMember.findByIdAndDelete(memberId)

		return NextResponse.json({ message: 'Member removed successfully' })
	} catch (error) {
		return handleApiError(error)
	}
}
