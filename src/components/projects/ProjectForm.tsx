'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export interface ProjectFormProps {
	defaultWorkspaceId?: string
	workspaces?: { _id: string; name: string }[]
}

export function ProjectForm({
	defaultWorkspaceId,
	workspaces = [],
}: ProjectFormProps) {
	const router = useRouter()
	const [selectedWorkspace, setSelectedWorkspace] = useState<string>(
		defaultWorkspaceId || 'personal',
	)
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setIsSubmitting(true)
		setError(null)

		const form = new FormData(event.currentTarget)
		const workspaceVal = form.get('workspaceId') as string
		const response = await fetch('/api/projects', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				projectName: form.get('projectName'),
				description: form.get('description'),
				category: form.get('category'),
				framework: form.get('framework'),
				workspaceId:
					workspaceVal && workspaceVal !== 'personal' ? workspaceVal : null,
				tags: String(form.get('tags') || '')
					.split(',')
					.map((tag) => tag.trim())
					.filter(Boolean),
			}),
		})

		setIsSubmitting(false)

		if (!response.ok) {
			const payload = (await response.json()) as { message?: string }
			setError(payload.message || 'Could not create project')
			return
		}

		const payload = (await response.json()) as { project: { _id: string } }
		router.push(`/dashboard/projects/${payload.project._id}`)
		router.refresh()
	}

	return (
		<form onSubmit={onSubmit} className='max-w-2xl space-y-5'>
			{error && (
				<div className='border-danger/30 bg-danger-foreground text-danger rounded border px-4 py-3 text-sm'>
					{error}
				</div>
			)}

			<div>
				<label className='text-foreground block text-sm font-medium'>
					Project Name
				</label>
				<input
					name='projectName'
					required
					className='border-border bg-card text-foreground focus:border-muted-foreground mt-1 w-full rounded-md border px-3 py-2 outline-none'
					placeholder='e.g. Payment Gateway API'
				/>
			</div>

			{workspaces.length > 0 && (
				<div>
					<label className='text-foreground block text-sm font-medium'>
						Workspace / Scope
					</label>
					<select
						name='workspaceId'
						value={selectedWorkspace}
						onChange={(e) => setSelectedWorkspace(e.target.value)}
						className='border-border bg-card text-foreground focus:border-muted-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none'
					>
						<option value='personal'>Personal Workspace (Private)</option>
						{workspaces.map((ws) => (
							<option key={ws._id} value={ws._id}>
								{ws.name} (Team Workspace)
							</option>
						))}
					</select>
				</div>
			)}

			<div>
				<label className='text-foreground block text-sm font-medium'>
					Description
				</label>
				<textarea
					name='description'
					rows={3}
					className='border-border bg-card text-foreground focus:border-muted-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none'
					placeholder='What is this project used for?'
				/>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<div>
					<label className='text-foreground block text-sm font-medium'>
						Category
					</label>
					<select
						name='category'
						className='border-border bg-card text-foreground focus:border-muted-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none'
					>
						<option>Full Stack</option>
						<option>Frontend</option>
						<option>Backend</option>
						<option>Mobile</option>
						<option>Other</option>
					</select>
				</div>

				<div>
					<label className='text-foreground block text-sm font-medium'>
						Framework
					</label>
					<input
						name='framework'
						defaultValue='Next.js'
						className='border-border bg-card text-foreground focus:border-muted-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none'
					/>
				</div>
			</div>

			<div>
				<label className='text-foreground block text-sm font-medium'>
					Tags (comma separated)
				</label>
				<input
					name='tags'
					className='border-border bg-card text-foreground focus:border-muted-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none'
					placeholder='auth, payments, production'
				/>
			</div>

			<button
				type='submit'
				disabled={isSubmitting}
				className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60'
			>
				{isSubmitting ? 'Creating...' : 'Create project'}
			</button>
		</form>
	)
}
