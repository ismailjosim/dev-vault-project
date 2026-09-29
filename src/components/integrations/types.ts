export type IntegrationProvider = 'vercel' | 'github' | 'webhook'

export interface IntegrationEnvironmentMapping {
	sourceEnv: string
	targetEnv: string
}

export interface IntegrationItem {
	_id: string
	provider: IntegrationProvider
	name: string
	targetIdentifier: string
	environmentMapping: IntegrationEnvironmentMapping[]
	isActive: boolean
	lastSyncAt?: string
	lastSyncStatus?: 'success' | 'failed'
	lastSyncError?: string
	createdAt: string
}

export interface IntegrationsManagerProps {
	projectId: string
	initialIntegrations: IntegrationItem[]
}
