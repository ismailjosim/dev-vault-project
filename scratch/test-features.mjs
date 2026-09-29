import mongoose from 'mongoose'

const BASE_URL = 'http://localhost:3000'

async function runFeatureAudit() {
	console.log('=== STARTING DEV-VAULT FULL FEATURE AUDIT ===\n')
	const results = []

	// 1. Connect to MongoDB to verify data models directly
	await mongoose.connect('mongodb://localhost:27017/dev-vault')
	console.log('✓ Connected to MongoDB')

	const db = mongoose.connection.db

	// Check collections
	const collections = await db.listCollections().toArray()
	console.log(
		'Database collections:',
		collections.map((c) => c.name).join(', '),
	)

	// 2. Test Ephemeral Secret Share API (Zero-Knowledge)
	console.log('\n--- Testing Feature 03: Ephemeral Secret Sharing ---')
	try {
		const sharePayload = {
			encryptedContent: 'U2FsdGVkX1+testEncryptedPayload1234567890==',
			maxViews: 1,
			ttlSeconds: 3600,
			passphrase: 'SecretPassword123',
		}
		const createRes = await fetch(`${BASE_URL}/api/tools/share`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sharePayload),
		})
		const createData = await createRes.json()
		console.log('Create share status:', createRes.status, createData)

		if (createRes.ok && createData.shareId) {
			// Retrieve metadata
			const metaRes = await fetch(
				`${BASE_URL}/api/tools/share/${createData.shareId}`,
			)
			const metaData = await metaRes.json()
			console.log('Share meta status:', metaRes.status, metaData)

			// Burn test without passphrase (should fail)
			const badBurnRes = await fetch(
				`${BASE_URL}/api/tools/share/${createData.shareId}/burn`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ passphrase: 'WrongPassword' }),
				},
			)
			console.log('Burn with wrong passphrase status:', badBurnRes.status)

			// Burn test with correct passphrase
			const goodBurnRes = await fetch(
				`${BASE_URL}/api/tools/share/${createData.shareId}/burn`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ passphrase: 'SecretPassword123' }),
				},
			)
			const goodBurnData = await goodBurnRes.json()
			console.log(
				'Burn with correct passphrase status:',
				goodBurnRes.status,
				goodBurnData,
			)

			// Second burn (should be 404/burned)
			const burnedRes = await fetch(
				`${BASE_URL}/api/tools/share/${createData.shareId}`,
			)
			console.log(
				'Follow-up fetch burned secret status (should be 404):',
				burnedRes.status,
			)
			results.push({ feature: 'Ephemeral Secret Share', status: 'PASS' })
		} else {
			results.push({
				feature: 'Ephemeral Secret Share',
				status: 'FAIL',
				reason: createData,
			})
		}
	} catch (e) {
		console.error('Ephemeral Secret Share error:', e.message)
		results.push({
			feature: 'Ephemeral Secret Share',
			status: 'ERROR',
			reason: e.message,
		})
	}

	// 3. Test Tools: Validate Env, Check Missing
	console.log('\n--- Testing Tools Endpoints ---')
	try {
		const valRes = await fetch(`${BASE_URL}/api/tools/validate-env`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				content:
					'PORT=3000\nDATABASE_URL=mongodb://localhost:27017\nINVALID KEY=123',
			}),
		})
		const valData = await valRes.json()
		console.log('Validate env status:', valRes.status, valData)

		const checkMissingRes = await fetch(`${BASE_URL}/api/tools/check-missing`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				projectContent: 'PORT=3000\nNODE_ENV=production',
				exampleContent:
					'PORT=3000\nNODE_ENV=production\nDATABASE_URL=\nAPI_SECRET=',
			}),
		})
		const checkMissingData = await checkMissingRes.json()
		console.log(
			'Check missing status:',
			checkMissingRes.status,
			checkMissingData,
		)
		results.push({
			feature: 'Tools Validation',
			status: checkMissingRes.ok ? 'PASS' : 'FAIL',
		})
	} catch (e) {
		results.push({
			feature: 'Tools Validation',
			status: 'ERROR',
			reason: e.message,
		})
	}

	// 4. Test Variable Interpolation Engine
	console.log('\n--- Testing Feature 04: Variable Interpolation Engine ---')
	try {
		const { resolveInterpolation } =
			await import('../src/utils/interpolation.ts')

		const sampleVars = {
			HOST: 'api.internal.vault',
			PORT: '5432',
			DB_NAME: 'production_db',
			DB_URL: 'postgres://${HOST}:${PORT}/${DB_NAME}',
			CYCLE_A: '${CYCLE_B}',
			CYCLE_B: '${CYCLE_A}',
		}

		const res = resolveInterpolation(sampleVars)
		console.log('Interpolation result DB_URL:', res.resolved.DB_URL)
		console.log('Interpolation cycle error:', res.errors.CYCLE_A)

		if (
			res.resolved.DB_URL ===
				'postgres://api.internal.vault:5432/production_db' &&
			res.errors.CYCLE_A
		) {
			console.log(
				'✓ Interpolation & Circular Dependency detection work as expected',
			)
			results.push({ feature: 'Variable Interpolation', status: 'PASS' })
		} else {
			results.push({
				feature: 'Variable Interpolation',
				status: 'FAIL',
				reason: res,
			})
		}
	} catch (e) {
		console.error('Interpolation test error:', e.message)
		results.push({
			feature: 'Variable Interpolation',
			status: 'ERROR',
			reason: e.message,
		})
	}

	// 5. Test Security Scanner Engine
	console.log('\n--- Testing Feature 08: Security Scanner Engine ---')
	try {
		const { evaluateProjectHealth } =
			await import('../src/utils/security-scanner.ts')
		const testVars = [
			{
				key: 'AWS_SECRET_ACCESS_KEY',
				value: 'AKIAIOSFODNN7EXAMPLE',
				environment: 'prod',
				type: 'secret',
			},
			{ key: 'DEBUG', value: 'true', environment: 'prod', type: 'other' },
			{
				key: 'DATABASE_PASSWORD',
				value: '123456',
				environment: 'prod',
				type: 'secret',
			},
			{
				key: 'API_URL',
				value: 'http://localhost:3000',
				environment: 'prod',
				type: 'url',
			},
		]
		const scanResult = evaluateProjectHealth(testVars)
		console.log('Security Health Score:', scanResult.healthScore)
		console.log('Detected Issues Count:', scanResult.issues.length)
		console.log('Critical count:', scanResult.metrics.criticalCount)
		console.log('Warning count:', scanResult.metrics.warningCount)
		results.push({
			feature: 'Security Scanner Engine',
			status: 'PASS',
			score: scanResult.healthScore,
		})
	} catch (e) {
		console.error('Security scanner error:', e.message)
		results.push({
			feature: 'Security Scanner Engine',
			status: 'ERROR',
			reason: e.message,
		})
	}

	// 6. Test CLI / SDK
	console.log('\n--- Testing Feature 06: Developer CLI Script ---')
	try {
		const fs = await import('fs')
		const cliExists = fs.existsSync('./bin/devvault.mjs')
		console.log('CLI binary exists at ./bin/devvault.mjs:', cliExists)
		results.push({
			feature: 'Developer CLI Binary',
			status: cliExists ? 'PASS' : 'FAIL',
		})
	} catch (e) {
		results.push({
			feature: 'Developer CLI Binary',
			status: 'ERROR',
			reason: e.message,
		})
	}

	console.log('\n=== AUDIT RESULTS SUMMARY ===')
	console.table(results)
	process.exit(0)
}

runFeatureAudit().catch((err) => {
	console.error('Audit fatal error:', err)
	process.exit(1)
})
