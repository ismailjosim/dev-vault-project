# Feature Specification: Secret Leak Scanner & Health Diagnostics

- **Status**: Proposed
- **Priority**: P2 (Medium)
- **Target Component**: Security Diagnostics, Code Scanning & Dashboard Widgets

---

## 1. Problem Statement

Developers frequently commit common mistakes:

- Reusing default or weak credentials in production (e.g. `JWT_SECRET=secret123`, `ADMIN_PASSWORD=admin`).
- Accidentally storing sensitive production credentials in public repositories or pasting live private keys into general project notes.
- Letting credentials expire without noticing until outages occur.

DevVault currently has a basic `.env.example` key diff tool, but lacks **proactive security diagnostics**, entropy analysis, and leak pattern detection.

---

## 2. Key Security Diagnostic Capabilities

1. **Shannon Entropy Analysis**:
   - Calculates the randomness score of keys marked as `secret`, `jwt`, or `api_key`.
   - Flags low-entropy values (e.g. repetitive characters, dictionary words).
2. **Secret Signature Pattern Matching**:
   - Scans variables against known credential regex patterns:
     - AWS Access Key (`AKIA[0-9A-Z]{16}`)
     - GitHub Personal Access Token (`ghp_[0-9a-zA-Z]{36}`)
     - Stripe Secret Key (`sk_live_[0-9a-zA-Z]{24}`)
     - Private RSA/SSH Keys (`-----BEGIN RSA PRIVATE KEY-----`)
     - Google API Key (`AIza[0-9A-Za-z\\-_]{35}`)
3. **Environment Misconfiguration Detection**:
   - Detects `localhost` or `127.0.0.1` URLs configured in the `prod` environment.
   - Detects development flags (`DEBUG=true`, `NODE_ENV=development`) saved in `prod`.
4. **Project Security Health Score (0-100%)**:
   - Weighted score based on entropy, active expirations, public variable count, and pattern safety.

---

## 3. Algorithmic Design: Pattern Scanner & Health Evaluator

### Health Evaluator (`src/utils/security-scanner.ts`)

```typescript
export interface SecurityIssue {
	variableKey: string
	environment: string
	severity: 'critical' | 'warning' | 'info'
	message: string
	recommendation: string
}

const SIGNATURES = [
	{
		name: 'AWS Access Key ID',
		regex: /^AKIA[0-9A-Z]{16}$/,
		severity: 'critical' as const,
	},
	{
		name: 'Stripe Live Secret Key',
		regex: /^sk_live_[0-9a-zA-Z]{24,}$/,
		severity: 'critical' as const,
	},
	{
		name: 'GitHub Personal Access Token',
		regex: /^ghp_[0-9a-zA-Z]{36}$/,
		severity: 'critical' as const,
	},
]

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

export function scanVariable(
	key: string,
	value: string,
	environment: string,
	type: string,
): SecurityIssue[] {
	const issues: SecurityIssue[] = []

	// Check for localhost in prod
	if (
		environment === 'prod' &&
		(value.includes('localhost') || value.includes('127.0.0.1'))
	) {
		issues.push({
			variableKey: key,
			environment,
			severity: 'critical',
			message: 'Localhost address detected in Production environment.',
			recommendation:
				'Replace with your live production domain or service URL.',
		})
	}

	// Check entropy for secrets
	if (['secret', 'jwt'].includes(type) && value.length < 16) {
		issues.push({
			variableKey: key,
			environment,
			severity: 'warning',
			message: 'Secret key length is under 16 characters.',
			recommendation:
				'Use the built-in JWT / Password generator to create a 32+ char secret.',
		})
	}

	return issues
}
```

---

## 4. UI/UX Workflow

1. **Project Health Widget**:
   - Displayed at the top of `/dashboard/projects/[id]`.
   - Circular progress ring showing the project **Security Score** (e.g., `85/100`).
2. **Diagnostics Tab** (`/dashboard/projects/[id]/security`):
   - Categorized cards for `Critical`, `Warnings`, and `Recommendations`.
   - One-click "Fix" action (e.g. opens the password generator or prompts for replacement).
3. **Weekly Security Health Summary**:
   - Optional email notification highlighting pending expired credentials or low-entropy secrets.
