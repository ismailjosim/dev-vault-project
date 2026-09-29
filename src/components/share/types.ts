export interface SharedSecretViewerProps {
	shareId: string
}

export interface SecretMeta {
	exists: boolean
	requiresPassphrase: boolean
	maxViews: number
	currentViews: number
	expiresAt: string
	createdAt?: string
}
