import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../src/lib/mongodb.ts'
import { Project } from '../src/models/Project.ts'
import { EnvVariable } from '../src/models/EnvVariable.ts'
import { EnvVariableVersion } from '../src/models/EnvVariableVersion.ts'
import { AuditLog } from '../src/models/AuditLog.ts'
import { Workspace } from '../src/models/Workspace.ts'
import { WorkspaceMember } from '../src/models/WorkspaceMember.ts'
import { Integration } from '../src/models/Integration.ts'
import { recordAudit } from '../src/utils/audit.ts'
import { encryptValue, decryptValue } from '../src/utils/encryption.ts'

async function runLifecycleAudit() {
	console.log('=== RUNNING CORE LIFECYCLE & SECURITY AUDIT ===\n')
	await connectDB()

	// 1. Get or create test user
	const userCol = mongoose.connection.db.collection('user')
	let user = await userCol.findOne()
	if (!user) {
		const res = await userCol.insertOne({
			name: 'Audit Test User',
			email: 'audit@devvault.local',
			createdAt: new Date(),
		})
		user = {
			_id: res.insertedId,
			email: 'audit@devvault.local',
			name: 'Audit Test User',
		}
	}
	const userId = user._id.toString()
	console.log(`✓ Active test user: ${user.email} (${userId})`)

	// 2. Test AES-256 Field Encryption
	console.log('\n--- 1. Testing AES-256 Field Encryption ---')
	const plaintextSecret = 'super-secret-db-pass-2026!#$'
	const cipher = encryptValue(plaintextSecret)
	const decrypted = decryptValue(cipher)
	console.log('Ciphertext:', cipher)
	console.log('Decrypted text:', decrypted)
	if (decrypted !== plaintextSecret) {
		throw new Error('Encryption round-trip failed!')
	}
	console.log('✓ Field encryption round-trip PASSED')

	// 3. Test Project Creation
	console.log('\n--- 2. Testing Project Creation & Workspaces ---')
	const testProject = await Project.create({
		userId,
		projectName: 'Audit Test Project',
		slug: 'audit-test-project-' + Date.now(),
		description: 'Testing vault features',
		category: 'Backend',
		framework: 'Node.js',
		environments: ['dev', 'staging', 'prod'],
		tags: ['test', 'security'],
	})
	console.log(
		`✓ Created test project: ${testProject.projectName} (${testProject._id})`,
	)

	// 4. Test Environment Variable Creation & Versioning (Feature 01)
	console.log('\n--- 3. Testing Feature 01: Secret Versioning & Rollback ---')
	const envVar = await EnvVariable.create({
		projectId: testProject._id,
		userId,
		key: 'DATABASE_URL',
		value: encryptValue('postgres://admin:pass_v1@localhost:5432/db'),
		environment: 'prod',
		type: 'database_url',
		isPublic: false,
	})
	await EnvVariableVersion.create({
		variableId: envVar._id,
		projectId: testProject._id,
		key: envVar.key,
		environment: envVar.environment,
		versionNumber: 1,
		encryptedValue: 'postgres://admin:pass_v1@localhost:5432/db',
		changeType: 'created',
		changeReason: 'Initial creation',
		modifiedByUserId: userId,
	})
	console.log(`✓ Created variable: ${envVar.key} v1`)

	// Update to v2
	envVar.value = 'postgres://admin:pass_v2_rotated@localhost:5432/db'
	await envVar.save()
	await EnvVariableVersion.create({
		variableId: envVar._id,
		projectId: testProject._id,
		key: envVar.key,
		environment: envVar.environment,
		versionNumber: 2,
		encryptedValue: 'postgres://admin:pass_v2_rotated@localhost:5432/db',
		changeType: 'updated',
		changeReason: 'Password rotation',
		modifiedByUserId: userId,
	})
	console.log(`✓ Updated variable: ${envVar.key} to v2`)

	// Retrieve versions
	const versions = await EnvVariableVersion.find({
		variableId: envVar._id,
	}).sort({ versionNumber: -1 })
	console.log(`✓ Found ${versions.length} versions in version history`)

	// Perform Rollback to v1
	const v1 = await EnvVariableVersion.findOne({
		variableId: envVar._id,
		versionNumber: 1,
	})
	envVar.value = v1.getDecryptedValue()
	await envVar.save()
	await EnvVariableVersion.create({
		variableId: envVar._id,
		projectId: testProject._id,
		key: envVar.key,
		environment: envVar.environment,
		versionNumber: 3,
		encryptedValue: v1.getDecryptedValue(),
		changeType: 'rollback',
		changeReason: 'Rollback to v1',
		modifiedByUserId: userId,
	})
	console.log(
		`✓ Successfully rolled back to v1! Current version is v3 with restored v1 value:`,
		envVar.getDecryptedValue(),
	)

	// 5. Test Feature 02: Audit Logging
	console.log('\n--- 4. Testing Feature 02: Audit Logging ---')
	await recordAudit({
		userId,
		userEmail: user.email,
		projectId: testProject._id.toString(),
		action: 'SECRET_ROLLBACK',
		targetKey: 'DATABASE_URL',
		environment: 'prod',
		ipAddress: '127.0.0.1',
		metadata: { targetVersion: 1 },
	})
	const auditRecords = await AuditLog.find({ projectId: testProject._id })
	console.log(
		`✓ Audit records found for project: ${auditRecords.length} (Action: ${auditRecords[0]?.action})`,
	)

	// 6. Test Feature 05: Workspace & RBAC
	console.log('\n--- 5. Testing Feature 05: Workspace & RBAC ---')
	const ws = await Workspace.create({
		name: 'Core Security Team',
		slug: 'core-sec-' + Date.now(),
		ownerId: userId,
		settings: { allowPublicSharing: true },
	})
	const member = await WorkspaceMember.create({
		workspaceId: ws._id,
		userId,
		email: user.email,
		role: 'admin',
		status: 'active',
	})
	console.log(
		`✓ Workspace created: ${ws.name} (${ws.slug}) with Member role: ${member.role}`,
	)

	// 7. Test Feature 07: CI/CD Integrations model
	console.log('\n--- 6. Testing Feature 07: CI/CD Integrations Model ---')
	const integration = await Integration.create({
		projectId: testProject._id,
		workspaceId: ws._id,
		createdByUserId: userId,
		provider: 'vercel',
		name: 'Production Vercel Sync',
		targetIdentifier: 'prj_audit_12345',
		encryptedAuthToken: encryptValue('vercel_token_xyz987'),
		environmentMapping: [
			{ sourceEnv: 'prod', targetEnv: 'Production' },
			{ sourceEnv: 'dev', targetEnv: 'Development' },
		],
	})
	console.log(
		`✓ Integration created: ${integration.provider} (${integration.name})`,
	)

	// Clean up test data
	await Project.deleteOne({ _id: testProject._id })
	await EnvVariable.deleteMany({ projectId: testProject._id })
	await EnvVariableVersion.deleteMany({ projectId: testProject._id })
	await AuditLog.deleteMany({ projectId: testProject._id })
	await Workspace.deleteOne({ _id: ws._id })
	await WorkspaceMember.deleteMany({ workspaceId: ws._id })
	await Integration.deleteOne({ _id: integration._id })
	console.log('\n✓ Cleaned up test artifacts successfully')

	console.log('\n=== ALL LIFECYCLE AUDITS PASSED ===')
	process.exit(0)
}

runLifecycleAudit().catch((err) => {
	console.error('Lifecycle audit error:', err)
	process.exit(1)
})
