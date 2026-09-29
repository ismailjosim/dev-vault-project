'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ApiKeyItem } from './types'

export function useApiKeysManager(initialKeys: ApiKeyItem[]) {
	const router = useRouter()
	const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys)
	const [isOpen, setIsOpen] = useState(false)
	const [name, setName] = useState('')
	const [expiresInDays, setExpiresInDays] = useState<number | null>(30)
	const [isLoading, setIsLoading] = useState(false)
	const [createdToken, setCreatedToken] = useState<string | null>(null)
	const [hasCopied, setHasCopied] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const openModal = () => {
		setCreatedToken(null)
		setName('')
		setError(null)
		setIsOpen(true)
	}

	const closeModal = () => {
		setIsOpen(false)
		setCreatedToken(null)
		setError(null)
	}

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

	return {
		keys,
		isOpen,
		name,
		setName,
		expiresInDays,
		setExpiresInDays,
		isLoading,
		createdToken,
		hasCopied,
		error,
		openModal,
		closeModal,
		handleCreate,
		handleRevoke,
		copyToClipboard,
	}
}
