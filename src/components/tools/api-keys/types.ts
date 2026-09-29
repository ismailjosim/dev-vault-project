export interface ApiKeyItem {
	_id: string
	name: string
	keyPrefix: string
	lastUsedAt?: string
	expiresAt?: string
	createdAt: string
}

export interface ApiKeysManagerProps {
	initialKeys: ApiKeyItem[]
}
