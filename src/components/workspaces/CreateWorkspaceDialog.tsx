'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface WorkspaceRecord {
	_id: string
	name: string
	slug: string
	role?: string
}

interface CreateWorkspaceDialogProps {
	onCreated?: (workspace: WorkspaceRecord) => void
	trigger?: React.ReactNode
}

export function CreateWorkspaceDialog({
	onCreated,
	trigger,
}: CreateWorkspaceDialogProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [name, setName] = useState('')
	const [slug, setSlug] = useState('')
	const [description, setDescription] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setName(val)
		setSlug(
			val
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, ''),
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		try {
			const res = await fetch('/api/workspaces', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, slug, description }),
			})

			const data = await res.json()
			if (!res.ok) {
				throw new Error(data.error || 'Failed to create workspace')
			}

			setIsOpen(false)
			setName('')
			setSlug('')
			setDescription('')
			if (onCreated) onCreated(data.workspace)
			router.refresh()
		} catch (err: unknown) {
			setError((err as Error).message || 'Something went wrong')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<>
			{trigger ? (
				<div onClick={() => setIsOpen(true)}>{trigger}</div>
			) : (
				<button
					type='button'
					onClick={() => setIsOpen(true)}
					className='bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition hover:opacity-90'
				>
					<Plus className='h-3.5 w-3.5' />
					New Workspace
				</button>
			)}

			{isOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
					<div className='border-border bg-card animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border p-6 shadow-2xl'>
						<div className='flex items-center justify-between'>
							<h3 className='text-foreground text-lg font-semibold'>
								Create Team Workspace
							</h3>
							<button
								type='button'
								onClick={() => setIsOpen(false)}
								className='text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1'
							>
								<X className='h-4 w-4' />
							</button>
						</div>

						<p className='text-muted-foreground mt-1 text-sm'>
							Collaborate with teammates, assign RBAC roles, and govern
							environment secrets safely.
						</p>

						{error && (
							<div className='border-destructive/20 bg-destructive/10 text-destructive mt-4 rounded-md border p-3 text-xs'>
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className='mt-4 space-y-4'>
							<div>
								<label className='text-foreground block text-xs font-medium'>
									Workspace Name
								</label>
								<input
									type='text'
									required
									value={name}
									onChange={handleNameChange}
									placeholder='Acme Engineering'
									className='border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none'
								/>
							</div>

							<div>
								<label className='text-foreground block text-xs font-medium'>
									Workspace Slug (Unique URL prefix)
								</label>
								<input
									type='text'
									required
									value={slug}
									onChange={(e) => setSlug(e.target.value)}
									placeholder='acme-engineering'
									className='border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none'
								/>
							</div>

							<div>
								<label className='text-foreground block text-xs font-medium'>
									Description (Optional)
								</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={2}
									placeholder='Core organization vault for Acme corp'
									className='border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none'
								/>
							</div>

							<div className='flex items-center justify-end gap-2 pt-2'>
								<button
									type='button'
									onClick={() => setIsOpen(false)}
									className='border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-md border px-3 py-2 text-sm font-medium'
								>
									Cancel
								</button>
								<button
									type='submit'
									disabled={isLoading || !name || !slug}
									className='bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50'
								>
									{isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
									Create Workspace
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
