'use client'

import { useState } from 'react'
import {
	Key,
	Plus,
	Copy,
	Check,
	Trash2,
	AlertTriangle,
	Terminal,
	Loader2,
	Clock,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface ApiKeyItem {
	_id: string
	name: string
	keyPrefix: string
	lastUsedAt?: string
	expiresAt?: string
	createdAt: string
}

interface ApiKeysManagerProps {
	initialKeys: ApiKeyItem[]
}

export function ApiKeysManager({ initialKeys }: ApiKeysManagerProps) {
	const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys)
	const [isOpen, setIsOpen] = useState(false)
	const [name, setName] = useState('')
	const [expiresInDays, setExpiresInDays] = useState<number | null>(30)
	const [isLoading, setIsLoading] = useState(false)
	const [createdToken, setCreatedToken] = useState<string | null>(null)
	const [hasCopied, setHasCopied] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		try {
			const res = await fetch('/api/api-keys', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, expiresInDays }),
			})

			const data = await res.json()
			if (!res.ok) {
				throw new Error(data.error || 'Failed to generate token')
			}

			setCreatedToken(data.token)
			setKeys((prev) => [data.apiKey, ...prev])
			setName('')
			router.refresh()
		} catch (err: unknown) {
			setError((err as Error).message || 'Something went wrong')
		} finally {
			setIsLoading(false)
		}
	}

	const handleRevoke = async (id: string) => {
		if (
			!confirm(
				'Are you sure you want to revoke this API key? Applications using it will lose access immediately.',
			)
		) {
			return
		}

		try {
			const res = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
			if (res.ok) {
				setKeys((prev) => prev.filter((k) => k._id !== id))
				router.refresh()
			}
		} catch (err) {
			console.error('Failed to revoke API key', err)
		}
	}

	const copyToClipboard = async (text: string) => {
		await navigator.clipboard.writeText(text)
		setHasCopied(true)
		setTimeout(() => setHasCopied(false), 2000)
	}

	return (
		<div className='space-y-8'>
			{/* Top Header & Actions */}
			<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
				<div>
					<h2 className='text-foreground text-lg font-semibold'>
						Personal Access Tokens (PAT)
					</h2>
					<p className='text-muted-foreground text-sm'>
						Authenticate the DevVault CLI, CI/CD pipelines, and local dev
						environments without plaintext .env files.
					</p>
				</div>
				<button
					type='button'
					onClick={() => {
						setCreatedToken(null)
						setIsOpen(true)
					}}
					className='bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90'
				>
					<Plus className='h-4 w-4' />
					Generate New Token
				</button>
			</div>

			{/* Create Token Modal */}
			{isOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
					<div className='border-border bg-card animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border p-6 shadow-2xl'>
						{!createdToken ? (
							<>
								<h3 className='text-foreground text-lg font-semibold'>
									Generate Personal Access Token
								</h3>
								<p className='text-muted-foreground mt-1 text-xs'>
									Tokens have full API access scoped to projects and workspaces
									you belong to.
								</p>

								{error && (
									<div className='border-destructive/20 bg-destructive/10 text-destructive mt-3 rounded-md border p-2.5 text-xs'>
										{error}
									</div>
								)}

								<form onSubmit={handleCreate} className='mt-4 space-y-4'>
									<div>
										<label className='text-foreground block text-xs font-medium'>
											Token Name / Description
										</label>
										<input
											type='text'
											required
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder='MacBook Pro M3 or GitHub Actions'
											className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
										/>
									</div>

									<div>
										<label className='text-foreground block text-xs font-medium'>
											Expiration
										</label>
										<select
											value={expiresInDays === null ? 'never' : expiresInDays}
											onChange={(e) =>
												setExpiresInDays(
													e.target.value === 'never'
														? null
														: Number(e.target.value),
												)
											}
											className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
										>
											<option value='7'>7 days</option>
											<option value='30'>30 days (Recommended)</option>
											<option value='90'>90 days</option>
											<option value='365'>1 year</option>
											<option value='never'>No expiration (Permanent)</option>
										</select>
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
											disabled={isLoading || !name}
											className='bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50'
										>
											{isLoading && (
												<Loader2 className='h-3.5 w-3.5 animate-spin' />
											)}
											Generate Token
										</button>
									</div>
								</form>
							</>
						) : (
							<div className='space-y-4'>
								<div className='flex items-center gap-2 text-emerald-500'>
									<Check className='h-5 w-5' />
									<h3 className='text-foreground text-lg font-semibold'>
										Token Generated!
									</h3>
								</div>

								<div className='flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400'>
									<AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
									<div>
										Make sure to copy your Personal Access Token now. You will
										not be able to view it again!
									</div>
								</div>

								<div className='border-border bg-muted/60 text-foreground flex items-center justify-between gap-2 rounded-lg border p-3 font-mono text-xs break-all'>
									<span>{createdToken}</span>
									<button
										type='button'
										onClick={() => copyToClipboard(createdToken)}
										className='hover:bg-background text-muted-foreground hover:text-foreground shrink-0 rounded p-1.5'
										title='Copy token'
									>
										{hasCopied ? (
											<Check className='h-4 w-4 text-emerald-500' />
										) : (
											<Copy className='h-4 w-4' />
										)}
									</button>
								</div>

								<div className='flex justify-end pt-2'>
									<button
										type='button'
										onClick={() => {
											setIsOpen(false)
											setCreatedToken(null)
										}}
										className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-xs font-semibold hover:opacity-90'
									>
										Done
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Tokens Table */}
			<div className='border-border bg-card overflow-hidden rounded-xl border shadow-sm'>
				<table className='w-full text-left text-sm'>
					<thead className='border-border bg-muted/40 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase'>
						<tr>
							<th className='px-4 py-3'>Token Name</th>
							<th className='px-4 py-3'>Key Prefix</th>
							<th className='px-4 py-3'>Last Used</th>
							<th className='px-4 py-3'>Expires</th>
							<th className='px-4 py-3 text-right'>Action</th>
						</tr>
					</thead>
					<tbody className='divide-border divide-y'>
						{keys.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className='text-muted-foreground px-4 py-8 text-center text-sm'
								>
									No active API tokens found. Generate one to use the CLI.
								</td>
							</tr>
						) : (
							keys.map((k) => (
								<tr key={k._id} className='hover:bg-muted/30 transition'>
									<td className='text-foreground flex items-center gap-2 px-4 py-3 font-medium'>
										<Key className='text-primary h-4 w-4 shrink-0' />
										<span>{k.name}</span>
									</td>
									<td className='text-muted-foreground px-4 py-3 font-mono text-xs'>
										{k.keyPrefix}
									</td>
									<td className='text-muted-foreground px-4 py-3 text-xs'>
										{k.lastUsedAt
											? new Date(k.lastUsedAt).toLocaleDateString()
											: 'Never'}
									</td>
									<td className='text-muted-foreground px-4 py-3 text-xs'>
										{k.expiresAt ? (
											<span className='flex items-center gap-1'>
												<Clock className='text-muted-foreground h-3 w-3' />
												{new Date(k.expiresAt).toLocaleDateString()}
											</span>
										) : (
											<span className='font-medium text-emerald-500'>
												No expiry
											</span>
										)}
									</td>
									<td className='px-4 py-3 text-right'>
										<button
											type='button'
											onClick={() => handleRevoke(k._id)}
											className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1'
											title='Revoke token'
										>
											<Trash2 className='h-4 w-4' />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Terminal & CLI Usage Quickstart */}
			<div className='border-border bg-card space-y-4 rounded-xl border p-6 shadow-sm'>
				<div className='flex items-center gap-2'>
					<Terminal className='h-5 w-5 text-emerald-500' />
					<h3 className='text-foreground text-base font-semibold'>
						DevVault CLI Quickstart
					</h3>
				</div>
				<p className='text-muted-foreground text-xs'>
					Streamline your local development workflow by injecting secrets
					straight into child processes in-memory without creating insecure
					plaintext files on disk.
				</p>

				<div className='grid gap-4 md:grid-cols-2'>
					<div className='border-border bg-muted/40 space-y-2 rounded-lg border p-3 font-mono text-xs'>
						<div className='text-muted-foreground text-[11px] font-semibold tracking-wider uppercase'>
							1. Authenticate CLI
						</div>
						<div className='text-foreground rounded bg-black/40 p-2'>
							devvault login --token &lt;YOUR_TOKEN&gt;
						</div>
					</div>

					<div className='border-border bg-muted/40 space-y-2 rounded-lg border p-3 font-mono text-xs'>
						<div className='text-muted-foreground text-[11px] font-semibold tracking-wider uppercase'>
							2. Link Project in Directory
						</div>
						<div className='text-foreground rounded bg-black/40 p-2'>
							devvault link --project &lt;slug&gt; --env dev
						</div>
					</div>

					<div className='border-border bg-muted/40 space-y-2 rounded-lg border p-3 font-mono text-xs'>
						<div className='text-muted-foreground text-[11px] font-semibold tracking-wider uppercase'>
							3. In-Memory Run Injection
						</div>
						<div className='rounded bg-black/40 p-2 text-emerald-400'>
							devvault run -- npm run dev
						</div>
					</div>

					<div className='border-border bg-muted/40 space-y-2 rounded-lg border p-3 font-mono text-xs'>
						<div className='text-muted-foreground text-[11px] font-semibold tracking-wider uppercase'>
							4. Pull Local .env File
						</div>
						<div className='text-foreground rounded bg-black/40 p-2'>
							devvault pull --format env
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
