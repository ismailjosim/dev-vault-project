'use client'

import { clientDecrypt } from '@/utils/clientCrypto'
import { useEffect, useState } from 'react'
import type { SecretMeta } from './types'

export function useSharedSecret(shareId: string) {
	const [key, setKey] = useState<string | null>(() => {
		if (typeof window !== 'undefined') {
			return window.location.hash.replace(/^#/, '') || null
		}
		return null
	})
	const [meta, setMeta] = useState<SecretMeta | null>(null)
	const [loading, setLoading] = useState(true)
	const [notFound, setNotFound] = useState(false)
	const [passphrase, setPassphrase] = useState('')
	const [decrypting, setDecrypting] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [decryptedContent, setDecryptedContent] = useState<string | null>(null)
	const [isMasked, setIsMasked] = useState(false)
	const [copied, setCopied] = useState(false)
	const [isBurned, setIsBurned] = useState(false)
	const [remainingViews, setRemainingViews] = useState<number | null>(null)

	useEffect(() => {
		async function fetchMeta() {
			try {
				const res = await fetch(`/api/tools/share/${shareId}`)
				if (!res.ok) {
					setNotFound(true)
					setLoading(false)
					return
				}
				const data: SecretMeta = await res.json()
				setMeta(data)
			} catch {
				setNotFound(true)
			} finally {
				setLoading(false)
			}
		}

		fetchMeta()
	}, [shareId])

	const handleReveal = async () => {
		setErrorMessage(null)
		setDecrypting(true)

		try {
			const res = await fetch(`/api/tools/share/${shareId}/burn`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ passphrase }),
			})

			const data = await res.json()

			if (!res.ok) {
				setErrorMessage(data.error || 'Failed to unlock secret')
				setDecrypting(false)
				return
			}

			if (!key) {
				setErrorMessage(
					'Encryption key is missing from the link URL fragment (#...). The sender must provide the full link.',
				)
				setDecrypting(false)
				return
			}

			// Decrypt zero-knowledge ciphertext client-side
			const plaintext = clientDecrypt(data.encryptedContent, key)
			setDecryptedContent(plaintext)
			setIsBurned(data.burned)
			setRemainingViews(data.remainingViews)
		} catch (err) {
			setErrorMessage(
				err instanceof Error
					? err.message
					: 'Decryption failed. Please check the encryption key.',
			)
		} finally {
			setDecrypting(false)
		}
	}

	const handleCopy = async () => {
		if (!decryptedContent) return
		try {
			await navigator.clipboard.writeText(decryptedContent)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			// Fallback copy
		}
	}

	return {
		key,
		setKey,
		meta,
		loading,
		notFound,
		passphrase,
		setPassphrase,
		decrypting,
		errorMessage,
		decryptedContent,
		isMasked,
		setIsMasked,
		copied,
		isBurned,
		remainingViews,
		handleReveal,
		handleCopy,
	}
}
