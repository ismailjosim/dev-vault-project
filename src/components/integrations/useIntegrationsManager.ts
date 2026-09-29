'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { IntegrationItem, IntegrationProvider } from './types'

export function useIntegrationsManager(
	projectId: string,
	initialIntegrations: IntegrationItem[],
) {
	const router = useRouter()
	const [integrations, setIntegrations] =
		useState<IntegrationItem[]>(initialIntegrations)
	const [isOpen, setIsOpen] = useState(false)
	const [provider, setProvider] = useState<IntegrationProvider>('vercel')
	const [name, setName] = useState('')
	const [targetIdentifier, setTargetIdentifier] = useState('')
	const [authToken, setAuthToken] = useState('')
	const [syncingId, setSyncingId] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null)

	const openModal = (selectedProvider: IntegrationProvider) => {
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

	const closeModal = () => {
		setIsOpen(false)
		setError(null)
	}

	const handleConnect = async (e: React.FormEvent) => {
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

	const handleSync = async (integrationId: string) => {
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

	return {
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
	}
}
