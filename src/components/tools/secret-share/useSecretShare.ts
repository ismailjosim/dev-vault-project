'use client'

import { clientEncrypt, generateClientKey } from '@/utils/clientCrypto'
import { useState } from 'react'

export function useSecretShare() {
	const [secretText, setSecretText] = useState('')
	const [ttlSeconds, setTtlSeconds] = useState(3600) // 1 hour default
	const [maxViews, setMaxViews] = useState(1) // 1 view burn default
	const [usePassphrase, setUsePassphrase] = useState(false)
	const [passphrase, setPassphrase] = useState('')
	const [isMasked, setIsMasked] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [shareUrl, setShareUrl] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)

	const handleGenerateLink = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!secretText.trim()) {
			setError('Please enter a secret value to share.')
			return
		}

		setLoading(true)
		setError(null)

		try {
			// 1. Generate random 256-bit client encryption key
			const clientKey = generateClientKey()

			// 2. Encrypt locally in browser
			const encryptedContent = clientEncrypt(secretText, clientKey)

			// 3. Send only ciphertext and metadata to server
			const res = await fetch('/api/tools/share', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					encryptedContent,
					maxViews,
					ttlSeconds,
					passphrase: usePassphrase ? passphrase.trim() : undefined,
				}),
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || 'Failed to create ephemeral share')
			}

			// 4. Construct zero-knowledge URL with key in fragment hash (#)
			const origin =
				typeof window !== 'undefined'
					? window.location.origin
					: 'https://devvault.app'
			const generatedLink = `${origin}/share/${data.shareId}#${clientKey}`
			setShareUrl(generatedLink)
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An unexpected error occurred.',
			)
		} finally {
			setLoading(false)
		}
	}

	const handleCopy = async () => {
		if (!shareUrl) return
		try {
			await navigator.clipboard.writeText(shareUrl)
			setCopied(true)
			setTimeout(() => setCopied(false), 2500)
		} catch {
			// Fallback
		}
	}

	const handleReset = () => {
		setSecretText('')
		setShareUrl(null)
		setPassphrase('')
		setUsePassphrase(false)
		setError(null)
	}

	return {
		secretText,
		setSecretText,
		ttlSeconds,
		setTtlSeconds,
		maxViews,
		setMaxViews,
		usePassphrase,
		setUsePassphrase,
		passphrase,
		setPassphrase,
		isMasked,
		setIsMasked,
		loading,
		error,
		shareUrl,
		copied,
		handleGenerateLink,
		handleCopy,
		handleReset,
	}
}
