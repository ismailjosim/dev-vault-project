'use client'

import { Shield, Trash2 } from 'lucide-react'
import type { MembersTableProps, WorkspaceRole } from '@/types/workspace'

function getRoleBadgeClass(role: WorkspaceRole): string {
	switch (role) {
		case 'owner':
			return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
		case 'admin':
			return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
		case 'developer':
			return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
		case 'viewer':
		default:
			return 'bg-muted text-muted-foreground'
	}
}

export function MembersTable({
	members,
	isOwnerOrAdmin,
	onRemoveMember,
}: MembersTableProps) {
	if (members.length === 0) {
		return (
			<div className='border-border bg-card rounded-xl border p-8 text-center shadow-sm'>
				<p className='text-muted-foreground text-sm'>
					No team members in this workspace yet.
				</p>
			</div>
		)
	}

	return (
		<div className='border-border bg-card overflow-hidden rounded-xl border shadow-sm'>
			<table className='w-full text-left text-sm'>
				<thead className='border-border bg-muted/40 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase'>
					<tr>
						<th className='px-4 py-3'>Member</th>
						<th className='px-4 py-3'>Role</th>
						<th className='px-4 py-3'>Allowed Envs</th>
						<th className='px-4 py-3'>Capabilities</th>
						{isOwnerOrAdmin && (
							<th className='px-4 py-3 text-right'>Actions</th>
						)}
					</tr>
				</thead>
				<tbody className='divide-border divide-y'>
					{members.map((member) => (
						<tr key={member._id} className='hover:bg-muted/30 transition'>
							<td className='text-foreground px-4 py-3 font-medium'>
								{member.email}
							</td>
							<td className='px-4 py-3'>
								<span
									className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium capitalize ${getRoleBadgeClass(
										member.role,
									)}`}
								>
									<Shield className='h-3 w-3' />
									{member.role}
								</span>
							</td>
							<td className='px-4 py-3'>
								<div className='flex flex-wrap gap-1'>
									{member.allowedEnvironments?.map((env) => (
										<span
											key={env}
											className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[11px]'
										>
											{env}
										</span>
									))}
								</div>
							</td>
							<td className='text-muted-foreground px-4 py-3 text-xs'>
								<div className='flex items-center gap-3'>
									<span
										className={
											member.canRevealSecrets
												? 'font-medium text-emerald-500'
												: 'text-muted-foreground/60'
										}
									>
										{member.canRevealSecrets ? '✓ Reveal' : '✕ Reveal'}
									</span>
									<span
										className={
											member.canExportSecrets
												? 'font-medium text-emerald-500'
												: 'text-muted-foreground/60'
										}
									>
										{member.canExportSecrets ? '✓ Export' : '✕ Export'}
									</span>
								</div>
							</td>
							{isOwnerOrAdmin && (
								<td className='px-4 py-3 text-right'>
									{member.role !== 'owner' && (
										<button
											type='button'
											onClick={() => onRemoveMember(member._id)}
											title='Remove Member'
											className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1 transition'
										>
											<Trash2 className='h-4 w-4' />
										</button>
									)}
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
