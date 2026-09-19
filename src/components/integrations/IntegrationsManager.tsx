'use client'

import { useState } from 'react'
import {
	Globe,
	Webhook,
	Plus,
	RefreshCw,
	Trash2,
	CheckCircle2,
	XCircle,
	Clock,
	Loader2,
	AlertCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

function GithubIcon({ className = 'h-4 w-4' }: { className?: string }) {
	return (
		<svg className={className} fill='currentColor' viewBox='0 0 24 24'>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
			/>
		</svg>
	)
}

export interface IntegrationItem {
	_id: string
	provider: 'vercel' | 'github' | 'webhook'
	name: string
	targetIdentifier: string
	environmentMapping: { sourceEnv: string; targetEnv: string }[]
	isActive: boolean
	lastSyncAt?: string
	lastSyncStatus?: 'success' | 'failed'
	lastSyncError?: string
	createdAt: string
}

interface IntegrationsManagerProps {
	projectId: string
	initialIntegrations: IntegrationItem[]
}

export function IntegrationsManager({
	projectId,
	initialIntegrations,
}: IntegrationsManagerProps) {
	const [integrations, setIntegrations] =
		useState<IntegrationItem[]>(initialIntegrations)
	const [isOpen, setIsOpen] = useState(false)
	const [provider, setProvider] = useState<'vercel' | 'github' | 'webhook'>(
		'vercel',
	)
	const [name, setName] = useState('')
	const [targetIdentifier, setTargetIdentifier] = useState('')
	const [authToken, setAuthToken] = useState('')
	const [syncingId, setSyncingId] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null)
	const router = useRouter()

	const handleOpen = (selectedProvider: 'vercel' | 'github' | 'webhook') => {
		setProvider(selectedProvider)
		setName(
			selectedProvider === 'vercel'
				? 'Vercel Production Sync'
				: selectedProvider === 'github'
					? 'GitHub Actions Secrets'
					: 'Deployment Webhook',
		)
		setTargetIdentifier('')
		setAuthToken('')
		setError(null)
		setIsOpen(true)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		const environmentMapping = [
			{ sourceEnv: 'prod', targetEnv: 'Production' },
			{ sourceEnv: 'dev', targetEnv: 'Development' },
			{ sourceEnv: 'staging', targetEnv: 'Preview' },
		]

		try {
			const res = await fetch(`/api/projects/${projectId}/integrations`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					provider,
					name,
					targetIdentifier,
					authToken,
					environmentMapping,
				}),
			})

			const data = await res.json()
			if (!res.ok) {
				throw new Error(data.error || 'Failed to connect integration')
			}

			setIntegrations((prev) => [data.integration, ...prev])
			setIsOpen(false)
			router.refresh()
		} catch (err: unknown) {
			setError((err as Error).message || 'Something went wrong')
		} finally {
			setIsLoading(false)
		}
	}

	const handleSyncNow = async (integrationId: string) => {
		setSyncingId(integrationId)
		setSyncSuccessMsg(null)

		try {
			const res = await fetch(
				`/api/projects/${projectId}/integrations/${integrationId}/sync`,
				{ method: 'POST' },
			)

			const data = await res.json()
			if (!res.ok) {
				throw new Error(data.error || 'Sync request failed')
			}

			setIntegrations((prev) =>
				prev.map((item) =>
					item._id === integrationId
						? {
								...item,
								lastSyncAt: new Date().toISOString(),
								lastSyncStatus: data.result.success ? 'success' : 'failed',
								lastSyncError: data.result.error,
							}
						: item,
				),
			)

			setSyncSuccessMsg(data.result.message)
			setTimeout(() => setSyncSuccessMsg(null), 4000)
			router.refresh()
		} catch (err: unknown) {
			alert(`Sync error: ${(err as Error).message}`)
		} finally {
			setSyncingId(null)
		}
	}

	const handleDelete = async (integrationId: string) => {
		if (!confirm('Are you sure you want to disconnect this integration?'))
			return

		try {
			const res = await fetch(
				`/api/projects/${projectId}/integrations/${integrationId}`,
				{ method: 'DELETE' },
			)

			if (res.ok) {
				setIntegrations((prev) =>
					prev.filter((item) => item._id !== integrationId),
				)
				router.refresh()
			}
		} catch (e) {
			console.error('Failed to delete integration', e)
		}
	}

	return (
		<div className='space-y-8'>
			{syncSuccessMsg && (
				<div className='animate-in fade-in flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400'>
					<CheckCircle2 className='h-4 w-4 shrink-0' />
					<span>{syncSuccessMsg}</span>
				</div>
			)}

			{/* Available Connectors */}
			<div>
				<h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
					Available Connectors
				</h3>
				<p className='text-muted-foreground mt-1 text-xs'>
					Push secrets directly into third-party CI/CD platforms and hosting
					providers.
				</p>

				<div className='mt-4 grid gap-4 sm:grid-cols-3'>
					<div className='border-border bg-card hover:border-muted-foreground flex flex-col justify-between rounded-xl border p-5 shadow-sm transition'>
						<div>
							<div className='text-foreground flex items-center gap-2 font-semibold'>
								<Globe className='h-5 w-5 text-indigo-500' />
								<span>Vercel</span>
							</div>
							<p className='text-muted-foreground mt-2 text-xs'>
								Automatically sync project secrets to Vercel Production and
								Preview environments.
							</p>
						</div>
						<button
							type='button'
							onClick={() => handleOpen('vercel')}
							className='bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-4 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold'
						>
							<Plus className='h-3.5 w-3.5' />
							Connect Vercel
						</button>
					</div>

					<div className='border-border bg-card hover:border-muted-foreground flex flex-col justify-between rounded-xl border p-5 shadow-sm transition'>
						<div>
							<div className='text-foreground flex items-center gap-2 font-semibold'>
								<GithubIcon className='h-5 w-5 text-neutral-800 dark:text-neutral-200' />
								<span>GitHub Actions</span>
							</div>
							<p className='text-muted-foreground mt-2 text-xs'>
								Push encrypted secrets directly to repository secrets for
								automated CI/CD runs.
							</p>
						</div>
						<button
							type='button'
							onClick={() => handleOpen('github')}
							className='bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-4 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold'
						>
							<Plus className='h-3.5 w-3.5' />
							Connect GitHub
						</button>
					</div>

					<div className='border-border bg-card hover:border-muted-foreground flex flex-col justify-between rounded-xl border p-5 shadow-sm transition'>
						<div>
							<div className='text-foreground flex items-center gap-2 font-semibold'>
								<Webhook className='h-5 w-5 text-emerald-500' />
								<span>Custom Webhook</span>
							</div>
							<p className='text-muted-foreground mt-2 text-xs'>
								Send HMAC-signed HTTP notifications to custom webhook endpoints
								on secret updates.
							</p>
						</div>
						<button
							type='button'
							onClick={() => handleOpen('webhook')}
							className='bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-4 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold'
						>
							<Plus className='h-3.5 w-3.5' />
							Configure Webhook
						</button>
					</div>
				</div>
			</div>

			{/* Connected Integrations List */}
			<div>
				<h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
					Active Integrations ({integrations.length})
				</h3>

				<div className='border-border bg-card mt-4 overflow-hidden rounded-xl border shadow-sm'>
					<table className='w-full text-left text-sm'>
						<thead className='border-border bg-muted/40 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase'>
							<tr>
								<th className='px-4 py-3'>Integration</th>
								<th className='px-4 py-3'>Target Identifier</th>
								<th className='px-4 py-3'>Mappings</th>
								<th className='px-4 py-3'>Sync Status</th>
								<th className='px-4 py-3 text-right'>Actions</th>
							</tr>
						</thead>
						<tbody className='divide-border divide-y'>
							{integrations.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className='text-muted-foreground px-4 py-8 text-center text-sm'
									>
										No integrations connected yet. Choose a connector above to
										get started.
									</td>
								</tr>
							) : (
								integrations.map((item) => (
									<tr key={item._id} className='hover:bg-muted/30 transition'>
										<td className='text-foreground flex items-center gap-2 px-4 py-3 font-medium'>
											{item.provider === 'vercel' ? (
												<Globe className='h-4 w-4 text-indigo-500' />
											) : item.provider === 'github' ? (
												<GithubIcon className='text-foreground h-4 w-4' />
											) : (
												<Webhook className='h-4 w-4 text-emerald-500' />
											)}
											<div>
												<div>{item.name}</div>
												<div className='text-muted-foreground text-[10px] capitalize'>
													{item.provider}
												</div>
											</div>
										</td>
										<td className='text-muted-foreground max-w-[180px] truncate px-4 py-3 font-mono text-xs'>
											{item.targetIdentifier}
										</td>
										<td className='text-muted-foreground px-4 py-3 text-xs'>
											{item.environmentMapping?.length || 0} envs mapped
										</td>
										<td className='px-4 py-3 text-xs'>
											{item.lastSyncStatus === 'success' ? (
												<span className='inline-flex items-center gap-1 font-medium text-emerald-500'>
													<CheckCircle2 className='h-3.5 w-3.5' />
													Synced
												</span>
											) : item.lastSyncStatus === 'failed' ? (
												<span
													className='text-destructive inline-flex items-center gap-1 font-medium'
													title={item.lastSyncError}
												>
													<XCircle className='h-3.5 w-3.5' />
													Failed
												</span>
											) : (
												<span className='text-muted-foreground inline-flex items-center gap-1'>
													<Clock className='h-3.5 w-3.5' />
													Pending
												</span>
											)}
											{item.lastSyncAt && (
												<div className='text-muted-foreground text-[10px]'>
													{new Date(item.lastSyncAt).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit',
													})}
												</div>
											)}
										</td>
										<td className='px-4 py-3 text-right'>
											<div className='flex items-center justify-end gap-2'>
												<button
													type='button'
													onClick={() => handleSyncNow(item._id)}
													disabled={syncingId === item._id}
													className='bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold disabled:opacity-50'
													title='Sync Secrets Now'
												>
													<RefreshCw
														className={`h-3 w-3 ${syncingId === item._id ? 'animate-spin' : ''}`}
													/>
													Sync
												</button>
												<button
													type='button'
													onClick={() => handleDelete(item._id)}
													className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1'
													title='Disconnect'
												>
													<Trash2 className='h-4 w-4' />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Connect Modal */}
			{isOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
					<div className='border-border bg-card animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border p-6 shadow-2xl'>
						<h3 className='text-foreground text-lg font-semibold capitalize'>
							Connect {provider}
						</h3>
						<p className='text-muted-foreground mt-1 text-xs'>
							Provide connection credentials to automate secret synchronization.
						</p>

						{error && (
							<div className='border-destructive/20 bg-destructive/10 text-destructive mt-3 flex items-center gap-2 rounded-md border p-2.5 text-xs'>
								<AlertCircle className='h-4 w-4 shrink-0' />
								<span>{error}</span>
							</div>
						)}

						<form onSubmit={handleSubmit} className='mt-4 space-y-4'>
							<div>
								<label className='text-foreground block text-xs font-medium'>
									Integration Label
								</label>
								<input
									type='text'
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
								/>
							</div>

							<div>
								<label className='text-foreground block text-xs font-medium'>
									{provider === 'vercel'
										? 'Vercel Project ID or Slug'
										: provider === 'github'
											? 'GitHub Repository (owner/repo)'
											: 'Webhook Destination URL'}
								</label>
								<input
									type='text'
									required
									value={targetIdentifier}
									onChange={(e) => setTargetIdentifier(e.target.value)}
									placeholder={
										provider === 'vercel'
											? 'prj_abc12345...'
											: provider === 'github'
												? 'acme-corp/api-server'
												: 'https://api.acme.com/webhooks/secrets'
									}
									className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
								/>
							</div>

							<div>
								<label className='text-foreground block text-xs font-medium'>
									{provider === 'webhook'
										? 'HMAC Signing Secret'
										: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API Token`}
								</label>
								<input
									type='password'
									required
									value={authToken}
									onChange={(e) => setAuthToken(e.target.value)}
									placeholder='••••••••••••••••'
									className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
								/>
							</div>

							<div className='flex items-center justify-end gap-2 pt-2'>
								<button
									type='button'
									onClick={() => setIsOpen(false)}
									className='border-border text-muted-foreground hover:bg-muted rounded-md border px-3 py-2 text-xs font-medium'
								>
									Cancel
								</button>
								<button
									type='submit'
									disabled={
										isLoading || !name || !targetIdentifier || !authToken
									}
									className='bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50'
								>
									{isLoading && (
										<Loader2 className='h-3.5 w-3.5 animate-spin' />
									)}
									Save & Connect
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
