export type SecretVersionChangeType =
	| 'created'
	| 'updated'
	| 'deleted'
	| 'rollback'

export interface SecretVersion {
	_id: string
	versionNumber: number
	changeType: SecretVersionChangeType
	changeReason?: string
	createdAt: string
	modifiedByUserId: string
	value?: string | null
}

export interface SecretHistoryModalProps {
	projectId: string
	variableId: string
	variableKey: string
	environment: string
	isOpen: boolean
	onClose: () => void
}
