'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import type { SecretVersion } from './types'

export function useSecretHistory(
	projectId: string,
	variableId: string,
	variableKey: string,
	isOpen: boolean,
	onClose: () => void,
) {
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

	const handleClose = () => {
		setRevealedVersions({})
		setComparingVersion(null)
		setIsLoading(true)
		onClose()
	}

	const toggleReveal = (versionNumber: number, value: string | null) => {
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

	const copyToClipboard = async (text: string, id: string) => {
		await navigator.clipboard.writeText(text)
		setCopiedValue(id)
		setTimeout(() => setCopiedValue(null), 1500)
	}

	const handleRollback = async (targetVersionNumber: number) => {
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

	return {
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
	}
}
