export interface SecurityIssue {
	id: string
	variableKey: string
	environment: string
	severity: 'critical' | 'warning' | 'info'
	message: string
	recommendation: string
}

export interface SecurityScanResult {
	healthScore: number
	issues: SecurityIssue[]
	metrics: {
		totalVariables: number
		criticalCount: number
		warningCount: number
		infoCount: number
		averageEntropy: number
	}
}

const SIGNATURES = [
	{
		name: 'AWS Access Key ID',
		regex: /^AKIA[0-9A-Z]{16}$/,
		severity: 'critical' as const,
		recommendation:
			'Ensure this live AWS credential is restricted with least privilege IAM policies.',
	},
	{
		name: 'Stripe Live Secret Key',
		regex: /^sk_live_[0-9a-zA-Z]{24,}$/,
		severity: 'critical' as const,
		recommendation:
			'Stripe live production secret detected. Never share or commit this key.',
	},
	{
		name: 'GitHub Personal Access Token',
		regex: /^ghp_[0-9a-zA-Z]{36}$/,
		severity: 'critical' as const,
		recommendation:
			'GitHub PAT detected. Use fine-grained tokens with minimal repository permissions.',
	},
	{
		name: 'Google Cloud / Maps API Key',
		regex: /^AIza[0-9A-Za-z\-_]{35}$/,
		severity: 'warning' as const,
		recommendation:
			'Add HTTP referrer or IP restrictions to this Google API key in Google Cloud Console.',
	},
	{
		name: 'Private RSA / SSH Key',
		regex: /-----BEGIN (RSA|OPENSSH|EC|DSA)?\s?PRIVATE KEY-----/,
		severity: 'critical' as const,
		recommendation:
			'Private key detected. Ensure this key is protected and not checked into public repositories.',
	},
	{
		name: 'Slack Bot Token',
		regex: /^xoxb-[0-9]{10,}-[0-9]{10,}-[a-zA-Z0-9]{24}$/,
		severity: 'warning' as const,
		recommendation: 'Slack bot token detected. Rotate if exposed.',
	},
]

const WEAK_VALUES = new Set([
	'secret',
	'secret123',
	'admin',
	'password',
	'123456',
	'12345678',
	'root',
	'development',
	'test',
	'changeme',
	'default',
])

/**
 * Calculates the Shannon Entropy of a string (in bits per character).
 * Higher entropy indicates higher cryptographic randomness.
 */
export function calculateEntropy(str: string): number {
	const len = str.length
	if (len === 0) return 0

	const frequencies: Record<string, number> = {}
	for (const char of str) {
		frequencies[char] = (frequencies[char] || 0) + 1
	}

	return Object.values(frequencies).reduce((entropy, count) => {
		const p = count / len
		return entropy - p * Math.log2(p)
	}, 0)
}

/**
 * Scans a single environment variable for security leaks, weak entropy, and misconfigurations.
 */
export function scanVariable(
	key: string,
	value: string,
	environment: string,
	type: string,
): SecurityIssue[] {
	const issues: SecurityIssue[] = []
	const lowerVal = (value || '').toLowerCase().trim()

	// 1. Check for localhost / loopback in production
	if (
		environment === 'prod' &&
		(value.includes('localhost') || value.includes('127.0.0.1'))
	) {
		issues.push({
			id: `${key}_localhost_prod`,
			variableKey: key,
			environment,
			severity: 'critical',
			message: 'Localhost loopback address detected in Production environment.',
			recommendation:
				'Replace with your live production domain, cluster IP, or cloud service endpoint.',
		})
	}

	// 2. Check for dev debug flags in production
	if (environment === 'prod') {
		if (key === 'DEBUG' && lowerVal === 'true') {
			issues.push({
				id: `${key}_debug_true`,
				variableKey: key,
				environment,
				severity: 'warning',
				message: 'DEBUG=true is active in the Production environment.',
				recommendation:
					'Disable debug mode in production to avoid stack trace leaks.',
			})
		}
		if (key === 'NODE_ENV' && lowerVal === 'development') {
			issues.push({
				id: `${key}_node_env_dev`,
				variableKey: key,
				environment,
				severity: 'warning',
				message: 'NODE_ENV is set to development in Production environment.',
				recommendation:
					'Set NODE_ENV=production to optimize build performance and security.',
			})
		}
	}

	// 3. Known weak passwords / defaults
	if (
		WEAK_VALUES.has(lowerVal) &&
		['secret', 'jwt', 'api_key', 'other'].includes(type)
	) {
		issues.push({
			id: `${key}_weak_val`,
			variableKey: key,
			environment,
			severity: 'critical',
			message: `Default or trivial value ('${value}') detected.`,
			recommendation:
				'Use the built-in Password or JWT generator to create an unguessable high-entropy secret.',
		})
	}

	// 4. Secret length & Shannon entropy
	if (['secret', 'jwt'].includes(type)) {
		if (value.length > 0 && value.length < 16) {
			issues.push({
				id: `${key}_short_secret`,
				variableKey: key,
				environment,
				severity: 'warning',
				message: `Secret length (${value.length} chars) is under 16 characters.`,
				recommendation:
					'Use 32 or 64 characters for cryptographic secrets to protect against brute-force attacks.',
			})
		} else if (value.length >= 8) {
			const entropy = calculateEntropy(value)
			if (entropy < 2.5) {
				issues.push({
					id: `${key}_low_entropy`,
					variableKey: key,
					environment,
					severity: 'warning',
					message: `Low Shannon entropy score (${entropy.toFixed(2)} bits/char). Repetitive or predictable pattern.`,
					recommendation:
						'Generate a random cryptographic string with diverse alphanumeric characters.',
				})
			}
		}
	}

	// 5. Pattern signatures
	for (const sig of SIGNATURES) {
		if (sig.regex.test(value)) {
			issues.push({
				id: `${key}_pattern_${sig.name.replace(/\s+/g, '_')}`,
				variableKey: key,
				environment,
				severity: sig.severity,
				message: `${sig.name} pattern detected.`,
				recommendation: sig.recommendation,
			})
		}
	}

	return issues
}

/**
 * Runs a complete diagnostic scan on all project variables.
 */
export function evaluateProjectHealth(
	variables: Array<{
		key: string
		value: string
		environment: string
		type: string
	}>,
): SecurityScanResult {
	const allIssues: SecurityIssue[] = []
	let totalEntropy = 0
	let secretCount = 0

	for (const v of variables) {
		const issues = scanVariable(v.key, v.value, v.environment, v.type)
		allIssues.push(...issues)

		if (v.value) {
			totalEntropy += calculateEntropy(v.value)
			secretCount += 1
		}
	}

	const criticalCount = allIssues.filter(
		(i) => i.severity === 'critical',
	).length
	const warningCount = allIssues.filter((i) => i.severity === 'warning').length
	const infoCount = allIssues.filter((i) => i.severity === 'info').length

	// Health score calculation
	let score = 100
	score -= criticalCount * 20
	score -= warningCount * 5
	score = Math.max(0, Math.min(100, score))

	const averageEntropy =
		secretCount > 0 ? Number((totalEntropy / secretCount).toFixed(2)) : 0

	return {
		healthScore: score,
		issues: allIssues,
		metrics: {
			totalVariables: variables.length,
			criticalCount,
			warningCount,
			infoCount,
			averageEntropy,
		},
	}
}
