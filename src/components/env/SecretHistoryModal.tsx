'use client'

import { useState, useEffect } from 'react'
import {
	Clock,
	RotateCcw,
	Eye,
	EyeOff,
	Copy,
	Check,
	AlertCircle,
	X,
	GitCompare,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

export type SecretVersion = {
	_id: string
	versionNumber: number
	changeType: 'created' | 'updated' | 'deleted' | 'rollback'
	changeReason?: string
	createdAt: string
	modifiedByUserId: string
	value?: string | null
}

export function SecretHistoryModal({
	projectId,
	variableId,
	variableKey,
	environment,
	isOpen,
	onClose,
}: {
	projectId: string
	variableId: string
	variableKey: string
	environment: string
	isOpen: boolean
	onClose: () => void
}) {
	const router = useRouter()
	const [versions, setVersions] = useState<SecretVersion[]>([])
	const [currentValue, setCurrentValue] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [revealedVersions, setRevealedVersions] = useState<
		Record<number, string>
	>({})
	const [comparingVersion, setComparingVersion] = useState<number | null>(null)
	const [isRollingBack, setIsRollingBack] = useState<number | null>(null)
	const [copiedValue, setCopiedValue] = useState<string | null>(null)

	useEffect(() => {
		let ignore = false

		async function load() {
			try {
				const res = await fetch(
					`/api/projects/${projectId}/env/${variableId}/history?reveal=true`,
				)
				if (!res.ok) throw new Error('Failed to load history')
				const data = await res.json()
				if (!ignore) {
					setVersions(data.versions || [])
					setCurrentValue(data.currentVersion?.currentValue ?? null)
					setIsLoading(false)
				}
			} catch {
				if (!ignore) {
					toast.error('Failed to load secret history')
					setIsLoading(false)
				}
			}
		}

		if (isOpen) {
			void load()
		}

		return () => {
			ignore = true
		}
	}, [isOpen, projectId, variableId])

	function handleClose() {
		setRevealedVersions({})
		setComparingVersion(null)
		setIsLoading(true)
		onClose()
	}

	function toggleReveal(versionNumber: number, value: string | null) {
		setRevealedVersions((prev) => {
			if (prev[versionNumber] !== undefined) {
				const next = { ...prev }
				delete next[versionNumber]
				return next
			}
			return {
				...prev,
				[versionNumber]: value || '',
			}
		})
	}

	async function copyToClipboard(text: string, id: string) {
		await navigator.clipboard.writeText(text)
		setCopiedValue(id)
		setTimeout(() => setCopiedValue(null), 1500)
	}

	async function handleRollback(targetVersionNumber: number) {
		if (
			!window.confirm(
				`Are you sure you want to restore ${variableKey} to version v${targetVersionNumber}?`,
			)
		) {
			return
		}

		setIsRollingBack(targetVersionNumber)
		try {
			const res = await fetch(
				`/api/projects/${projectId}/env/${variableId}/rollback`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						targetVersionNumber,
						reason: `Restored to v${targetVersionNumber}`,
					}),
				},
			)

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || 'Rollback failed')
			}

			toast.success(
				`Successfully rolled back ${variableKey} to v${targetVersionNumber}`,
			)
			router.refresh()
			handleClose()
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Rollback failed'
			toast.error(message)
		} finally {
			setIsRollingBack(null)
		}
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs'>
			<div className='border-border bg-card text-card-foreground flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border shadow-2xl'>
				{/* Modal Header */}
				<div className='border-border flex items-center justify-between border-b px-6 py-4'>
					<div className='flex items-center gap-3'>
						<div className='bg-primary/10 text-primary rounded-lg p-2'>
							<Clock className='h-5 w-5' />
						</div>
						<div>
							<div className='flex items-center gap-2'>
								<h2 className='text-foreground font-mono text-base font-semibold'>
									{variableKey}
								</h2>
								<span className='bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs uppercase'>
									{environment}
								</span>
							</div>
							<p className='text-muted-foreground text-xs'>
								Audit trail, historical changes, and one-click rollback
							</p>
						</div>
					</div>
					<button
						type='button'
						onClick={handleClose}
						className='text-muted-foreground hover:bg-hover hover:text-foreground rounded-lg p-1 transition'
						aria-label='Close modal'
					>
						<X className='h-5 w-5' />
					</button>
				</div>

				{/* Modal Content */}
				<div className='flex-1 overflow-y-auto px-6 py-4'>
					{isLoading ? (
						<div className='flex flex-col items-center justify-center py-12'>
							<div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
							<p className='text-muted-foreground mt-3 text-sm'>
								Loading version history...
							</p>
						</div>
					) : versions.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<AlertCircle className='text-muted-foreground h-10 w-10 opacity-40' />
							<p className='text-foreground mt-3 text-sm font-medium'>
								No historical revisions yet
							</p>
							<p className='text-muted-foreground text-xs'>
								Changes made to this variable will automatically appear here.
							</p>
						</div>
					) : (
						<div className='space-y-4'>
							{versions.map((version, index) => {
								const isLatest = index === 0
								const isRevealed =
									revealedVersions[version.versionNumber] !== undefined
								const isComparing = comparingVersion === version.versionNumber
								const versionVal = version.value || ''

								return (
									<div
										key={version._id || version.versionNumber}
										className={`border-border rounded-lg border p-4 transition ${
											isLatest ? 'bg-primary/5 border-primary/30' : 'bg-card'
										}`}
									>
										<div className='flex flex-wrap items-center justify-between gap-2'>
											<div className='flex items-center gap-2'>
												<span className='bg-primary text-primary-foreground rounded-md px-2 py-0.5 font-mono text-xs font-semibold'>
													v{version.versionNumber}
												</span>
												<ChangeBadge changeType={version.changeType} />
												{isLatest && (
													<span className='rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
														Current Value
													</span>
												)}
											</div>
											<div className='text-muted-foreground text-xs'>
												{new Date(version.createdAt).toLocaleString(undefined, {
													dateStyle: 'medium',
													timeStyle: 'short',
												})}
											</div>
										</div>

										{version.changeReason && (
											<p className='text-muted-foreground mt-2 text-xs italic'>
												&quot;{version.changeReason}&quot;
											</p>
										)}

										{/* Value display */}
										<div className='border-border bg-background mt-3 flex items-center justify-between rounded-md border px-3 py-2'>
											<span className='text-foreground max-w-sm truncate font-mono text-xs'>
												{isRevealed
													? versionVal || '(empty)'
													: '••••••••••••••••'}
											</span>
											<div className='flex items-center gap-1.5'>
												<button
													type='button'
													onClick={() =>
														toggleReveal(version.versionNumber, versionVal)
													}
													className='text-muted-foreground hover:bg-hover hover:text-foreground rounded p-1 transition'
													title={isRevealed ? 'Mask value' : 'Reveal value'}
												>
													{isRevealed ? (
														<EyeOff className='h-3.5 w-3.5' />
													) : (
														<Eye className='h-3.5 w-3.5' />
													)}
												</button>
												{isRevealed && (
													<button
														type='button'
														onClick={() =>
															copyToClipboard(
																versionVal,
																String(version.versionNumber),
															)
														}
														className='text-muted-foreground hover:bg-hover hover:text-foreground rounded p-1 transition'
														title='Copy value'
													>
														{copiedValue === String(version.versionNumber) ? (
															<Check className='h-3.5 w-3.5 text-emerald-500' />
														) : (
															<Copy className='h-3.5 w-3.5' />
														)}
													</button>
												)}
											</div>
										</div>

										{/* Actions & Comparison */}
										<div className='mt-3 flex items-center justify-end gap-2'>
											{!isLatest && currentValue !== null && (
												<button
													type='button'
													onClick={() =>
														setComparingVersion(
															isComparing ? null : version.versionNumber,
														)
													}
													className='border-border text-foreground hover:bg-hover inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition'
												>
													<GitCompare className='h-3.5 w-3.5' />
													{isComparing ? 'Hide Diff' : 'Compare'}
												</button>
											)}

											{!isLatest && (
												<button
													type='button'
													disabled={isRollingBack === version.versionNumber}
													onClick={() => handleRollback(version.versionNumber)}
													className='border-primary/40 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50'
												>
													<RotateCcw className='h-3.5 w-3.5' />
													{isRollingBack === version.versionNumber
														? 'Restoring...'
														: 'Rollback to this version'}
												</button>
											)}
										</div>

										{/* Diff comparison box */}
										{isComparing && (
											<div className='border-border bg-muted/40 mt-3 rounded-md border p-3 text-xs'>
												<div className='text-muted-foreground mb-2 font-semibold'>
													Comparison with Current Version:
												</div>
												<div className='grid grid-cols-2 gap-3'>
													<div className='border-danger/20 bg-danger/5 rounded border p-2'>
														<span className='text-danger block text-[10px] font-bold uppercase'>
															v{version.versionNumber} (Historical)
														</span>
														<p className='mt-1 font-mono break-all'>
															{versionVal || '(empty)'}
														</p>
													</div>
													<div className='rounded border border-emerald-500/20 bg-emerald-500/5 p-2'>
														<span className='block text-[10px] font-bold text-emerald-600 uppercase dark:text-emerald-400'>
															Current Active Value
														</span>
														<p className='mt-1 font-mono break-all'>
															{currentValue || '(empty)'}
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								)
							})}
						</div>
					)}
				</div>

				{/* Modal Footer */}
				<div className='border-border bg-muted/20 flex justify-end border-t px-6 py-3'>
					<button
						type='button'
						onClick={handleClose}
						className='border-border text-foreground hover:bg-hover rounded-md border px-4 py-1.5 text-xs font-medium transition'
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}

function ChangeBadge({ changeType }: { changeType: string }) {
	switch (changeType) {
		case 'created':
			return (
				<span className='rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400'>
					Created
				</span>
			)
		case 'rollback':
			return (
				<span className='rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400'>
					Rollback
				</span>
			)
		case 'deleted':
			return (
				<span className='bg-danger/10 text-danger rounded px-2 py-0.5 text-xs font-medium'>
					Deleted
				</span>
			)
		case 'updated':
		default:
			return (
				<span className='bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs font-medium'>
					Updated
				</span>
			)
	}
}
