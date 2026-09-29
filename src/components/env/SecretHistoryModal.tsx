'use client'

import { AlertCircle, Clock, X } from 'lucide-react'
import {
	SecretVersionItem,
	useSecretHistory,
	type SecretHistoryModalProps,
} from './history'

export function SecretHistoryModal({
	projectId,
	variableId,
	variableKey,
	environment,
	isOpen,
	onClose,
}: SecretHistoryModalProps) {
	const {
		versions,
		currentValue,
		isLoading,
		revealedVersions,
		comparingVersion,
		setComparingVersion,
		isRollingBack,
		copiedValue,
		handleClose,
		toggleReveal,
		copyToClipboard,
		handleRollback,
	} = useSecretHistory(projectId, variableId, variableKey, isOpen, onClose)

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

								return (
									<SecretVersionItem
										key={version._id || version.versionNumber}
										version={version}
										isLatest={isLatest}
										isRevealed={isRevealed}
										isComparing={isComparing}
										currentValue={currentValue}
										isRollingBack={isRollingBack === version.versionNumber}
										copiedValue={copiedValue}
										onToggleReveal={() =>
											toggleReveal(version.versionNumber, version.value || '')
										}
										onToggleCompare={() =>
											setComparingVersion(
												isComparing ? null : version.versionNumber,
											)
										}
										onCopy={(val) =>
											copyToClipboard(val, String(version.versionNumber))
										}
										onRollback={handleRollback}
									/>
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
