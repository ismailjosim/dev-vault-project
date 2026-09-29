'use client'

import { CheckCircle2 } from 'lucide-react'
import { ConnectIntegrationModal } from './ConnectIntegrationModal'
import { ConnectorsGrid } from './ConnectorsGrid'
import { IntegrationsTable } from './IntegrationsTable'
import { useIntegrationsManager } from './useIntegrationsManager'
import type { IntegrationsManagerProps } from './types'

export function IntegrationsManager({
	projectId,
	initialIntegrations,
}: IntegrationsManagerProps) {
	const {
		integrations,
		isOpen,
		provider,
		name,
		setName,
		targetIdentifier,
		setTargetIdentifier,
		authToken,
		setAuthToken,
		syncingId,
		isLoading,
		error,
		syncSuccessMsg,
		openModal,
		closeModal,
		handleConnect,
		handleSync,
		handleDelete,
	} = useIntegrationsManager(projectId, initialIntegrations)

	return (
		<div className='space-y-8'>
			{syncSuccessMsg && (
				<div className='animate-in fade-in flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400'>
					<CheckCircle2 className='h-4 w-4 shrink-0' />
					<span>{syncSuccessMsg}</span>
				</div>
			)}

			<ConnectorsGrid onConnect={openModal} />

			<IntegrationsTable
				integrations={integrations}
				syncingId={syncingId}
				onSync={handleSync}
				onDelete={handleDelete}
			/>

			<ConnectIntegrationModal
				isOpen={isOpen}
				provider={provider}
				name={name}
				setName={setName}
				targetIdentifier={targetIdentifier}
				setTargetIdentifier={setTargetIdentifier}
				authToken={authToken}
				setAuthToken={setAuthToken}
				isLoading={isLoading}
				error={error}
				onClose={closeModal}
				onSubmit={handleConnect}
			/>
		</div>
	)
}
