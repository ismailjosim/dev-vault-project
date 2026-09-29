'use client'

import {
	AlertTriangle,
	ArrowRight,
	Check,
	CheckCircle2,
	Copy,
	Loader2,
	RefreshCw,
	Sparkles,
	X,
} from 'lucide-react'
import { useEnvironmentCompare } from './useEnvironmentCompare'
import type { EnvironmentCompareModalProps } from './types'

export function EnvironmentCompareModal({
	projectId,
	environments,
	isOpen,
	onClose,
	onClonedSuccess,
}: EnvironmentCompareModalProps) {
	const {
		isLoading,
		isCloning,
		error,
		successMsg,
		sourceEnv,
		setSourceEnv,
		targetEnv,
		setTargetEnv,
		copyValues,
		setCopyValues,
		comparison,
		cloneMissingToTarget,
		refresh,
	} = useEnvironmentCompare({
		projectId,
		environments,
		isOpen,
		onClonedSuccess,
	})

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs'>
			<div className='border-border bg-card animate-in fade-in zoom-in-95 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200'>
				{/* Modal Header */}
				<div className='border-border/60 bg-muted/30 flex items-center justify-between border-b px-6 py-4'>
					<div className='flex items-center gap-2.5'>
						<div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg'>
							<Sparkles className='h-4 w-4' />
						</div>
						<div>
							<h3 className='text-foreground text-base font-bold'>
								Environment Key Comparison
							</h3>
							<p className='text-muted-foreground text-xs'>
								Audit missing variables and sync schema between environments
							</p>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<button
							onClick={refresh}
							disabled={isLoading}
							type='button'
							className='border-border/60 bg-background hover:bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-lg border transition-colors'
							title='Refresh variables'
						>
							<RefreshCw
								className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
							/>
						</button>
						<button
							onClick={onClose}
							type='button'
							className='hover:bg-muted text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors'
						>
							<X className='h-4 w-4' />
						</button>
					</div>
				</div>

				{/* Environment Pickers Bar */}
				<div className='border-border/60 bg-muted/15 flex flex-wrap items-center justify-between gap-4 border-b px-6 py-3.5'>
					<div className='flex flex-wrap items-center gap-3'>
						<div className='flex items-center gap-1.5'>
							<span className='text-muted-foreground text-xs font-medium'>
								Source:
							</span>
							<select
								value={sourceEnv}
								onChange={(e) => setSourceEnv(e.target.value)}
								className='border-border bg-background text-foreground focus:ring-primary rounded-md border px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:outline-none'
							>
								{environments.map((env) => (
									<option key={env} value={env}>
										{env.toUpperCase()}
									</option>
								))}
							</select>
						</div>

						<ArrowRight className='text-muted-foreground h-4 w-4' />

						<div className='flex items-center gap-1.5'>
							<span className='text-muted-foreground text-xs font-medium'>
								Target:
							</span>
							<select
								value={targetEnv}
								onChange={(e) => setTargetEnv(e.target.value)}
								className='border-border bg-background text-foreground focus:ring-primary rounded-md border px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:outline-none'
							>
								{environments.map((env) => (
									<option key={env} value={env}>
										{env.toUpperCase()}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Options and bulk clone */}
					{comparison.missingInTarget.length > 0 && (
						<div className='flex items-center gap-3'>
							<label className='text-muted-foreground flex cursor-pointer items-center gap-1.5 text-xs'>
								<input
									type='checkbox'
									checked={copyValues}
									onChange={(e) => setCopyValues(e.target.checked)}
									className='border-border text-primary focus:ring-primary rounded'
								/>
								<span>Copy values too</span>
							</label>
							<button
								onClick={cloneMissingToTarget}
								disabled={isCloning}
								type='button'
								className='bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow transition-all'
							>
								{isCloning ? (
									<>
										<Loader2 className='h-3 w-3 animate-spin' />
										<span>Cloning...</span>
									</>
								) : (
									<>
										<Copy className='h-3 w-3' />
										<span>
											Clone {comparison.missingInTarget.length} Missing to{' '}
											{targetEnv.toUpperCase()}
										</span>
									</>
								)}
							</button>
						</div>
					)}
				</div>

				{/* Notifications */}
				{error && (
					<div className='mx-6 mt-4 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-500'>
						<AlertTriangle className='h-4 w-4 shrink-0' />
						<span>{error}</span>
					</div>
				)}

				{successMsg && (
					<div className='mx-6 mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400'>
						<Check className='h-4 w-4 shrink-0' />
						<span>{successMsg}</span>
					</div>
				)}

				{/* Body Content */}
				<div className='flex-1 space-y-6 overflow-y-auto p-6'>
					{/* Status Stats */}
					<div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
						<div className='border-border/60 bg-muted/30 rounded-xl border p-3.5'>
							<div className='flex items-center justify-between'>
								<span className='text-muted-foreground text-xs font-medium'>
									Missing in {targetEnv.toUpperCase()}
								</span>
								<span
									className={`rounded-full px-2 py-0.5 text-xs font-bold ${
										comparison.missingInTarget.length > 0
											? 'bg-rose-500/10 text-rose-500'
											: 'bg-emerald-500/10 text-emerald-500'
									}`}
								>
									{comparison.missingInTarget.length}
								</span>
							</div>
							<p className='text-muted-foreground mt-1 text-[11px]'>
								Present in {sourceEnv.toUpperCase()} but absent in{' '}
								{targetEnv.toUpperCase()}
							</p>
						</div>

						<div className='border-border/60 bg-muted/30 rounded-xl border p-3.5'>
							<div className='flex items-center justify-between'>
								<span className='text-muted-foreground text-xs font-medium'>
									Missing in {sourceEnv.toUpperCase()}
								</span>
								<span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-bold'>
									{comparison.missingInSource.length}
								</span>
							</div>
							<p className='text-muted-foreground mt-1 text-[11px]'>
								Present in {targetEnv.toUpperCase()} only
							</p>
						</div>

						<div className='border-border/60 bg-muted/30 rounded-xl border p-3.5'>
							<div className='flex items-center justify-between'>
								<span className='text-muted-foreground text-xs font-medium'>
									Synchronized Keys
								</span>
								<span className='rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500'>
									{comparison.presentInBoth.length}
								</span>
							</div>
							<p className='text-muted-foreground mt-1 text-[11px]'>
								Configured in both environments
							</p>
						</div>
					</div>

					{/* Missing in Target Section */}
					<div>
						<div className='mb-2 flex items-center justify-between'>
							<h4 className='text-foreground flex items-center gap-1.5 text-sm font-semibold'>
								<AlertTriangle className='h-4 w-4 text-rose-500' />
								<span>
									Missing in {targetEnv.toUpperCase()} (
									{comparison.missingInTarget.length})
								</span>
							</h4>
						</div>

						{comparison.missingInTarget.length === 0 ? (
							<div className='border-border/60 flex items-center gap-2 rounded-xl border border-dashed bg-emerald-500/5 p-4 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
								<CheckCircle2 className='h-4 w-4 shrink-0' />
								<span>
									All keys from {sourceEnv.toUpperCase()} exist in{' '}
									{targetEnv.toUpperCase()}! No missing variables.
								</span>
							</div>
						) : (
							<div className='border-border/60 divide-border/40 bg-card divide-y overflow-hidden rounded-xl border'>
								{comparison.missingInTarget.map((v) => (
									<div
										key={v._id}
										className='hover:bg-muted/20 flex items-center justify-between px-4 py-3 transition-colors'
									>
										<div>
											<div className='flex items-center gap-2'>
												<span className='text-foreground font-mono text-xs font-bold'>
													{v.key}
												</span>
												<span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium uppercase'>
													{v.type}
												</span>
											</div>
											{v.note && (
												<p className='text-muted-foreground mt-0.5 text-[11px]'>
													{v.note}
												</p>
											)}
										</div>
										<span className='text-xs font-medium text-rose-500'>
											Not configured
										</span>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Present in Both Section */}
					{comparison.presentInBoth.length > 0 && (
						<div>
							<h4 className='text-foreground mb-2 flex items-center gap-1.5 text-sm font-semibold'>
								<CheckCircle2 className='h-4 w-4 text-emerald-500' />
								<span>
									Synchronized Keys ({comparison.presentInBoth.length})
								</span>
							</h4>
							<div className='border-border/60 divide-border/40 bg-card max-h-48 divide-y overflow-hidden overflow-y-auto rounded-xl border'>
								{comparison.presentInBoth.map((item) => (
									<div
										key={item.key}
										className='flex items-center justify-between px-4 py-2.5 text-xs'
									>
										<div className='flex items-center gap-2 font-mono'>
											<span className='text-foreground font-medium'>
												{item.key}
											</span>
											<span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-sans text-[10px] uppercase'>
												{item.sourceVar.type}
											</span>
										</div>
										<span className='flex items-center gap-1 text-xs font-medium text-emerald-500'>
											<Check className='h-3.5 w-3.5' />
											<span>In both</span>
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Modal Footer */}
				<div className='border-border/60 bg-muted/30 flex items-center justify-end border-t px-6 py-3'>
					<button
						onClick={onClose}
						type='button'
						className='border-border bg-background hover:bg-muted text-foreground rounded-lg border px-4 py-2 text-xs font-medium transition-colors'
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}
