'use client'

import { useState } from 'react'
import { UserPlus, Shield, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Member {
	_id: string
	email: string
	role: 'owner' | 'admin' | 'developer' | 'viewer'
	allowedEnvironments: string[]
	canRevealSecrets: boolean
	canExportSecrets: boolean
	createdAt: string
}

interface MembersManagementProps {
	workspaceId: string
	initialMembers: Member[]
	currentUserRole: string
}

export function MembersManagement({
	workspaceId,
	initialMembers,
	currentUserRole,
}: MembersManagementProps) {
	const [members, setMembers] = useState<Member[]>(initialMembers)
	const [isInviteOpen, setIsInviteOpen] = useState(false)
	const [email, setEmail] = useState('')
	const [role, setRole] = useState<'admin' | 'developer' | 'viewer'>(
		'developer',
	)
	const [allowedEnvs, setAllowedEnvs] = useState<string[]>([
		'dev',
		'staging',
		'test',
	])
	const [canReveal, setCanReveal] = useState(false)
	const [canExport, setCanExport] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const isOwnerOrAdmin =
		currentUserRole === 'owner' || currentUserRole === 'admin'

	const handleInvite = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		try {
			const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					role,
					allowedEnvironments: allowedEnvs,
					canRevealSecrets: canReveal,
					canExportSecrets: canExport,
				}),
			})

			const data = await res.json()
			if (!res.ok) {
				throw new Error(data.error || 'Failed to invite member')
			}

			setMembers((prev) => [...prev, data.member])
			setIsInviteOpen(false)
			setEmail('')
			setRole('developer')
			setAllowedEnvs(['dev', 'staging', 'test'])
			setCanReveal(false)
			setCanExport(false)
			router.refresh()
		} catch (err: unknown) {
			setError((err as Error).message || 'Error adding member')
		} finally {
			setIsLoading(false)
		}
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

	const toggleEnv = (env: string) => {
		setAllowedEnvs((prev) =>
			prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env],
		)
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
						className='bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90'
					>
						<UserPlus className='h-4 w-4' />
						Invite Member
					</button>
				)}
			</div>

			{/* Invite Modal */}
			{isInviteOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
					<div className='border-border bg-card w-full max-w-md rounded-xl border p-6 shadow-2xl'>
						<h3 className='text-foreground text-lg font-semibold'>
							Invite Team Collaborator
						</h3>
						<p className='text-muted-foreground mt-1 text-xs'>
							Assign an RBAC role and set environment-level guardrails.
						</p>

						{error && (
							<div className='border-destructive/20 bg-destructive/10 text-destructive mt-3 flex items-center gap-2 rounded-md border p-2.5 text-xs'>
								<AlertCircle className='h-4 w-4 shrink-0' />
								<span>{error}</span>
							</div>
						)}

						<form onSubmit={handleInvite} className='mt-4 space-y-4'>
							<div>
								<label className='text-foreground block text-xs font-medium'>
									Email Address
								</label>
								<input
									type='email'
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder='engineer@company.com'
									className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
								/>
							</div>

							<div>
								<label className='text-foreground block text-xs font-medium'>
									Role
								</label>
								<select
									value={role}
									onChange={(e) =>
										setRole(e.target.value as 'admin' | 'developer' | 'viewer')
									}
									className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
								>
									<option value='admin'>
										Admin (Full project and member rights)
									</option>
									<option value='developer'>
										Developer (View & edit authorized envs)
									</option>
									<option value='viewer'>
										Viewer (Read-only on allowed envs)
									</option>
								</select>
							</div>

							<div>
								<label className='text-foreground mb-1.5 block text-xs font-medium'>
									Allowed Environments
								</label>
								<div className='grid grid-cols-2 gap-2'>
									{['dev', 'staging', 'test', 'prod'].map((env) => (
										<label
											key={env}
											className='border-border bg-background/50 text-foreground hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md border p-2 text-xs font-medium'
										>
											<input
												type='checkbox'
												checked={allowedEnvs.includes(env)}
												onChange={() => toggleEnv(env)}
												className='border-border text-primary focus:ring-primary rounded'
											/>
											<span className='capitalize'>{env}</span>
											{env === 'prod' && (
												<span className='ml-auto rounded bg-amber-500/10 px-1 py-0.5 text-[9px] font-semibold text-amber-500'>
													Gated
												</span>
											)}
										</label>
									))}
								</div>
							</div>

							<div className='border-border space-y-2 border-t pt-1'>
								<label className='text-foreground flex cursor-pointer items-center gap-2 text-xs font-medium'>
									<input
										type='checkbox'
										checked={canReveal}
										onChange={(e) => setCanReveal(e.target.checked)}
										className='border-border text-primary rounded'
									/>
									Can Reveal Plaintext Secrets
								</label>
								<label className='text-foreground flex cursor-pointer items-center gap-2 text-xs font-medium'>
									<input
										type='checkbox'
										checked={canExport}
										onChange={(e) => setCanExport(e.target.checked)}
										className='border-border text-primary rounded'
									/>
									Can Export / Download .env Files
								</label>
							</div>

							<div className='flex items-center justify-end gap-2 pt-3'>
								<button
									type='button'
									onClick={() => setIsInviteOpen(false)}
									className='border-border text-muted-foreground hover:bg-muted rounded-md border px-3 py-2 text-xs font-medium'
								>
									Cancel
								</button>
								<button
									type='submit'
									disabled={isLoading || !email}
									className='bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50'
								>
									{isLoading && (
										<Loader2 className='h-3.5 w-3.5 animate-spin' />
									)}
									Send Invite
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Members Table */}
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
										className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium capitalize ${
											member.role === 'owner'
												? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
												: member.role === 'admin'
													? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
													: member.role === 'developer'
														? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
														: 'bg-muted text-muted-foreground'
										}`}
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
												onClick={() => handleRemove(member._id)}
												title='Remove Member'
												className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1'
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
		</div>
	)
}
