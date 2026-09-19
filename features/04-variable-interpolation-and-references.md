# Feature Specification: Variable Interpolation & References

- **Status**: Proposed
- **Priority**: P1 (High)
- **Target Component**: Environment Parser, Exporter & UI

---

## 1. Problem Statement

Real-world application configurations frequently depend on other configuration values. For example:

- `PORT=5000`
- `HOST=localhost`
- `API_URL=http://${HOST}:${PORT}/api`
- `DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`

Currently, DevVault treats all variable values as static strings. If a developer changes `PORT` from `5000` to `8080`, they must manually locate and update every compound variable (`API_URL`, `CORS_ORIGIN`, `CALLBACK_URL`), introducing human error and configuration drift.

In tools like **Doppler** and **Infisical**, variable interpolation (`${VAR_NAME}`) is standard, allowing values to reference other keys within the same environment or across environments.

---

## 2. User Stories

1. **As a Developer**, I want to compose variables using `${OTHER_VAR}` syntax so I only have to update values in one place (Single Source of Truth).
2. **As a Developer**, I want the UI to display both the raw template (`${HOST}:${PORT}`) and the resolved runtime value (`localhost:5000`).
3. **As a Developer**, I want immediate error notifications if I inadvertently create circular references (e.g. `A=${B}` and `B=${A}`).

---

## 3. Algorithmic Design: Dependency Resolution & Cycle Detection

### Interpolation Resolver (`src/utils/interpolation.ts`)

```typescript
export type VariableMap = Record<string, string>

export interface InterpolationResult {
	resolved: VariableMap
	errors: Record<string, string>
}

export function resolveInterpolation(
	variables: VariableMap,
): InterpolationResult {
	const resolved: VariableMap = {}
	const errors: Record<string, string> = {}
	const visiting = new Set<string>()
	const visited = new Set<string>()

	function resolveKey(key: string): string {
		if (visiting.has(key)) {
			errors[key] = `Circular dependency detected involving ${key}`
			return `\${${key}}`
		}
		if (visited.has(key)) {
			return resolved[key]
		}

		visiting.add(key)
		const rawValue = variables[key] || ''

		// Replace ${VAR} or $VAR patterns
		const evaluated = rawValue.replace(
			/\$\{([a-zA-Z0-9_]+)\}/g,
			(_, referencedKey) => {
				if (variables[referencedKey] !== undefined) {
					return resolveKey(referencedKey)
				}
				errors[key] = `Referenced variable \${${referencedKey}} is missing`
				return `\${${referencedKey}}`
			},
		)

		visiting.delete(key)
		visited.add(key)
		resolved[key] = evaluated
		return evaluated
	}

	for (const key of Object.keys(variables)) {
		if (!visited.has(key)) {
			resolveKey(key)
		}
	}

	return { resolved, errors }
}
```

---

## 4. UI/UX Workflow

1. **Inline Variable Autocomplete**:
   - While typing in the value input of `EnvVariableForm.tsx`, typing `$` or `${` triggers an autocomplete dropdown of available keys in that project/environment.
2. **Preview Badge**:
   - Variables containing `${...}` show a "Resolved Preview" pill below the input.
   - Example: Input `${APP_URL}/auth` displays `Preview: https://api.myapp.com/auth`.
3. **Cycle Warning Indicator**:
   - In the table list, any detected circular dependencies are highlighted with a red warning badge and an explanatory tooltip.
4. **Export Options**:
   - When exporting (to `.env`, JSON, or YAML), provide a toggle:
     - **Export Raw**: Keeps `${HOST}:${PORT}` (ideal for Docker / Docker Compose / Kubernetes).
     - **Export Resolved**: Injects the final evaluated strings (ideal for production deployment bundles).
