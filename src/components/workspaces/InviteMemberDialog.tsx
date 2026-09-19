'use client'

import { useState } from 'react'
import { AlertCircle, Loader2, X } from 'lucide-react'
import type { InviteMemberDialogProps } from '@/types/workspace'

const AVAILABLE_ENVIRONMENTS = ['dev', 'staging', 'test', 'prod'] as const

export function InviteMemberDialog({
	workspaceId,
	isOpen,
	onClose,
	onMemberInvited,
}: InviteMemberDialogProps) {
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

	if (!isOpen) return null

	const resetForm = () => {
		setEmail('')
		setRole('developer')
		setAllowedEnvs(['dev', 'staging', 'test'])
		setCanReveal(false)
		setCanExport(false)
		setError(null)
	}

	const handleClose = () => {
		resetForm()
		onClose()
	}

	const toggleEnv = (env: string) => {
		setAllowedEnvs((prev) =>
			prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env],
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
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

			onMemberInvited(data.member)
			handleClose()
		} catch (err: unknown) {
			setError((err as Error).message || 'Error adding member')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
			<div className='border-border bg-card animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border p-6 shadow-2xl'>
				<div className='flex items-center justify-between'>
					<div>
						<h3 className='text-foreground text-lg font-semibold'>
							Invite Team Collaborator
						</h3>
						<p className='text-muted-foreground mt-0.5 text-xs'>
							Assign an RBAC role and set environment-level guardrails.
						</p>
					</div>
					<button
						type='button'
						onClick={handleClose}
						className='text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1 transition'
					>
						<X className='h-4 w-4' />
					</button>
				</div>

				{error && (
					<div className='border-destructive/20 bg-destructive/10 text-destructive mt-3 flex items-center gap-2 rounded-md border p-2.5 text-xs'>
						<AlertCircle className='h-4 w-4 shrink-0' />
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={handleSubmit} className='mt-4 space-y-4'>
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
							<option value='viewer'>Viewer (Read-only on allowed envs)</option>
						</select>
					</div>

					<div>
						<label className='text-foreground mb-1.5 block text-xs font-medium'>
							Allowed Environments
						</label>
						<div className='grid grid-cols-2 gap-2'>
							{AVAILABLE_ENVIRONMENTS.map((env) => (
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

					<div className='border-border space-y-2 border-t pt-2'>
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
							onClick={handleClose}
							className='border-border text-muted-foreground hover:bg-muted rounded-md border px-3 py-2 text-xs font-medium transition'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isLoading || !email}
							className='bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition hover:opacity-90 disabled:opacity-50'
						>
							{isLoading && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
							Send Invite
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
