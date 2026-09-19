import { NextRequest } from 'next/server'
import { Types } from 'mongoose'
import { AuditLog, AuditActionType } from '@/models/AuditLog'

export function getClientIp(request?: NextRequest): string {
	if (!request) return 'internal'
	const forwarded = request.headers.get('x-forwarded-for')
	if (forwarded) return forwarded.split(',')[0].trim()
	const realIp = request.headers.get('x-real-ip')
	if (realIp) return realIp
	return '127.0.0.1'
}

export function getUserAgent(request?: NextRequest): string {
	if (!request) return 'internal'
	return request.headers.get('user-agent') || 'unknown'
}

export async function recordAudit({
	userId,
	userEmail,
	action,
	projectId,
	projectName,
	targetKey,
	environment,
	ipAddress,
	userAgent,
	metadata = {},
	request,
}: {
	userId: string
	userEmail: string
	action: AuditActionType
	projectId?: Types.ObjectId | string
	projectName?: string
	targetKey?: string
	environment?: string
	ipAddress?: string
	userAgent?: string
	metadata?: Record<string, unknown>
	request?: NextRequest
}) {
	try {
		const ip = ipAddress || getClientIp(request)
		const ua = userAgent || getUserAgent(request)

		return await AuditLog.create({
			userId,
			userEmail,
			action,
			projectId: projectId ? new Types.ObjectId(projectId) : undefined,
			projectName,
			targetKey,
			environment,
			ipAddress: ip,
			userAgent: ua,
			metadata,
		})
	} catch (error) {
		console.error('Failed to record audit log:', error)
	}
}
