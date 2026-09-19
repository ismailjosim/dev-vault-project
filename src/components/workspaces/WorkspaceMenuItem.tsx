'use client'

import { Building2, Check, Users } from 'lucide-react'
import Link from 'next/link'
import type { WorkspaceMenuItemProps } from '@/types/workspace'

export function WorkspaceMenuItem({
	workspace,
	isActive,
	onSelect,
	onManageTeam,
}: WorkspaceMenuItemProps) {
	return (
		<div className='group text-foreground hover:bg-muted/70 flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition'>
			<button
				type='button'
				onClick={() => onSelect(workspace._id)}
				className='flex flex-1 items-center gap-2 truncate text-left'
			>
				<Building2 className='h-3.5 w-3.5 shrink-0 text-indigo-500' />
				<span className='truncate'>{workspace.name}</span>
				{workspace.role && (
					<span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] capitalize'>
						{workspace.role}
					</span>
				)}
			</button>
			<div className='flex items-center gap-1 opacity-80 group-hover:opacity-100'>
				{isActive && <Check className='text-primary mr-1 h-3.5 w-3.5' />}
				<Link
					href={`/dashboard/workspaces/${workspace._id}/members`}
					onClick={onManageTeam}
					title='Manage Workspace Team'
					className='hover:bg-background text-muted-foreground hover:text-foreground rounded p-1 transition'
				>
					<Users className='h-3.5 w-3.5' />
				</Link>
			</div>
		</div>
	)
}
