'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X, ShieldAlert } from 'lucide-react'

export interface ExpiringSecretItem {
	_id: string
	key: string
	environment: string
	expiryDate: string
	projectId: string
	projectName: string
}

export function ExpiringSecretsAlert({
	secrets,
}: {
	secrets: ExpiringSecretItem[]
}) {
	const [dismissed, setDismissed] = useState(false)

	if (dismissed || !secrets || secrets.length === 0) return null

	const now = new Date().getTime()

	return (
		<div className='text-foreground relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm backdrop-blur-xs'>
			<div className='flex items-start justify-between gap-3'>
				<div className='flex items-start gap-3'>
					<div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400'>
						<ShieldAlert className='h-4 w-4' />
					</div>
					<div>
						<h3 className='text-foreground text-sm font-bold'>
							{secrets.length} Secret{secrets.length > 1 ? 's' : ''} Expiring
							Soon or Expired
						</h3>
						<p className='text-muted-foreground mt-0.5 text-xs'>
							Environment credentials scheduled to rotate or expire within 7
							days. Rotate them now to prevent service disruptions.
						</p>

						<div className='mt-3 flex flex-wrap gap-2'>
							{secrets.slice(0, 5).map((secret) => {
								const exp = new Date(secret.expiryDate).getTime()
								const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
								const isExpired = daysLeft <= 0

								return (
									<Link
										key={secret._id}
										href={`/dashboard/projects/${secret.projectId}?environment=${secret.environment}`}
										className='border-border/60 bg-background/80 hover:bg-background text-foreground flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium shadow-2xs transition-colors'
									>
										<span className='font-mono font-bold'>{secret.key}</span>
										<span className='bg-muted text-muted-foreground py-0.2 rounded px-1 text-[10px] uppercase'>
											{secret.environment}
										</span>
										<span
											className={`text-[11px] font-semibold ${
												isExpired
													? 'text-rose-500'
													: daysLeft <= 2
														? 'text-amber-500'
														: 'text-muted-foreground'
											}`}
										>
											{isExpired ? 'Expired' : `${daysLeft}d left`}
										</span>
										<ArrowRight className='text-muted-foreground h-3 w-3' />
									</Link>
								)
							})}
						</div>
					</div>
				</div>

				<button
					onClick={() => setDismissed(true)}
					type='button'
					className='text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg transition-colors'
					title='Dismiss'
				>
					<X className='h-4 w-4' />
				</button>
			</div>
		</div>
	)
}
