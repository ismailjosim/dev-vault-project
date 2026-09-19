'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type {
	MembersManagementProps,
	WorkspaceMemberItem,
} from '@/types/workspace'
import { InviteMemberDialog } from './InviteMemberDialog'
import { MembersTable } from './MembersTable'

export function MembersManagement({
	workspaceId,
	initialMembers,
	currentUserRole,
}: MembersManagementProps) {
	const [members, setMembers] =
		useState<WorkspaceMemberItem[]>(initialMembers)
	const [isInviteOpen, setIsInviteOpen] = useState(false)
	const router = useRouter()

	const isOwnerOrAdmin =
		currentUserRole === 'owner' || currentUserRole === 'admin'

	const handleMemberInvited = (newMember: WorkspaceMemberItem) => {
		setMembers((prev) => [...prev, newMember])
		router.refresh()
	}

	const handleRemove = async (memberId: string) => {
		if (!confirm('Are you sure you want to remove this member?')) return

		try {
			const res = await fetch(
				`/api/workspaces/${workspaceId}/members?memberId=${memberId}`,
				{ method: 'DELETE' },
			)
			if (res.ok) {
				setMembers((prev) => prev.filter((m) => m._id !== memberId))
				router.refresh()
			}
		} catch (err) {
			console.error('Failed to remove member', err)
		}
	}

	return (
		<div className='space-y-6'>
			<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
				<div>
					<h2 className='text-foreground text-lg font-semibold'>
						Workspace Members & Permissions
					</h2>
					<p className='text-muted-foreground text-sm'>
						Govern collaborator access, environment visibility, and secret
						reveal rights.
					</p>
				</div>
				{isOwnerOrAdmin && (
					<button
						type='button'
						onClick={() => setIsInviteOpen(true)}
						className='bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 transition'
					>
						<UserPlus className='h-4 w-4' />
						Invite Member
					</button>
				)}
			</div>

			<InviteMemberDialog
				workspaceId={workspaceId}
				isOpen={isInviteOpen}
				onClose={() => setIsInviteOpen(false)}
				onMemberInvited={handleMemberInvited}
			/>

			<MembersTable
				members={members}
				isOwnerOrAdmin={isOwnerOrAdmin}
				onRemoveMember={handleRemove}
			/>
		</div>
	)
}

// Re-export type for backwards compatibility
export type { WorkspaceMemberItem as Member } from '@/types/workspace'
