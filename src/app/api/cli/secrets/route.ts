import { handleApiError } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { ApiKey } from '@/models/ApiKey'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import { WorkspaceMember } from '@/models/WorkspaceMember'
import { recordAudit } from '@/utils/audit'
import { decryptValue, hashValue } from '@/utils/encryption'
import { resolveInterpolation } from '@/utils/interpolation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		await connectDB()

		let userId: string | null = null
		let userEmail: string = 'cli-agent@devvault.local'
		let authType: 'api_key' | 'session' = 'api_key'

		const authHeader = request.headers.get('authorization')
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const rawToken = authHeader.replace('Bearer ', '').trim()
			const hashed = hashValue(rawToken)

			const keyDoc = await ApiKey.findOne({ hashedKey: hashed })
			if (!keyDoc) {
				return NextResponse.json(
					{ error: 'Invalid or revoked API Key' },
					{ status: 401 },
				)
			}

			if (keyDoc.expiresAt && new Date(keyDoc.expiresAt) < new Date()) {
				return NextResponse.json(
					{ error: 'API Key has expired' },
					{ status: 401 },
				)
			}

			userId = keyDoc.userId
			keyDoc.lastUsedAt = new Date()
			await keyDoc.save()
		} else {
			// Fallback to session if authenticated in browser
			const sessionUser = await getCurrentUser()
			if (sessionUser?.id) {
				userId = sessionUser.id
				userEmail = sessionUser.email || userEmail
				authType = 'session'
			}
		}

		if (!userId) {
			return NextResponse.json(
				{
					error:
						'Unauthorized. Provide an API key via Bearer token in the Authorization header.',
				},
				{ status: 401 },
			)
		}

		const { searchParams } = new URL(request.url)
		const projectId = searchParams.get('projectId')
		const projectName = searchParams.get('projectName')
		const projectSlug = searchParams.get('slug')
		const environment = searchParams.get('environment') || 'dev'

		// Look up project
		let project = null
		if (projectId) {
			project = await Project.findById(projectId)
		} else if (projectSlug) {
			project = await Project.findOne({ slug: projectSlug })
		} else if (projectName) {
			project = await Project.findOne({ projectName })
		} else {
			return NextResponse.json(
				{
					error:
						'Missing project identifier. Provide projectId, slug, or projectName.',
				},
				{ status: 400 },
			)
		}

		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		// Access control: verify user owns project or belongs to project's workspace
		const isProjectOwner = project.userId === userId
		let isAuthorized = isProjectOwner

		if (!isAuthorized && project.workspaceId) {
			const member = await WorkspaceMember.findOne({
				workspaceId: project.workspaceId,
				userId,
			})
			if (member) {
				// Check environment permission
				if (
					member.allowedEnvironments &&
					member.allowedEnvironments.includes(environment)
				) {
					isAuthorized = true
				}
			}
		}

		if (!isAuthorized) {
			return NextResponse.json(
				{
					error: `Access denied. You do not have permissions for environment '${environment}' in this project.`,
				},
				{ status: 403 },
			)
		}

		// Fetch secrets
		const variables = await EnvVariable.find({
			projectId: project._id,
			environment,
		})

		const decryptedMap: Record<string, string> = {}
		for (const v of variables) {
			try {
				decryptedMap[v.key] = decryptValue(v.encryptedValue)
			} catch {
				decryptedMap[v.key] = ''
			}
		}

		// Resolve interpolations (${VAR})
		const interpolationResult = resolveInterpolation(decryptedMap)

		// Record audit
		await recordAudit({
			userId,
			userEmail,
			action: 'ENV_EXPORT',
			projectId: project._id,
			projectName: project.projectName,
			environment,
			metadata: {
				channel: 'CLI',
				authType,
				variableCount: variables.length,
			},
			request,
		})

		return NextResponse.json({
			project: {
				id: project._id.toString(),
				name: project.projectName,
				slug: project.slug,
			},
			environment,
			secrets: interpolationResult.resolved,
			dependencies: interpolationResult.dependencies,
			errors: interpolationResult.errors,
		})
	} catch (error) {
		return handleApiError(error)
	}
}
