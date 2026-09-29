export interface AuditLogItem {
	_id: string
	userEmail: string
	action: string
	targetKey?: string
	environment?: string
	ipAddress?: string
	userAgent?: string
	createdAt: string
}

export interface AuditLogTableProps {
	projectId: string
}
