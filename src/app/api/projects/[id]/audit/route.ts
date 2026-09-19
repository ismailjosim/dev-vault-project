import { handleApiError, requireUserId, serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { AuditLog } from '@/models/AuditLog'
import { Project } from '@/models/Project'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
	params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
	try {
		const { userId, response } = await requireUserId()
		if (response) return response

		await connectDB()
		const { id } = await context.params
		const project = await Project.findOne({ _id: id, userId })

		if (!project) {
			return NextResponse.json(
				{ message: 'Project not found' },
				{ status: 404 },
			)
		}

		const searchParams = request.nextUrl.searchParams
		const page = Math.max(
			Number.parseInt(searchParams.get('page') || '1', 10),
			1,
		)
		const limit = Math.min(
			Math.max(Number.parseInt(searchParams.get('limit') || '50', 10), 1),
			100,
		)
		const action = searchParams.get('action')
		const environment = searchParams.get('environment')
		const search = searchParams.get('search')
		const format = searchParams.get('format')

		const filter: Record<string, unknown> = { projectId: project._id }

		if (action && action !== 'ALL') {
			filter.action = action
		}

		if (environment && environment !== 'all') {
			filter.environment = environment
		}

		if (search) {
			filter.$or = [
				{ targetKey: { $regex: search, $options: 'i' } },
				{ userEmail: { $regex: search, $options: 'i' } },
			]
		}

		// Handle CSV Export
		if (format === 'csv') {
			const allLogs = await AuditLog.find(filter)
				.sort({ createdAt: -1 })
				.limit(1000)

			const csvHeader =
				'Timestamp,User Email,Action,Variable Key,Environment,IP Address,User Agent\n'
			const csvRows = allLogs
				.map((log) => {
					const timestamp = `"${new Date(log.createdAt).toISOString()}"`
					const email = `"${log.userEmail || ''}"`
					const act = `"${log.action}"`
					const key = `"${log.targetKey || ''}"`
					const env = `"${log.environment || ''}"`
					const ip = `"${log.ipAddress || ''}"`
					const ua = `"${(log.userAgent || '').replace(/"/g, '""')}"`
					return [timestamp, email, act, key, env, ip, ua].join(',')
				})
				.join('\n')

			return new NextResponse(csvHeader + csvRows, {
				headers: {
					'Content-Type': 'text/csv; charset=utf-8',
					'Content-Disposition': `attachment; filename="${project.slug}-audit-log.csv"`,
				},
			})
		}

		const total = await AuditLog.countDocuments(filter)
		const logs = await AuditLog.find(filter)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit)

		return NextResponse.json({
			success: true,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			logs: serializeDocument(logs),
		})
	} catch (error) {
		return handleApiError(error)
	}
}
