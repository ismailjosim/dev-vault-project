import CryptoJS from 'crypto-js'

/**
 * Generate a cryptographically secure 256-bit encryption key
 * Formatted as a URL-safe hex string
 */
export function generateClientKey(): string {
	return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex)
}

/**
 * Encrypt secret text client-side using AES-256
 */
export function clientEncrypt(text: string, key: string): string {
	try {
		return CryptoJS.AES.encrypt(text, key).toString()
	} catch (error) {
		console.error('Client encryption failed:', error)
		throw new Error('Failed to encrypt secret on client')
	}
}

/**
 * Decrypt ciphertext client-side using AES-256
 */
export function clientDecrypt(ciphertext: string, key: string): string {
	try {
		const bytes = CryptoJS.AES.decrypt(ciphertext, key)
		const decrypted = bytes.toString(CryptoJS.enc.Utf8)
		if (!decrypted) {
			throw new Error('Decryption resulted in empty payload')
		}
		return decrypted
	} catch (error) {
		console.error('Client decryption failed:', error)
		throw new Error(
			'Failed to decrypt secret. Please verify your encryption key.',
		)
	}
}
